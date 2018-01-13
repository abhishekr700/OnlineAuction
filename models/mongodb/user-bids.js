const mongoose = require("mongoose");

const UserBidsMapSchema = new mongoose.Schema({
    userID: Number,
    bidsOn: [{
        ProdID: {
            type: mongoose.Schema.Types.ObjectId,
        }
    }]
});

module.exports = mongoose.model("UserBidsMap" , UserBidsMapSchema);
