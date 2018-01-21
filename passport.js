//Import Passport
const passport = require("passport");
//Import LocalStrategy module
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs')
//Import User Model
const Users = require("./models/sql/sequelize.js").Users;

//Serialize user
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//De-Serialize User
passport.deserializeUser(function (id, done) {
    Users.findById(id)
        .then((user) => {
            done(null, user);
        })
        .catch((err)=>{
        console.log(err);
        })
});

//Define LocalStrategy
const localstrategy = new LocalStrategy(
    {
        passReqToCallback : true
    },
    function (req, username, password, done) {
        Users.findOne({
            where: {
                username: username
            }
        })
            .then((user) => {
                if (user == null) {
                    return done(null, false, req.flash("loginMsg","Username not found !"));
                } else {

                    bcrypt.compare(password, user.password).then((res) => {
                        // res === true
                        if (res) {

                            return done(null, user);
                        }
                        else {
                            return done(null, false, req.flash("loginMsg","Password incorrect !"));
                        }

                    });
                }
            })
           .catch((err)=>{
            console.log(err);
        })
    }
);

//User "localstrategy" at "local"
passport.use('local', localstrategy);

//Expose passport to be used in server.js
module.exports = passport;