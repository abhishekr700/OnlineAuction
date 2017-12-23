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
const Users = require("./models/sql/sequelize").Users;

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

//Set View Engine
app.set("view engine","ejs");

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

//Render Login Page
app.get("/login",(req,res)=>{
    res.render("login");
});

//Login Route
app.post("/login",Passport.authenticate('local',{
    successRedirect: "/pri",
    failureRedirect: "/"
}));

//Render SignUp page
app.get("/signup",(req,res)=>{
    res.render("signup");
});

//New User via SignUp route
app.post("/signup",(req,res)=>{
    Users.create({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        email: req.body.email,
        phone1: req.body.phone1,
        phone2: req.body.phone2
    })
});

//Show all users TODO: Remove this later
app.get("/showuser", (req,res) => {
    Users.findAll()
        .then((users)=>{
            res.send(users);
        })
});

//404 Handler
app.use(function (req,res) {
    res.send("404 Error !!!")
});

//Listen on port
app.listen(CONFIG.SERVER.PORT,function () {
   console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
