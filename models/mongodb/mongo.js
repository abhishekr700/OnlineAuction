//Import mongoose module
const mongoose = require("mongoose");
const CONFIG = require("../../configs");

//Require DB models
const Products = require("./products");
const Bids = require("./bids");

//Use global promise instead of Mongoose's
mongoose.Promise = global.Promise;

//Connect to DB
mongoose.connect(`mongodb://${CONFIG.MONGO.HOST}:${CONFIG.MONGO.PORT}/${CONFIG.MONGO.DB_NAME}`, {
    useMongoClient: true
})
    .then(() => {
        console.log("Successful connection to MongoDB");
    })
    .catch((err) => {
        console.log("Mongoose connection error due to: ", err);
        process.exit();
    });

//Expose models for use elsewhere
module.exports = {
    Products, Bids
};