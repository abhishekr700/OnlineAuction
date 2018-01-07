//Import Passport
const passport = require("passport");
//Import LocalStrategy module
const LocalStrategy = require("passport-local").Strategy;

//Import User Model
const Users = require("./models/sql/sequelize.js").Users;

//Serialize user
passport.serializeUser(function (user,done) {
   // console.log("Serialized !");
   done(null,user.id);
});

//De-Serialize User
passport.deserializeUser(function (id,done) {
    // console.log("Deserialize !");
    Users.findById(id)
        .then( (user)=>{
            // console.log(user);
            done(null,user);
        } )
});

//Define LocalStrategy
const localstrategy = new LocalStrategy(
    function (username,password,done) {
        //console.log("Local-Starategy !");
        Users.findOne( {
            where : {
                username : username
            }
        })
            .then((user) => {
                if(user == null){
                    //console.log("Username not found");
                    return done(null,false,{message: "Username not found !"})
                }
                if(password === user.password){
                  //  console.log("User found");
                    return done(null,user);
                }
              //  console.log("Pass incorrect");
                return done(null,false,{message: "Pass incorrect !"});
            });
    }

);

//User "localstrategy" at "local"
passport.use('local',localstrategy);

//Expose passport to be used in server.js
module.exports = passport;