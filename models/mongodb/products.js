const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
    img:String,
    userID: Number,
    name: String,
    desc: String,
    category: String,
    basevalue: Number,
    duration: Number
});

module.exports = mongoose.model("products", ProductSchema);
