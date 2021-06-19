const multer = require('multer');
const route = require("express")
    .Router();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const Scheduler = require("mongo-scheduler-more");
const cloudinary = require('cloudinary');

//Import models
const alert = require('alert-node');

//Import MongoDB models
const models = require("../models/mongodb/mongo");
const Users = require("../models/sql/sequelize").Users;

//Import HELPERS
const HELPERS = require("../helpers");
const CONFIG = require("../configs");

let Storage = multer.diskStorage({
    destination: './public_html/Images',
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
let upload = multer({ storage: Storage });

const { MONGOOSE_URI } = require("../helpers");

const mongoose = require("mongoose");

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(CONFIG.SERVER.SENDGRID_API_KEY);
/*
 Scheduler
//  */
const connection = mongoose.connect(CONFIG.MONGO.URI, {
    useNewUrlParser: true
});
// console.log(connection);
// const scheduler = new Scheduler(CONFIG.MONGO.URI)
const scheduler = new Scheduler(CONFIG.MONGO.URI, {
    pollInterval: 1000,
    useNewUrlParser: true,
    auth: {
        user: 'root123',
        password: 'root123'
    },
    authMechanism: "SCRAM-SHA-1"
    // dbname: "onlineauction"
});

scheduler.on("error", (err, event) => {
    console.error("SCHEDULER ERROR:", err, event);
    process.exit(10);
});

scheduler.on("close-bid", (event) => {
    console.log("=> Close-Bid: ", event);

    models.Bids.findOne({
        ProdID: event.data
    })
        .then((biditem) => {
            biditem.isOpen = false;
            return biditem.save();
        })
        .then((biditem) => {
            //Send mail to winner
            console.log("=> Close-Bid: Send winner and Owner mail if item was sold");

            (async function () {
                console.log("=> Close-Bid: Inside mailer function");
                //Mail to winner and Owner
                await function () {
                    return new Promise((resolve, reject) => {
                        if (biditem.allBids.length > 1) {
                            let winnerId = biditem.allBids[biditem.allBids.length - 1].userID;
                            if (winnerId) {
                                console.log("WinnerID:", winnerId);
                                Users.findById(winnerId)
                                    .then((winner) => {
                                        console.log("Winner:", winner);
                                        models.Products.findOne({
                                            _id: event.data
                                        })
                                            .then((item) => {
                                                Users.findById(item.userID)
                                                    .then((owner) => {
                                                        let mailOptionsWinner = {
                                                            to: winner.email,
                                                            from: CONFIG.SERVER.MAIL,
                                                            subject: 'Auction Won',
                                                            text: 'You won the auction for ' + biditem.ProdID + '.\nFollowing are The details of the owner of the product.\nKindly contact him/her for further process.\nUsername: ' + owner.username + '\nName: ' + owner.name + '\nEmail-Id: ' + owner.email
                                                        };
                                                        let mailOptionsOwner = {
                                                            to: owner.email,
                                                            from: CONFIG.SERVER.MAIL,
                                                            subject: 'Item Sold',
                                                            text: 'Your Product ' + biditem.ProdID + ' has been sold and bought by ' + winner.username + '.\nKindly contact him/her for further process.\n' + 'Username: ' + winner.username + '\nName: ' + winner.name + '\nEmail-Id: ' + winner.email
                                                        };
                                                        sgMail.send(mailOptionsWinner)
                                                            .then(() => {
                                                                console.log("Mail sent to winner");
                                                                sgMail.send(mailOptionsOwner)
                                                                    .then(() => {
                                                                        console.log("Mail sent to owner");
                                                                    });
                                                            });
                                                    });

                                            });

                                    });
                            }
                        } else {
                            resolve();
                        }
                    });
                }();


            })()
                .then(() => {
                    console.log("bid has been closed");
                });
        })
        .catch((err) => {
            console.log(err);
        });
});

//Cloudiniary Configs
cloudinary.config({
    cloud_name: CONFIG.IMAGES.CLOUD_NAME,
    api_key: CONFIG.IMAGES.API_KEY,
    api_secret: CONFIG.IMAGES.API_SECRET
});

//Items default page
route.get("/", (req, res) => {
    if (!req.query.show) {
        req.query.show = "all";
    }
    if (req.query.show === "all") {
        models.Products.find({})
            .then((items) => {
                items.reverse();
                res.render("items", {
                    items
                });
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    } else {
        if (req.query.show === "others") {
            if (req.user) {
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
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/404');
                    });
            } else {
                res.redirect("/login");
            }
        } else if (req.query.show === "user") {
            if (req.user) {
                models.Products.find({
                    userID: req.user.id
                })
                    .then((items) => {
                        items.reverse();
                        res.render("items", {
                            items
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/404');
                    });
            } else {
                res.redirect("/login");
            }

        } else if (req.query.show === "userbids") {
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
                                });
                            });

                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/404');
                    });
            }
        } else {
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
            res.send(productlist);
        })
        .catch((err) => {
            console.error(err);
        });
});

