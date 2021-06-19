const Sequelize = require("sequelize");
const CONFIG = require("../../configs");

// console.log("SQL:", CONFIG.SQL.DATABASE, CONFIG.SQL.USER, CONFIG.SQL.PASSWORD);
// console.log("sqlurl:", CONFIG.SQL.URL );


//DB Configuration
const database = new Sequelize(CONFIG.SQL.DATABASE, CONFIG.SQL.USER, CONFIG.SQL.PASSWORD, {
    dialect: "mysql",
    host: CONFIG.SQL.HOST,
    logging: false
});

// const database = new Sequelize(CONFIG.SQL.URL,{
//     dialect: "mysql"
// });

//Test DB Connection
database.authenticate()
    .then(() => {
        console.log("Successful connection to SQL DB");
    })
    .catch((err) => {
        console.log("Connection Error: " + err);
        process.exit();
    });

var Users = database.import("./users.js");
Users.sync({alter:true});

module.exports = {
    Users
};