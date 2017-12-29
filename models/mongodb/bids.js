const mongoose = require("mongoose");

const bidsSchema = mongoose.Schema({
    ProdID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
    },
    isOpen: Boolean,
    allBids: [{
        userID: Number,
        price: Number,
        time: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model("bids", bidsSchema);