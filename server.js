/*
    Import Modules
 */
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require('socket.io');
const Sequelize = require("sequelize");
const session = require("express-session");
const mongoose=require("mongoose");
const MongoStore = require('connect-mongo')(session);

/*
    Import User Files
 */
const CONFIG = require("./configs");
const Users = require("./models/sql/sequelize").Users;
const HELPERS = require("./helpers");
const Passport = require("./passport");
const models = require("./models/mongodb/mongo");
//const async=require('async');

//Initialise Server
const app = express();
const Server = http.Server(app);
const io = socketIo(Server);

/*
    MiddleWares
 */

//Serve Static Files
app.use(express.static(path.join(__dirname, "/public_html")));

//Handle form-data (JSON & UrlEncoded)
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const connection = mongoose.createConnection(`mongodb://${CONFIG.MONGO.HOST}:${CONFIG.MONGO.PORT}/${CONFIG.MONGO.DB_NAME}`, {
    useMongoClient: true
});
const store= new MongoStore({mongooseConnection: connection});
let sessionModel=mongoose.model('sessions',new mongoose.Schema({ session: Object, expires: Date}));
let Sessions=sessionModel.base.models.sessions;

//Set View Engine
app.set("view engine", "ejs");

//Handle sessions
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: "Boli_Lagegi",
    store: store
}));


//Initialise passport
app.use(Passport.initialize());

//Ensure persistent sessions
app.use(Passport.session());

/*
    Routes
 */

//Items route
app.use("/items", require("./routes/items"));
app.use("/bids", require("./routes/bids"));
app.use('/users', HELPERS.checkLoggedIn, require("./routes/users"));
require("./routes/auth")(app);

/*
    Other Routes
 */

//Render Landing Page
app.get("/", (req, res) => {
    res.render("index");
});


//404 Handler
app.use(function (req, res) {
    res.send("404 Error !!!")
});

Sessions.find()
    .then((sessions)=> {

    let user=JSON.parse(sessions[0].session).passport.user;

   console.log(user);
    }).catch((err)=>
    {
        console.log(err);
    });

let pplacers = {};
let arr = [];
io.on('connection', (socket) => {
    // console.log("socket created " + socket.id);
    socket.on('prodID', (data) => {
        // console.log("1", pplacers);
        arr = pplacers[data.prodId];
        if (!arr) {
            arr = [];
        }
        // console.log(arr);
        arr.push(socket.id)
        // console.log(arr);
        pplacers[data.prodId] = arr;
        // console.log(pplacers);
        arr = [];
        // console.log(pplacers);
        console.log("ProdId: " + data.prodId);
        models.Bids.findOne({ProdID: data.prodId})
            .then((bids) => {

                socket.emit('bid', {bids: bids})
            });
    });


    socket.on('bid2', (data) => {
        // console.log("abc");

        models.Bids.findOne({ProdID: data.prodId})
            .then((bids) => {
                for (let i of pplacers[data.prodId])
                    socket.to(i).emit('bid', {bids: bids})
            });
    })

});

//Listen on port
Server.listen(CONFIG.SERVER.PORT, function () {
    console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
