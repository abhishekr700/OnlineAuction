/*
    Import Modules
 */
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require('socket.io');
const Sequelize = require("sequelize");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')(session);
const flash = require("connect-flash");
require('dotenv').config()


/*
    Import User Files
 */
const CONFIG = require("./configs");
const Users = require("./models/sql/sequelize").Users;
const HELPERS = require("./helpers");
const Passport = require("./passport");
const models = require("./models/mongodb/mongo");

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

const connection = mongoose.createConnection(CONFIG.MONGO.URI, {
    useNewUrlParser: true
});
const store = new MongoStore({mongooseConnection: connection});
let sessionModel = mongoose.model('sessions', new mongoose.Schema({session: Object, expires: Date}));
let Sessions = sessionModel.base.models.sessions;

//Set View Engine
app.set("view engine", "ejs");

//Handle sessions
let sessionMiddleware = session({
    resave: true,
    saveUninitialized: false,
    secret: "Boli_Lagegi",
    store: store,
    //if maxAge not set, cookie valid for current session only(until browser restart)
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 10      //10 days
    },

})
app.use(sessionMiddleware);

app.use(flash());

//Initialise passport
app.use(Passport.initialize());

//Ensure persistent sessions
app.use(Passport.session());

/*
    Routes
 */

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

//Items route
app.use("/items", require("./routes/items"));
app.use("/bids", require("./routes/bids"));
app.use('/users', HELPERS.checkLoggedIn, require("./routes/users"));
require("./routes/auth")(app);

/*
    Other Routes
 */

//Render Landing Page
// Modified By Bhavya
app.get("/", (req, res) => {

    models.Products.find(
        {
            endDate: {
                $gt: Date.now()
            }
        }
    )
        .then((items) => {
            let itemsTobeSent = [];

            for (let i = items.length - 1; i >= 0; i--)
                itemsTobeSent.push(items[i]);

            res.render("index", {
                items: itemsTobeSent
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/404');
        })

});

//render contact us page

app.get("/contact", (req, res) => {
    res.render('contact');
});
app.get("/privacy-policy", (req, res) => {
    res.render('privacy-policy');
});
app.get("/terms-and-conditions", (req, res) => {
    res.render('termsAndConditions');
});

//render meet the creator page

app.get("/meetTheCreators",(req,res)=>{
    res.render("meetTheCreators");
})
//404 Handler
app.get('/404',function (req, res) {
    res.render('404');
});

app.use(function (req, res) {
    res.render('404');
});

let ProductSocketMap = {};
let arr = [];

io.use(function (socket, next) {
    // Wrap the express middleware
    sessionMiddleware(socket.request, {}, next);
});


io.on('connection', (socket) => {


    let pass = socket.request.session.passport;
    let userId;
    if (!pass) {

    } else {
        userId = pass.user;
    }
// event fired when user opens product page
    socket.on('prodID', (data) => {
        // add new user to product socket map
        arr = ProductSocketMap[data.prodId];
        if (!arr) {
            arr = [];
        }
        arr.push(socket.id);
        ProductSocketMap[data.prodId] = arr;
        arr = [];
        Users.findAll({
            attributes: ['id', 'username','img']
        })
            .then((users) => {
                models.Bids.findOne({ProdID: data.prodId})
                    .then((bids) => {
                        for (let i of ProductSocketMap[data.prodId])
                            if (i === socket.id) {
                                socket.emit('bid', {
                                    bids: bids,
                                    users: users
                                })
                            } else {
                                socket.to(i).emit('bid', {
                                    bids: bids,
                                    users: users
                                })
                            }
                    });
            })
            .catch((err)=>{
              console.log(err);
            })
    });

    socket.on("bid-closed", (data) => {

        models.Products.findById(data.prodID)
            .then((item) => {
                let curDate = new Date();
                let timeRemaining = (item.endDate - curDate) / 1000;
                if (timeRemaining > 0) {
                    socket.emit("msg", {msg: "Time left for bid close !"})
                }
                //Bid actually closed Therefore, update isOpen values
                else {
                    models.Bids.findOne({
                        ProdID: data.prodID
                    })
                        .then(function (bidentry) {
                            bidentry.isOpen = false;
                            bidentry.save();

                            let userID = socket.request.session.passport.user;
                            //Check if user is winner\
                            let winner = bidentry.allBids[bidentry.allBids.length - 1];
                            if (winner && userID === winner.userID) {
                                socket.emit("msg", {
                                    msg: "You won the bid"
                                });
                            }
                            else if (userID === item.userID) {
                                if (winner)
                                {
                                    Users.findOne({
                                        where :{
                                            id: winner.userID
                                        },
                                        attributes:[
                                            'username'
                                        ]
                                    }).then((user)=>{
                                        socket.emit("msg", {msg: "Your product was purchased by " + user.username})
                                    }).catch((err)=>{
                                        console.log(err);
                                    })

                                }
                                else
                                    socket.emit("msg", {msg: "Your product went unsold"})
                            }
                            else {
                                for (let bid of bidentry.allBids) {
                                    if (bid.userID === userID) {
                                        socket.emit("msg", {
                                            msg: "You lost the bid"
                                        });
                                    }
                                }
                            }


                        })
                        .catch((err) => {
                            console.log(err);
                        })
                }
            })
            .catch((err) => {
                console.log(err);
            })
    })

});

//Listen on port
Server.listen(CONFIG.SERVER.PORT, function () {
    console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
