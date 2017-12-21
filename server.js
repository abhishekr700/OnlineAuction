/*
    Import Modules
 */
const express = require("express");
const path = require("path");

/*
    Import User Files
 */
const CONFIG = require("./configs");
const Passport = require("./passport");
const session = require("express-session");

//Initialise Server
const app = express();

/*
    MiddleWares
 */
//Serve Static Files
app.use(express.static(path.join(__dirname,"/public_html")));

//Handle form-data (JSON & UrlEncoded)
app.use(express.json());
app.use(express.urlencoded({
    extended : true
}));

//Handle sessions
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "Boli_Lagegi"
}));

//Initialise passport
app.use(Passport.initialize());

//Ensure persistent sessions
app.use(Passport.session());

//Login Route
app.post("/login",Passport.authenticate('local',{
    successRedirect: "/pri",
    failureRedirect: "/"
}));

//404 Handler
app.use(function (req,res) {
    res.send("404 Error !!!")
});

//Listen on port
app.listen(CONFIG.SERVER.PORT,function () {
   console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
