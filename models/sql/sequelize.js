const Sequelize = require("sequelize");
const CONFIG = require("../../configs");

//DB Configuration
const database = new Sequelize(CONFIG.SQL.DATABASE, CONFIG.SQL.USER, CONFIG.SQL.PASSWORD, {
    dialect: "mysql",
    host: CONFIG.SQL.HOST,
    logging: false
});

//Test DB Connection
database.authenticate()
    .then(() => {
        console.log("Successful connection to DB");
    })
    .catch((err) => {
        console.log("Connection Error: " + err);
        process.exit(3);
    });

var Users = database.import("./users.js");
Users.sync({alter:true});

module.exports = {
    Users
};