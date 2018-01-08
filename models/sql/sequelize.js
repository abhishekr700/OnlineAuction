const Sequelize = require("sequelize");
const CONFIG = require("../../configs");

//DB Configuration
const database = new Sequelize(CONFIG.SQL.DATABASE, CONFIG.SQL.USER, CONFIG.SQL.PASSWORD, {
    dialect: "mysql",
    host: CONFIG.SQL.HOST
});

//Test DB Connection
database.authenticate()
    .then(() => {
        console.log("Successful connection to DB");
    })
    .catch((err) => {
        console.log("Connection Error: " + err);
        process.exit();
    });

var Users = database.import("./users.js");
Users.sync();

module.exports = {
    Users
};