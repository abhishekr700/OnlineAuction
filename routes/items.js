const route = require("express").Router();
const fs=require("fs");
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
    console.log(typeof req.query.showall);
    if(req.query.show == "all")
    {
        models.Products.find({})
            .then((items)=>{
                res.render("items",{
                    items
                })
            })
            .catch((err)=>{
                console.log(err);
            })
    }
    else{
        if(req.user){
            if(req.query.show === "others"){
        models.Products.find({
            userID :{
                $ne: req.user.id
            }
        })
            .then((items)=>{
                res.render("items",{
                    items
                })
            })
            .catch((err)=>{
                console.log(err);
            })
            }
            else if(req.query.show === "user") {
                models.Products.find({
                    userID: req.user.id
                })
                    .then((items)=>{
                        res.render("items",{
                            items
                        })
                    })
                    .catch((err)=>{
                        console.log(err);
                    })

            }
            else {
                res.send("Don't mess with me ! ~Mr.Server")
            }
        }
        else
            res.redirect("/login");
        }

});

//TODO:remove later
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
    //console.log("ADD: ", req.user);
    let curDate = new Date();
    let finalDate = curDate.getTime() + req.body.duration*3600*1000;
    let endDate = new Date(finalDate);
    models.Products.create({
        userID: req.user.id,
        name: req.body.productname,
        desc: req.body.desc,
        category: req.body.category,
        basevalue: req.body.basevalue,
        endDate: endDate
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
                    })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.error(err)
        })
});

//Get item details
route.get("/:id", (req, res) => {
    console.log("in gett");
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
                        if(data.price)
                            if (minbid < data.price) {
                                minbid = data.price;
                            }
                        }
                    );
                    // console.log(minbid);
                    // console.log("Item:",item);
                    models.Products.findById(req.params.id)
                        .then((item) => {
                            console.log("user: "+req.user);
                            if (!req.user || item.userID !== req.user.id) {
                                res.render("item-details", {
                                    item: item,
                                    minbid: minbid,
                                    bidplaced:false
                                });
                            }
                            else {
                                res.render("item-details-owner", {
                                    item: item,
                                    minbid: minbid,

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

//Get item details
route.get("/:id/bidplaced", (req, res) => {
    console.log("in gett");
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
                            console.log("user: "+req.user);
                            if (!req.user || item.userID !== req.user.id) {
                                res.render("item-details", {
                                    item: item,
                                    minbid: minbid,
                                    bidplaced:true
                                });
                            }
                            else {
                                res.render("item-details-owner", {
                                    item: item,
                                    minbid: minbid

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

//Get time for a item
route.get("/:id/time", (req, res) => {
    //console.log("In /:id/time");
    models.Products.findById(req.params.id)
        .then((item) => {
           // console.log(item);
            let curDate = new Date();
            let timeRemaining = (item.endDate - curDate) / 1000;
            if (timeRemaining > 0) {
                console.log("sec:", timeRemaining);
                console.log(item.duration);
                res.send({timeRemaining});
            }
            else {
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
                res.send({
                    timeRemaining: 0
                })
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect(`/items/${req.params.id}`);
        })
});

//create a bid
route.post("/:id/bid",HELPERS.checkLoggedIn ,(req,res)=> {
    // console.log(req.params.id);
    if (req.body.bidprice) {
        models.Products.findById(req.params.id)
            .then((item) => {
                if (item.userID !== req.user.id) {
                    if (req.body.bidprice > item.minbid) {
                        models.Bids.findOneAndUpdate(
                            {
                                ProdID: req.params.id,
                                isOpen: true
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
                            .then((item) => {
                                console.log(item);
                                if (item !== null)
                                    res.redirect('/items/' + req.params.id + '/bidplaced');
                                else
                                //TODO: Add flash message
                                    res.send({
                                        msg: "Bid closed"
                                    })
                            })
                            .catch((err) => {
                                console.log(err);
                                res.send({
                                    message: "error finding item"
                                });
                            })
                    }
                    else {
                        res.send("Majje le rha hai ladke ?");
                    }
                }
                else {
                    // console.log("User bidding own item");
                    res.redirect(`/items/ ${req.params.id}`)
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else {
        res.send("Front end se maze na le ~Mr. Server");
    }
});

module.exports = route;
