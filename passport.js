const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const users = [
    {
        username: "a",
        password: "ap",
        id: 1
    },
    {
        username: "b",
        password: "bp",
        id: 2
    },
    {
        username: "c",
        password: "cp",
        id: 3
    }
];

//Serialize user
passport.serializeUser(function (user,done) {
   console.log("Serialized !");
   done(null,user.id);
});

//De-Serialize User
passport.deserializeUser(function (id,done) {
    console.log("Deserialize !");
    for(i in users){
        if(users[i].id == id){
            done(null,users[i]);
        }
    }
});

const localstrategy = new LocalStrategy(
    function (username,password,done) {
        console.log("Local-Starategy !");
        for(i in users){
            if(users[i].username === username){
                if(users[i].password === password){
                    return done(null,users[i]);
                }
                return done(null,false);
            }
        }
        return done(null,false);
    }

);

//User "localstrategy" at "local"
passport.use('local',localstrategy);

//Expose passport to be used in server.js
module.exports = passport;