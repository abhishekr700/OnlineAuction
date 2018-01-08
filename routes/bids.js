const route = require('express').Router();
const Users = require("../models/sql/sequelize").Users;
const models = require("../models/mongodb/mongo");
const passport = require("../passport");
//show all bids
route.get('/', function (req, res) {
    models.Bids.find({})
        .then((bidlist) => {
            res.send(bidlist)
        })
        .catch((err) => {
            console.error(err)
        })
});
module.exports = route;