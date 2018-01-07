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
route.get("/", (req, res) => {
    res.render("items");
});

//Return all the products
route.get('/all', function (req, res) {
    // console.log("showing products");
    models.Products.find({})
        .then((productlist) => {
            res.send(productlist)
        })
        .catch((err) => {
            console.error(err)
        })
});

//Render Add Item page
route.get("/add", HELPERS.checkLoggedIn, (req, res) => {
    res.render("additem");
});


//Post route to add products to DB
route.post('/add', HELPERS.checkLoggedIn, upload.single('imgUploader'), function (req, res) {
    console.log("ADD: ", req.user);
    models.Products.create({
        userID: req.user.id,
        name: req.body.productname,
        desc: req.body.desc,
        category: req.body.category,
        basevalue: req.body.basevalue,
        duration: req.body.duration
    })
        .then((item)=>{
            fs.rename(path.join(__dirname,"../", "public_html/Images/",req.file.filename),path.join(__dirname,"../", "public_html/Images/",item._id+".jpg"),(err)=>{console.log(err);});

            models.Bids.create({
                ProdID: item._id,
                isOpen: true,
                allBids: []
            })
                .then(() => {
                    res.redirect('/items/add');
                    var myTimer = new Timer({
                        tick    : 1,
                        // ontick  : function(sec) { console.log(sec + ' seconds left') },
                        onstart : function() { console.log('timer started'+item._id) },
                        onstop  : function() { console.log('timer stop'); },
                        onpause : function() { console.log('timer set on pause') },
                        onend   : function() {
                            // console.log(item._id);

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
                                console.log("bid timed out"+item._id)
                            });
                            console.log('timer ended normally');
                        }
                    });
                    console.log(myTimer._.id);
                    myTimer.start(item.duration);
                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.error(err)
        })
});

//create a bid
route.post("/:id/bid",HELPERS.checkLoggedIn ,(req,res)=>{
    // console.log(req.params.id);
    models.Products.findById(req.params.id)
        .then((item)=>{
            if(item.userID !== req.user.id){
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
            }
            else {
                console.log("User bidding own item");
                res.redirect(`/items/${req.params.id}`)
            }
        })

});

//Get item details
route.get("/:id", (req, res) => {
    models.Products.findById(req.params.id, {
        // _id: 0
    })
        .then( (item)=>{
            // console.log(item);
            models.Bids.find({
                ProdID:item._id
            })
                .then((itembid)=> {
                    //to compute minimum bid allowed
                    var minbid = item.basevalue;
                    //selecting base value as minimum value
                    // console.log(itembid);
                    (itembid[0].allBids).forEach(function (data) {
                            if (minbid < data.price) {
                                minbid = data.price;
                            }
                        }
                    );
                    // console.log(minbid);
                    // console.log("Item:",item);
                    models.Products.findById(req.params.id)
                        .then((item) => {
                            if (!req.user || item.userID !== req.user.id) {
                                res.render("item-details", {
                                    item: item,
                                    minbid: minbid,
                                    isOwn: false
                                });
                            }
                            else {
                                res.render("item-details", {
                                    item: item,
                                    minbid: minbid,
                                    isOwn: false
                                });
                            }
                        });
                })
        })
        .catch((err) => {
            console.log(err);
            res.send({
                message: "error finding item"
            });
        })
});

route.get("/:id/incTime",(req,res)=>{

});

//Get Time
route.get("/:id/time", (req, res) => {
    console.log("In /:id/time");
    models.Products.findById(req.params.id)
        .then((item) => {
            console.log(item);
            let curDate = new Date();
            let origDate = new Date(item.createdAt);
            console.log(curDate, " ", origDate);
            console.log(typeof curDate);
            console.log(typeof origDate);
            // console.log(typeof item.createdAt.toString());
            let sec = (curDate - origDate) / 1000;
            if (sec < (item.duration * 60 * 60)) {
                console.log("sec:", sec);
                let timeRemaining = (item.duration*3600)-sec;
                res.send({timeRemaining});
            }
            else {
                res.send({
                    sec: 0
                })
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect(`/items/${req.params.id}`);
        })
});

module.exports = route;
