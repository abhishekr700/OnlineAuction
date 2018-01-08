const route = require('express').Router();
const Users = require("../models/sql/sequelize").Users;
const models = require("../models/mongodb/mongo");

route.get('/',function (req,res) {
   // console.log("render /users page");
    res.render("user");
});

//Show all users TODO: Remove this later
route.get("/all", (req,res) => {
   // console.log("Render /users/all");
    Users.findAll()
        .then((users)=>{
            res.send(users);
        })
});



//Get User details
route.get("/details", (req,res)=>{
    Users.findById(req.user.id,{
        attributes: ["username","name","email","phone1","phone2"]
    })
        .then((user)=>{
            res.send(user);
        })
});

module.exports = route;