//Render Add Item page
route.get("/add", HELPERS.checkLoggedIn, (req, res) => {
    res.render("additem");
});


//Post route to add products to DB
route.post('/add', HELPERS.checkLoggedIn, upload.single('imgUploader'), function (req, res) {
    console.log("=>Add Item:", req.body);

    let curDate = new Date();
    let finalDate = curDate.getTime() + req.body.duration * 1000 * 3600;
    let endDate = new Date(finalDate);
    console.log("=> Add Item: Creating DB Entry");

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

            if (req.file) {
                console.log("=> Add Item: Renaming file");

                fs.rename(path.join(__dirname, "../", "public_html/Images/", req.file.filename), path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), (err) => {
                    if (err) {
                        console.log(err);
                        res.redirect('/404');
                    } else {
                        //Upload image
                        cloudinary.uploader.upload(path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), function (result) {
                            console.log(result.url);

                            //Delete image from server
                            console.log("=> Add Item: Deleting image from server local");

                            fs.stat(path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), function (err, stats) {
                                console.log(stats);//here we got all information of file in stats variable
                                if (err) {
                                    return console.error(err);
                                } else {
                                    fs.unlink(path.join(__dirname, "../", "public_html/Images/", item._id + ".jpg"), function (err) {
                                        if (err) {
                                            console.log(err);
                                            res.redirect('/404');
                                        } else {
                                            console.log('=> Add Item: file deleted successfully');
                                            //Store image url in DB
                                            item.img = result.url;
                                            item.save()
                                                .then(() => {
                                                    console.log("=> Add Item: Creating entry in Bids table");

                                                    //Create entry in bids table
                                                    return models.Bids.create({
                                                        ProdID: item._id,
                                                        isOpen: true,
                                                        allBids: []
                                                    })
                                                        .then(() => {
                                                            console.log("=> Add Item: Scheduling Bid Close");

                                                            scheduler.schedule({
                                                                name: "close-bid",
                                                                data: item._id,
                                                                after: item.endDate
                                                            });
                                                            console.log("=> Add Item: Redirecting to item page");

                                                            res.redirect(`/items/${item._id}`);
                                                        });

                                                });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            } else {
                //Store image url in DB
                item.img = "/images/e6.png";
                item.save()
                    .then(() => {

                        //Create entry in bids table
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
                                });

                                res.redirect(`/items/${item._id}`);
                            });

                    });

            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        });
});

//filter by bid price
route.get("/filterBidPrice/:id", (req, res) => {
    models.Products.find({
        endDate: {
            $gt: Date.now()
        }
    })
        .sort({ minbid: req.params.id })
        .then((items) => {
            res.render("items", {
                items
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        });

});

//filter for name of product
route.post("/filterByName", (req, res) => {

    if (!req.body.category && !req.body.name) {
        models.Products.find({})
            .then((items) => {
                res.redirect('/items');
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    } else if (!req.body.category) {
        models.Products.find({
            name: req.body.name,
            endDate: {
                $gt: Date.now()
            }
        })
            .then((items) => {
                console.log(items);
                res.render("items", {
                    items
                });
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    } else if (!req.body.name) {
        models.Products.find({
            category: req.body.category,
            endDate: {
                $gt: Date.now()
            }
        })
            .then((items) => {
                res.render("items", {
                    items
                });
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    } else {
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
                });
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    }

});

//filter by time left
route.get("/filterByTime", (req, res) => {
    models.Products.find({
        endDate: {
            $gt: Date.now()
        }
    })
        .sort({ endDate: 1 })
        .then((items) => {
            res.render("items", {
                items
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        });
});

//Get item details
route.get("/:id", (req, res) => {

    models.Products.findById(req.params.id, {
        // _id: 0
    })
        .then((item) => {
            if (item) {
                if (!req.user || item.userID !== req.user.id) {
                    res.render("item-details", {
                        item: item,
                        isOwner: false
                    });
                } else {
                    res.render("item-details", {
                        item: item,
                        isOwner: true
                    });
                }
            } else {
                console.log("item not found");
                res.redirect('/items');
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/items");

        });
});

//Route to increase bid duration
route.post("/:id/incTime", HELPERS.checkLoggedIn, (req, res) => {
    if (req.body.duration) {
        models.Products.findById(req.params.id)
            .then((item) => {
                let updatedDate = new Date(item.endDate.getTime() + req.body.duration * 3600 * 1000);
                item.endDate = updatedDate;
                item.save()
                    .then(() => {
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
                    .catch((err) => {
                        console.log(err);
                        res.redirect('/404');
                    });
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    } else {
        res.redirect(`/items/${req.params.id}`);
    }
});

//Get time for a item
route.get("/:id/time", (req, res) => {
    models.Products.findById(req.params.id)
        .then((item) => {
            let curDate = new Date();
            let timeRemaining = (item.endDate - curDate) / 1000;
            if (timeRemaining > 0) {
                res.send({ timeRemaining });
            } else {
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
                )
                    .then(function (data) {
                        res.send({
                            timeRemaining: 0
                        });
                    });

            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect(`/items/${req.params.id}`);
        });
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
                                if (bidItem) {
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
                                                    res.redirect(`/items/${req.params.id}`);
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                    res.redirect('/404');
                                                });
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            res.redirect('/404');
                                        });

                                } else {
                                    alert("Bid Is Closed");
                                    res.redirect(`/items/${req.params.id}`);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                alert("error finding item");
                                res.redirect(`/items/${req.params.id}`);
                            });
                    } else {
                        alert("Enter the value greater than minimum bid!!");
                        res.redirect(`/items/${req.params.id}`);
                    }
                } else {
                    res.redirect(`/items/${req.params.id}`);
                }
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    } else {
        //If bidprice is null
        alert("Error Message: Enter the value to bid");
        res.redirect(`/items/${req.params.id}`);
    }
});

//Delete an item
route.get("/:id/delete", HELPERS.checkLoggedIn, (req, res) => {
    console.log("=> Delete Item: ", req.params);
    console.log("=> Delete Item: Checking Bid Entries");

    models.Bids.findOne({
        ProdID: req.params.id
    })
        .then((bidentry) => {
            if (!bidentry) {
                return res.sendStatus(404);
                //TODO: redirect to /items
            }
            console.log("=> Delete Item: BidEntry: ", bidentry);

            if (bidentry.allBids === undefined || bidentry.allBids.length === 0) {
                console.log("=> Delete Item: Can be Deleted, Finding Product");
                models.Products.findById(req.params.id)
                    .then((item) => {
                        let publicID = item.img;
                        publicID = publicID.split('/');
                        publicID = publicID[publicID.length - 1];
                        publicID = publicID.split('.');
                        publicID = publicID[0];
                        console.log(publicID);
                        cloudinary.v2.uploader.destroy(publicID, function (error, result) {
                            console.log(result);
                            scheduler.list((err, events) => {
                                for (let eve of events) {
                                    if (eve.data.toString() === req.params.id.toString()) {
                                        scheduler.remove("close-bid", eve._id, null, (err, event) => {
                                        });
                                        break;
                                    }
                                }
                                console.log("schedular removed");
                                if (err) {
                                    console.log(err);
                                    res.redirect('/404');
                                } else {
                                    alert("Successfully Deleted Item");
                                    res.redirect("/items?show=user");
                                }

                            });
                        });
                        return item.remove();
                    })
                    .then(() => {
                        return bidentry.remove();
                    })
                    .then(() => {
                        console.log("=> Delete Item: Successful");
                        res.redirect("/items");
                    })
                    .catch((err) => {
                        console.log("Error deleting item:", err);
                        alert("Error in Deleting The Item ");
                        res.redirect(`/items/${req.params.id}`);
                    });
            } else {
                console.log("=> Delete Item: Cannot delete item: Bid placed on item");
                res.redirect(`/items/${req.params.id}`);
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        });
});

module.exports = route;