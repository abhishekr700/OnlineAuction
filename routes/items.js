const multer = require('multer');
const route = require("express").Router();
const fs = require("fs");
const path = require("path");
const Scheduler = require("mongo-scheduler-more");
const alert=require('alert-node');

//Import MongoDB models
const models = require("../models/mongodb/mongo");

//Import HELPERS
const HELPERS = require("../helpers");
const CONFIG = require("../configs");

let Storage = multer.diskStorage({
    destination: './public_html/Images',
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
let upload = multer({storage: Storage});

/*
 Scheduler
 */
const scheduler = new Scheduler(`mongodb://${CONFIG.MONGO.HOST}:${CONFIG.MONGO.PORT}/${CONFIG.MONGO.DB_NAME}`, {
    pollInterval: 1000
});


scheduler.on("error", (err, event) => {
    console.log(err, event);
});

scheduler.on("close-bid", (err, event) => {
    models.Bids.findOne({
        ProdID: event.data
    })
        .then((biditem) => {
            biditem.isOpen = false;
            biditem.save()
                .then(() => {
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect('/404');
                })
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        })
})

scheduler.on("inc-time", (err, event) => {

})

//Items default page
route.get("/", (req, res) => {
    if (!req.query.show)
        req.query.show = "all";
    if (req.query.show === "all") {
        models.Products.find({})
            .then((items) => {
                items.reverse();
                res.render("items", {
                    items
                })
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }
    else {
        if (req.query.show === "others") {
            if (req.user)
                models.Products.find({
                    userID: {
                        $ne: req.user.id
                    },
                    endDate: {
                        $gt: Date.now()
                    }
                })
                    .then((items) => {
                        items.reverse();
                        res.render("items", {
                            items
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/404');
                    })
            else
                res.redirect("/login");
        }
        else if (req.query.show === "user") {
            if (req.user)
                models.Products.find({
                    userID: req.user.id
                })
                    .then((items) => {
                        items.reverse();
                        res.render("items", {
                            items
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/404');
                    });
            else
                res.redirect("/login");

        }
        else if (req.query.show === "userbids") {
            if (req.user) {
                models.UserBidsMap.findOne({
                    userID: req.user.id
                })
                    .then((biditems) => {
                        let arr = [];
                        for (let biditem of biditems.bidsOn) {
                            arr.push(biditem.ProdID);

                        }
                        models.Products.find({
                            "_id": {
                                $in: arr
                            }
                        })
                            .then((items) => {
                                items.reverse();
                                res.render("items", {
                                    items
                                })
                            })

                    })
            }
        }
        else {
            alert("Error message: Frontend Altered!");
            res.redirect('/items');
        }

    }

});

//TODO:remove later
//Return all the products
route.get('/all', function (req, res) {
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
    let curDate = new Date();
    let finalDate = curDate.getTime() + req.body.duration * 3600 * 1000;
    let endDate = new Date(finalDate);
    models.Products.create({
        userID: req.user.id,
        name: req.body.productname,
        desc: req.body.desc,
        category: req.body.category,
        basevalue: req.body.basevalue,
        minbid: req.body.basevalue,
        endDate: endDate
    })
        .then((item) => {
            fs.rename(path.join(__dirname, "../", "public_html/Images/", req.file.filename), path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), (err) => {
                console.log(err);
                res.redirect('/404');
            });

            models.Bids.create({
                ProdID: item._id,
                isOpen: true,
                allBids: []
            })
                .then(() => {

                    scheduler.schedule({
                        name: "close-bid",
                        data: item._id,
                        after: item.endDate
                    })

                    res.redirect(`/items/${item._id}`);
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect('/404');
                })
        })
        .catch((err) => {
            console.error(err)
        })
});

//filter by bid price
route.get("/filterBidPrice/:id", (req, res) => {
    models.Products.find({
        endDate: {
            $gt: Date.now()
        }
    }).sort({minbid: req.params.id})
        .then((items) => {
            res.render("items", {
                items
            })
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        })

});

//filter for name of product
route.post("/filterByName", (req, res) => {
    if (!req.body.category && !req.body.name) {
        models.Products.find({})
            .then((items) => {
                res.redirect('/items')
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }
    else if (!req.body.category) {
        models.Products.find({
            name: req.body.name,
            endDate: {
                $gt: Date.now()
            }
        })
            .then((items) => {

                res.render("items", {
                    items
                })

            })

            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }
    else if (!req.body.name) {
        models.Products.find({
            category: req.body.category,
            endDate: {
                $gt: Date.now()
            }
        })
            .then((items) => {
                res.render("items", {
                    items
                })
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }
    else {
        models.Products.find({
            name: req.body.name,
            category: req.body.category,
            endDate: {
                $gt: Date.now()
            }
        })
            .then((items) => {
                res.render("items", {
                    items
                })
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }

});

//filter by time left
route.get("/filterByTime", (req, res) => {
    models.Products.find({
        endDate: {
            $gt: Date.now()
        }
    }).sort({endDate: 1})
        .then((items) => {
            res.render("items", {
                items
            })
        })
});

//Get item details
route.get("/:id", (req, res) => {

    models.Products.findById(req.params.id, {
        // _id: 0
    })
        .then((item) => {
            if (!req.user || item.userID !== req.user.id) {
                res.render("item-details", {
                    item: item,
                    isOwner: false
                });
            }
            else {
                res.render("item-details", {
                    item: item,
                    isOwner: true
                });
            }
        })
        .catch((err) => {
            console.log(err);
            alert("error finding item");
            res.redirect("/items");

            })
        });

//Route to increase bid duration
route.post("/:id/incTime", HELPERS.checkLoggedIn, (req, res) => {
    if (req.body.duration) {
        models.Products.findById(req.params.id)
            .then((item) => {
                let updatedDate = new Date(item.endDate.getTime() + req.body.duration * 3600 * 1000);
                item.endDate = updatedDate;
                item.save().then(() => {
                    scheduler.list((err, events) => {
                        for (let eve of events) {
                            if (eve.data.toString() === item._id.toString()) {
                                scheduler.remove("close-bid", eve._id, null, (err, event) => {
                                });

                                break;
                            }
                        }
                        scheduler.schedule({
                            name: "close-bid",
                            data: item._id,
                            after: item.endDate
                        });
                    });
                    res.redirect(`/items/${req.params.id}`);
                })
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }
    else {
        res.redirect(`/items/${req.params.id}`)
    }
});

//Get time for a item
route.get("/:id/time", (req, res) => {
    models.Products.findById(req.params.id)
        .then((item) => {
            let curDate = new Date();
            let timeRemaining = (item.endDate - curDate) / 1000;
            if (timeRemaining > 0) {
                res.send({timeRemaining});
            }
            else {
                models.Bids.updateOne(
                    {
                        "ProdID": item._id
                    }
                    ,
                    {
                        $set: {
                            "isOpen": false
                        }
                    }
                ).then(function (data) {
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

//Add a bid
route.post("/:id/bid", HELPERS.checkLoggedIn, (req, res) => {
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
                            .then((bidItem) => {
                                item.minbid = req.body.bidprice;
                                item.save();

                                models.UserBidsMap.findOneAndUpdate(
                                    {
                                        userID: req.user.id
                                    },
                                    {
                                        $pull: {
                                            bidsOn: {
                                                ProdID: item._id
                                            }
                                        }
                                    }
                                )
                                    .then(() => {
                                        models.UserBidsMap.findOneAndUpdate(
                                            {
                                                userID: req.user.id
                                            },
                                            {
                                                $push: {
                                                    bidsOn: {
                                                        ProdID: item._id
                                                    }
                                                }
                                            }
                                        )
                                            .then(() => {
                                                if (item !== null)
                                                    res.redirect('/items/' + req.params.id);
                                                else
                                                //TODO: Add flash message
                                                    alert("Bid is Closed");
                                                res.redirect(`/items/${req.params.id}`)
                                            })
                                    })

                            })
                            .catch((err) => {
                                console.log(err);
                                alert("error finding item");
                                res.redirect(`/items/${req.params.id}`);
                            })
                    }
                    else {
                        alert("Error Message: Frontend Altered");
                        res.redirect(`/items/${req.params.id}`)
                    }
                }
                else {
                    res.redirect(`/items/${req.params.id}`)
                }
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            })
    }
    else {
        //If bidprice is null
        alert("Error Message: Frontend Altered!");
        res.redirect(`/items/${req.params.id}`);
    }
});

//Delete an item
route.get("/:id/delete", HELPERS.checkLoggedIn, (req, res) => {
    models.Bids.findOne({
        ProdID: req.params.id
    })
        .then((bidentry) => {
            if (bidentry) {
                if (bidentry.allBids === undefined || bidentry.allBids.length === 0) {
                    models.Products.findById(req.params.id)
                        .then((item) => {
                            item.remove();
                            bidentry.remove();
                            fs.stat(path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), function (err, stats) {
                                if (err) {
                                    return console.error(err);
                                }

                                fs.unlink(path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), function (err) {
                                    if (err) {
                                        console.log(err);
                                        res.redirect('/404');
                                    }
                                });
                            });
                            res.redirect("/items?show=user");
                        })
                        .catch((err) => {
                            console.log("Error deleting item:", err);
                            alert("Error in Deleting The Item ");
                            res.redirect(`/items/${req.params.id}`)
                        })
                }
                else {
                    alert("Cannot delete item: Bid placed on item");
                    res.redirect(`/items/${req.params.id}`)
                }
            }
            else {
                alert("Item not found");
                res.redirect(`/items/`)
            }
        })
        .catch((err) => {
        console.log(err);
            res.redirect('/404');
        })
});

module.exports = route;