const PRODUCTION_CONFIGS = {
    SERVER: {
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        PASS: process.env.PASS,
        MAILPORT: process.env.MAILPORT,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
    },
    SQL: {
        URL: process.env.SQL_URL,
        // DATABASE: process.env.SQLDB,
        // HOST: process.env.SQLHOST,
        // USER: process.env.SQLUSER,
        // PASSWORD: process.env.SQLPASS
    },
    MONGO: {
        URI: process.env.MONGOURI,
        // USER: process.env.MONGOUSER,
        // PASS: process.env.MONGOPASS,
        // HOST: process.env.MONGOHOST,
        // PORT: 27017,
        // DB_NAME: process.env.MONGODB
        // SESSION: "sessions"
    },

};
if (process.env.NODE_ENV === "production") {
    module.exports = PRODUCTION_CONFIGS;
} else {
    module.exports = require("./configslocal");
}