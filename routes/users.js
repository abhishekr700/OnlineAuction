const route=require('express').Router();
const models = require("../models/mongodb/mongo");

route.get('/',function (req,res) {
    res.redirect('http://localhost:2345/user.html');
});

exports.route=route;