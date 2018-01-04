const route = require("express").Router();
const Timer=require("timer.js");
const fs=require('fs');
const path = require("path");

//Import MongoDB models
const models = require("../models/mongodb/mongo");

//Import HELPERS
const HELPERS = require("../helpers");

//Import multer module
const multer = require('multer');



    let Storage = multer.diskStorage({
        destination:  './public_html/Images',
        filename: function (req, file, callback ){
            callback(null, file.originalname);
        }
    });
    let upload = multer({ storage: Storage });




//Items default page
route.get("/", (req,res) => {
    res.render("items");
});

//Return all the products
route.get('/all',function (req,res) {
    console.log("showing products");

    models.Products.find({})
        .then((productlist)=>{
            res.send(productlist)
        })
        .catch((err)=>{
            console.error(err)
        })
});


//Render Add Item page
route.get("/add", HELPERS.checkLoggedIn ,(req,res) => {
    res.render("additem");
});

//Post route to add products to DB
route.post('/add' ,HELPERS.checkLoggedIn ,upload.single('imgUploader'),function (req,res) {
    console.log("ADD: ",req.user);
    models.Products.create({
        userID: req.user.id,
        name: req.body.productname,
        desc: req.body.desc,
        category: req.body.category,
        basevalue: req.body.basevalue,
        duration: req.body.duration
    })
        .then((item)=>{
            fs.rename(path.join(__dirname,"../", "public_html/Images/",req.file.filename),path.join(__dirname,"../", "public_html/Images/",item._id+".jpg"),(err)=>{console.log(err);})
            models.Bids.create({
                ProdID: item._id,
                isOpen: true,
                allBids: []
            })
                .then(()=>{
                    res.redirect('/items/add');
                    var myTimer = new Timer({
                        tick    : 1,
                        // ontick  : function(sec) { console.log(sec + ' seconds left') },
                        onstart : function() { console.log('timer started') },
                        onstop  : function() { console.log('timer stop'); },
                        onpause : function() { console.log('timer set on pause') },
                        onend   : function() {
                            console.log(item._id);

                            models.Bids.updateOne(
                                {
                                    "ProdID" : item._id
                                }
                                ,
                                {
                                    $set: {
                                        "isOpen" : false
                                    }
                                }
                            ).then(function (data) {
                                console.log("bid timed out")
                            });
                            console.log('timer ended normally');
                        }
                    });
                    myTimer.start(item.duration*60*60);
                })
                .catch((err)=>{
                    console.log(err);
                })
        })
        .catch((err)=>{
            console.error(err)
        })
});

//create a bid
route.post("/:id/bid",HELPERS.checkLoggedIn ,(req,res)=>{
    console.log(req.params.id);
    models.Bids.findOneAndUpdate(
        {
            ProdID:req.params.id,
            isOpen:true
        },
        {
            $push: {
                allBids: {
                    userID: req.user.id,
                    price: req.body.bidprice,
                    time: new Date()
                }
            }
        }
    )
        .then( (item)=>{
            console.log("ItemInBids:",item);
            res.redirect('/items/' + req.params.id);
        })
        .catch((err)=>{
            console.log(err);
            res.send({
                message: "error finding item"
            });
        })
});

//Get item details
route.get("/:id", (req,res)=>{
    models.Products.findById(req.params.id,{
        // _id: 0
    })
        .then( (item)=>{
            models.Bids.find({
                ProdID:item.id
            })
                .then((itembid)=>{
                    //to compute minimum bid allowed
                    var minbid=item.basevalue;
                    //selecting base value as minimum value
                    console.log(itembid);
                    (itembid[0].allBids).forEach(function (data) {
                        if(minbid<data.price){
                            minbid=data.price;
                        }
                    }
                    );
                    console.log(minbid);
                    console.log("Item:",item);
                    res.render("item-details", {
                        item: item,
                        minbid:minbid
                    });
                });
        })
        .catch((err)=>{
            console.log(err);
            res.send({
                message: "error finding item"
            });
        })
});
module.exports = route;
