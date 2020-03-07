const route = require('express').Router();
const bcrypt = require('bcryptjs');

const { Users } = require("../models/sql/sequelize");
const models = require("../models/mongodb/mongo");

route.get('/', function (req, res) {
    res.render("user");
});

//Show all users
// TODO: Remove this later
route.get("/all", (req, res) => {
    Users.findAll()
        .then((users) => {
            res.send(users);
        })
});

//TODO: remove this route
route.get("/userbids", (req, res) => {
    models.UserBidsMap.find()
        .then((userbids) => {
            res.send(userbids);
        })
})


// Show profile page
route.get("/profile", (req, res) => {
    res.redirect('/users');
})


// Edit Profile
route.post("/editProfile", (req, res) => {
    Users.findById(req.user.id)
        .then((user) => {
            user.phone1 = req.body.phone1;
            user.phone2 = req.body.phone2;
            return user.save();
        })
        .then((saveduser) => {
            console.log("Profile Edited for ", saveduser.id);
            res.redirect('/users');
        })
        .catch((err) => {
            console.error("Profile Edit Error: ", err);
            res.redirect('/404');
        })
});


// Render change password page
route.get("/changePass", (req, res) => {
    res.render("change-pass");
})

// POST route for passord-change
route.post("/changePass", async (req, res) => {
    try {
        //Check for null values
        if (!req.body.currentpass || !req.body.newpass) {
            console.log("Bad request for change password - fields missing");
            res.sendStatus(400);
            return;
        }

        //Check if old & new password not same
        if (req.body.currentpass === req.body.newpass) {
            console.info("Bad request for change password - old & new passwords match");
            res.sendStatus(400);
            return;
        }

        const user = await Users.findById(req.user.id);

        const result = await bcrypt.compare(req.body.currentpass, user.password);
        if (result === false) {
            console.info("Unauthorized request for change password - old password does not match");
            res.sendStatus(401);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.newpass, salt);
        user.password = hash;
        await user.save();
        console.info("Password has been changed");
        res.redirect("/users/profile");
    }
    catch (err) {
        console.log(err);
        res.redirect('/404');
    }

});

module.exports = route;