const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
    userID: Number,
    name: String,
    desc: String,
    category: String,
    basevalue: Number,
    duration: Number
},{
    timestamps: true
});

module.exports = mongoose.model("products", ProductSchema);
