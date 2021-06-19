const PRODUCTION_CONFIGS = {
    SERVER: {
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        MAIL: process.env.MAIL,
        MAILPORT: process.env.MAILPORT,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
    },
    SQL: {
        DATABASE: process.env.SQLDB,
        HOST: process.env.SQLHOST,
        USER: process.env.SQLUSER,
        PASSWORD: process.env.SQLPASS
    },
    MONGO: {
        URI: process.env.MONGOURI,
    },
    IMAGES: {
        CLOUD_NAME: process.env.CLOUD_NAME,
        API_KEY: process.env.API_KEY,
        API_SECRET: process.env.API_SECRET
    }

};
if (process.env.NODE_ENV === "production") {
    module.exports = PRODUCTION_CONFIGS;
} else {
    module.exports = require("./configslocal");
}