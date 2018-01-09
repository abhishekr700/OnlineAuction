const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
    userID: Number,
    name: String,
    desc: String,
    category: String,
    basevalue: Number,
    minbid: Number,
    endDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("products", ProductSchema);
