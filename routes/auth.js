const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const alert = require('alert-node');
const multer = require('multer');
const cloudinary = require('cloudinary');
const fs = require('fs');
const path = require('path');
const models = require('../models/mongodb/mongo');
const CONFIG = require('../configs');
const { Users } = require('../models/sql/sequelize');
const Passport = require('../passport');


module.exports = function (app) {
    const Storage = multer.diskStorage({
        destination: './public_html/Images',
        filename(req, file, callback) {
            callback(null, file.originalname);
        },
    });
    const upload = multer({ storage: Storage });
    cloudinary.config({
        cloud_name: 'auctioneeer',
        api_key: '553296924422138',
        api_secret: 'YNGylxUU6jLGb9Ioc2P44b07gfQ',
    });

    /*
    functions
     */

    async function mailPassword(user, res) {
        // generate the token
        const token = await (function () {
            return new Promise((resolve) => {
                crypto.randomBytes(20, (err, buf) => {
                    const token = buf.toString('hex');
                    resolve(token);
                });
            });
        }());

        // update user table with token and expiry time
        await (function (token) {
            return new Promise((resolve) => {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save().then(() => {
                    resolve();
                }).catch((err) => {
                    console.log(err);
                    res.redirect('/404');
                });
            });
        }(token));

        // send the mail to the user's email id
        await (function (token, user) {
            return new Promise((resolve, reject) => {
                const smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    // TODO: add username and password
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS,
                    },
                });
                const mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'Node.js Password Reset',
                    text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
                    + 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
                    + 'http://'}${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}/reset/${token}\n\n`
                    + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
                };
                smtpTransport.sendMail(mailOptions, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }(token, user));
    }

    async function mailConfirmation(user, newPassword, res) {
        // update user table with new password and tokens
        await (function () {
            return new Promise((resolve) => {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPassword, salt, (err, hash) => {
                        user.password = hash;
                        user.resetPasswordToken = null;
                        user.resetPasswordExpires = null;
                        user.save().then(() => {
                            resolve();
                        }).catch((err) => {
                            res.redirect('/404');
                        });
                    });
                });
            });
        }());

        // send the mail to the user's email id regarding confirmation of password reset
        await (function (user) {
            return new Promise((resolve, reject) => {
                const smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS,
                    },
                });
                const mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'Your password has been changed',
                    text: `${'Hello,\n\n'
                    + 'This is a confirmation that the password for your account '}${user.email} has just been changed.\n`,
                };
                smtpTransport.sendMail(mailOptions, (err) => {
                    if (err) {
                        console.log(err);
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }(user));
    }

    async function mailVerifyEmail(user, res) {
        // generate the token
        const token = await (function () {
            return new Promise((resolve) => {
                crypto.randomBytes(20, (err, buf) => {
                    const token = buf.toString('hex');
                    resolve(token);
                });
            });
        }());

        // update user table with token and expiry time
        await (function (token) {
            return new Promise((resolve) => {
                user.verifyEmailToken = token;
                user.save().then(() => {
                    resolve();
                }).catch((err) => {
                    console.log(err);
                    res.redirect('/404');
                });
            });
        }(token));

        // send the mail to the user's email id
        await (function (token, user) {
            return new Promise((resolve, reject) => {
                const smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: CONFIG.SERVER.MAIL,
                        pass: CONFIG.SERVER.PASS,
                    },
                });
                const mailOptions = {
                    to: user.email,
                    from: CONFIG.SERVER.MAIL,
                    subject: 'verify email',
                    text: `${'You are receiving this because you (or someone else) have requested for verification of email for your account.\n\n'
                    + 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
                    + 'http://'}${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}/verify/${token}\n\n`
                    + 'If you did not request this, please ignore this email.\n',
                };
                smtpTransport.sendMail(mailOptions, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }(token, user));
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
                    { username: req.body.username },
                    { email: req.body.email },
                ],
            },
        })
            .then((user) => {
                if (!user) {
                    alert('username/email not found');
                    res.redirect('/forgot');
                    return;
                } 
                return mailPassword(user, res)  
            })
            .then(() => {

                alert('An e-mail has been sent to ' + user.email + ' with further instructions.');
                res.redirect('/');
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    });

    // when clicked on link from email
    app.get('/reset/:token', (req, res) => {
        Users.find({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Sequelize.Op.gte]: Date.now(),
                },
            },
        })
            .then((user) => {
                if (!user) {
                    alert('Password reset token is invalid or link has expired.');
                    res.redirect('/');
                } else {
                    res.render('password-reset', {
                        user,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    });

    // reset my password is clicked
    app.post('/reset/:token', (req, res) => {
        Users.find({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    [Sequelize.Op.gte]: Date.now(),
                },
            },
        })
            .then((user) => {
                if (!user) {
                    alert('Password reset token is invalid or link has expired.');
                    res.redirect('/');
                    return;
                }
                return mailConfirmation(user, req.body.password, res)
            })
            .then(() => {
                alert('\'success\', \'Success! Your password has been changed.\'');
                res.redirect('/login');
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    });

    //Render Login Page
    app.get("/login", (req, res) => {
        if (req.user)
            res.redirect("/users");
        else
            res.render("login",{
                message: req.flash("loginMsg")
            });
        }
    });

    //Login Route
    app.post("/login", Passport.authenticate('local', {
        successRedirect: "/users",
        failureRedirect: "/login",
        failureFlash: true
    }));

    //Render SignUp page
    app.get("/signup", (req, res) => {
        if (req.user)
            res.redirect("/users");
        else
            res.render("login",{
                message: req.flash("loginMsg")
            });
        }
    });

    //verify email
    app.get("/verify/:token", (req, res) => {
        Users.find({
            where: {
                verifyEmailToken: req.params.token,
            },
        })
            .then((user) => {
                if (!user) {
                    alert('verify email token is invalid.');
                    res.redirect('/');
                    return;
                } 
                    user.isVerified = true;
                    return user.save();
            })
            .then(()=>{
                req.login(user, () => {
                    res.redirect("/users");
                });
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/404');
            });
    });

    // New User via SignUp route
    app.post('/signup', upload.single('imgUploader'), (req, res) => {
        Users.find({
            where: {
                [Sequelize.Op.or]: [
                    { username: req.body.username },
                    { email: req.body.email },
                ],
            },
        })
            .then((user) => {
                if (!user) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                        // Store hash in your password DB.

                            Users.create({
                                username: req.body.username,
                                password: hash,
                                name: req.body.name,
                                email: req.body.email,
                                phone1: req.body.phone1,
                                phone2: req.body.phone2,
                                isVerified: false,
                            })
                                .then((user) => {
                                    models.UserBidsMap.create({
                                        userID: user.id,
                                        bidsOn: [],
                                    })
                                        .then((data) => {
                                            let imgName;
                                            if (req.file) {
                                                imgName = req.file.filename;
                                                fs.rename(path.join(__dirname, '../', 'public_html/Images/', imgName), path.join(__dirname, '../', 'public_html/Images/', `${user.id}.jpg`), (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        res.redirect('/404');
                                                    } else {
                                                    // Upload image
                                                        cloudinary.uploader.upload(path.join(__dirname, '../', 'public_html/Images/', `${user.id}.jpg`), (result) => {
                                                            console.log(result);

                                                            // Delete image from server
                                                            fs.stat(path.join(__dirname, '../', 'public_html/Images/', `${user.id}.jpg`), (err, stats) => {
                                                                console.log(stats);// here we got all information of file in stats variable
                                                                if (err) {
                                                                    return console.error(err);
                                                                }

                                                                fs.unlink(path.join(__dirname, '../', 'public_html/Images/', `${user.id}.jpg`), (err) => {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        res.redirect('/404');
                                                                    } else {
                                                                        console.log('file deleted successfully');
                                                                        // Store image url in DB
                                                                        user.img = result.url;
                                                                        user.save()
                                                                            .then(() => {
                                                                                return mailVerifyEmail(user, res)      
                                                                            })
                                                                            .then(() => {
                                                                                req.login(user, (err) => {
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                        res.redirect("/404");
                                                                                    }
                                                                                    else {
                                                                                        alert("A link has been sent to your email id to verify it.");
                                                                                        res.redirect('/login');
                                                                                    }
                                                                                });

                                                                            })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    })
                                                }


                                            })
                                        }
                                        else {
                                            user.img = "/images/user.png";
                                            user.save()
                                            .then(() => {
                                                return mailVerifyEmail(user, res)
                                            })
                                            .then(() => {
                                                req.login(user, (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        res.redirect("/404");
                                                    }
                                                    else {
                                                        alert("A link has been sent to your email id to verify it.");
                                                        res.redirect('/login');
                                                    }
                                                });

                                            })
                                                
                                        }
                                    })
                                    
                            })
                    })
                })

            }
            else {
                alert("Username already taken");
                res.redirect('/login');
            }


        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        })


});

    app.get('/resendEmail', (req, res) => {
        Users.findOne({
            where: {
                id: req.user.dataValues.id
            }
        })
        .then((user) => {
            return mailVerifyEmail(user, res)
        })
        .then(() => {
            alert("An Email has been sent again with the verification link");
            res.render('email-not-verified');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        })
    });
    // Logout route
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
};
