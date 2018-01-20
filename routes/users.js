const route = require('express').Router();
const bcrypt = require('bcryptjs');

const Users = require("../models/sql/sequelize").Users;
const models = require("../models/mongodb/mongo");

route.get('/', function (req, res) {
    res.render("user");
});

//Show all users TODO: Remove this later
route.get("/all", (req, res) => {
    Users.findAll()
        .then((users) => {
            res.send(users);
        })
});

//TODO: remove this route
route.get("/userbids",(req,res)=>{
    models.UserBidsMap.find()
        .then((userbids)=>{
            res.send(userbids);
        })
})

route.get("/profile",(req,res)=>{
    res.redirect('/users');
})

//edit Profile
route.post("/editProfile",(req,res)=>{
    Users.findById(req.user.id)
        .then((user)=>{
            user.phone1=req.body.phone1;
            user.phone2=req.body.phone2;
            user.save();
            res.redirect('/users');
        })
        .catch((err)=>{
            console.log(err);
            res.redirect('/404');
        })

})

//Render change password page
route.get("/changePass",(req,res)=>{
    res.render("change-pass");
})

//POST route for passord-change
route.post("/changePass",(req,res)=>{
    //Check for null values
    if(req.body.currentpass && req.body.newpass){
        //Check if old & new password not same
        if(req.body.currentpass !== req.body.newpass) {
            Users.findById(req.user.id)
                .then((user) => {
                    bcrypt.compare(req.body.currentpass, user.password)
                        .then((result) => {
                            if (result) {
                                bcrypt.genSalt(10, function (err, salt) {
                                    bcrypt.hash(req.body.newpass, salt, function (err, hash) {
                                        //Change password in DB
                                        user.password = hash;
                                        user.save()
                                            .then(() => {
                                                alert("Password has been changed")
                                                res.redirect("/users/profile");
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                                res.redirect('/404');
                                            })
                                    })
                                })

                            }
                            else {

                                alert("Current Password Incorrect");
                                res.redirect('/users/changePass');
                            }
                        })
                })
        }
        else{
            alert("New password & current password cannot be same");
            res.redirect('/users/changePass');
        }
    }
    //if one of variables null/missing
    else{
        alert("CurrentPass or NewPass not supplied");
        res.redirect('/users/changePass');
    }
})

module.exports = route;