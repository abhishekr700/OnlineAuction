const Passport = require("../passport");
const crypto=require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer=require('nodemailer');
const Users = require("../models/sql/sequelize").Users;
const Sequelize=require('sequelize');
const CONFIG = require("../configs");
const models = require("../models/mongodb/mongo");


module.exports = function (app) {


    /*
    functions
     */

    async function mailPassword(user) {
        //console.log("in mail password");

        // generate the token
        let token = await  function () {
            return new Promise((resolve) => {
                crypto.randomBytes(20, function (err, buf) {
                    let token = buf.toString('hex');
                    resolve(token);
                    //console.log(token);
                    //console.log("f1 ", new Date());
                });
            })
        }();

        // update user table with token and expiry time
        await  function (token) {
            return new Promise((resolve) => {
                //console.log("f2", new Date());
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save().then(() => {
                    // console.log("user saved");
                    resolve();
                }).catch((err) => {
                    console.log(err);
                });
            })
        }(token);

        // send the mail to the user's email id
        await  function (token, user) {
            return new Promise((resolve, reject) => {
                //console.log("f3", new Date());
                let smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    // TODO: add username and password
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'Node.js Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + CONFIG.SERVER.HOST + ":" + CONFIG.SERVER.PORT + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    console.log("sendmail",err);
                    if (err) {
                        //console.log("rejected");
                        reject();
                    } else {
                        resolve();
                    }
                });
            })
        }(token, user);
    }

    async function mailConfirmation(user, newPassword) {
        //console.log("in mail confirmation");

        // update user table with new password and tokens
        await  function () {
            return new Promise((resolve) => {
                //console.log("f2", new Date());

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newPassword, salt, function (err, hash) {
                        user.password = hash;
                        user.resetPasswordToken = null;
                        user.resetPasswordExpires = null;
                        user.save().then(() => {
                            // console.log("user saved");
                            resolve();
                        }).catch((err) => {
                            console.log(err);
                        });
                    })
                })
            })
        }();

        // send the mail to the user's email id regarding confirmation of password reset
        await  function (user) {
            return new Promise((resolve, reject) => {
                //console.log("f3", new Date());
                let smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    // TODO: add username and password
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    //console.log(err);
                    if (err) {
                        //console.log("rejected");
                        console.log(err);
                        reject();
                    } else {
                        resolve();
                    }
                });
            })
        }(user);
    }

    async function mailVerifyEmail(user) {
        //console.log("in mail password");

        // generate the token
        let token = await  function () {
            return new Promise((resolve) => {
                crypto.randomBytes(20, function (err, buf) {
                    let token = buf.toString('hex');
                    resolve(token);
                    //console.log(token);
                    //console.log("f1 ", new Date());
                });
            })
        }();

        // update user table with token and expiry time
        await  function (token) {
            return new Promise((resolve) => {
                //console.log("f2", new Date());
                user.verifyEmailToken = token;
                user.save().then(() => {
                    // console.log("user saved");
                    resolve();
                }).catch((err) => {
                    console.log(err);
                });
            })
        }(token);

        // send the mail to the user's email id
        await  function (token, user) {
            return new Promise((resolve, reject) => {
                //console.log("f3", new Date());
                let smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    // TODO: add username and password
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'verify email',
                    text: 'You are receiving this because you (or someone else) have requested for verification of email for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + CONFIG.SERVER.HOST + ":" + CONFIG.SERVER.PORT + '/verify/' + token + '\n\n' +
                    'If you did not request this, please ignore this email.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    console.log("sendmail",err);
                    if (err) {
                        //console.log("rejected");
                        reject();
                    } else {
                        resolve();
                    }
                });
            })
        }(token, user);
    }

// when user clicks on forgot password
    app.get('/forgot', (req, res) => {
        res.render('forgot-password');
    });

// on submission of email/uname
    app.post('/forgot', (req, res) => {
        Users.find({
            where: {
                [Sequelize.Op.or]: [
                    {username: req.body.username},
                    {email: req.body.email}
                ]
            }
        }).then((user) => {
            if (!user) {
                //TODO: Flash message
                res.redirect('/forgot');
            } else {

                mailPassword(user).then(() => {
                    //console.log("after function");
                    res.send('An e-mail has been sent to ' + user.email + ' with further instructions.')
                }).catch((err) => {
                    console.log(err);
                    res.send('error occurred');

                })
            }
        })

    });

// when clicked on link from email
    app.get('/reset/:token', (req, res) => {
        console.log(Date.now);
        Users.find({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Sequelize.Op.gte]: Date.now()
                }
            }
        }).then((user) => {
            if (!user) {
                res.send('Password reset token is invalid or link has expired.');
            } else {
                res.render('password-reset', {
                    user: user
                });
            }
        })
    });

// reset my password is clicked
    app.post('/reset/:token', (req, res) => {

        Users.find({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Sequelize.Op.gte]: Date.now()
                }
            }
        }).then((user) => {
            if (!user) {
                //TODO: Flash message
                res.send('Password reset token is invalid or link has expired.');
            } else {

                mailConfirmation(user, req.body.password).then(() => {
                    //console.log("after function");
                    res.send('\'success\', \'Success! Your password has been changed.\'')
                }).catch(() => {
                    res.send('error occurred');

                })
            }
        })

    });

//Render Login Page
    app.get("/login", (req, res) => {
        if(req.user)
            res.redirect("/users");
        else
            res.render("login");
    });

//Login Route
    app.post("/login", Passport.authenticate('local', {
        successRedirect: "/users",
        failureRedirect: "/login"
    }));

//Render SignUp page
    app.get("/signup", (req, res) => {
        if(req.user)
            res.redirect("/users");
        else
            res.render("login");
    });

//verify email
    app.get("/verify/:token",(req,res)=>{
        Users.find({
            where: {
                verifyEmailToken: req.params.token,
            }
        }).then((user) => {
            if (!user) {
                //TODO: Flash message
                res.send('verify email token is invalid.');
            } else {
                user.isVerified=true;
                user.save();
                req.login(user, () => {
                    res.redirect("/users");
                });
            }
        })
    })

//New User via SignUp route
    app.post("/signup", (req, res) => {

        Users.find({
            where: {
                [Sequelize.Op.or]: [
                    {username: req.body.username},
                    {email: req.body.email}
                ]
            }
        })
            .then((user) => {
                if (!user) {
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(req.body.password, salt, function (err, hash) {
                            // Store hash in your password DB.

                            Users.create({
                                username: req.body.username,
                                password: hash,
                                name: req.body.name,
                                email: req.body.email,
                                phone1: req.body.phone1,
                                phone2: req.body.phone2,
                                isVerified:false
                            })
                                .then((user) => {

                                    models.UserBidsMap.create({
                                        userID: user.id,
                                        bidsOn: []
                                    })
                                        .then((data)=>{
                                            // console.log("Userbid: ",data);
                                            mailVerifyEmail(user).then(()=>{
                                                // req.login(user, () => {
                                                //     res.redirect("/users");
                                                // });
                                                res.send("email not verified");
                                            }).catch((err)=>{
                                                console.log(err);
                                            })

                                        })
                                        .catch((err)=>{
                                            console.log(err);
                                        })
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                        });
                    });

                }
                else {
                    res.send("duplicate user")
                }
            })
            .catch((err) => {
                console.log(err);
            })


    });

//Logout route
    app.get("/logout", (req, res) => {
        console.log("LOGOUT !");
        req.logout();
        res.redirect("/");
    });


}