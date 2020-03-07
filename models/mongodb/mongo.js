//Import mongoose module
const mongoose = require("mongoose");
const CONFIG = require("../../configs");

//Require DB models
const Products = require("./products");
const Bids = require("./bids");
const UserBidsMap = require("./user-bids");

//Use global promise instead of Mongoose's
mongoose.Promise = global.Promise;

//Connect to DB
mongoose.connect(CONFIG.MONGO.URI, {
    useNewUrlParser: true
})
    .then((client) => {
        console.log("Successful connection to MongoDB");
        // console.log("CLIENT:",client);
        
    })
    .catch((err) => {
        console.log("Mongoose connection error due to: ", err);
        process.exit();
    });

//Expose models for use elsewhere
module.exports = {
    Products, Bids, UserBidsMap
};