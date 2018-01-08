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

//Show all items of LoggedIN user
route.get("/items", (req,res)=>{
    models.Products.find({
        userID: req.user.id
    })
        .then((items)=>{
            res.render("ownItems",
                {
                    items:items
                })
        })
        .catch((err)=>{
            console.log("Cannot find user's items due to :",err);
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