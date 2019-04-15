const PRODUCTION_CONFIGS = {
    SERVER : {
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        MAIL: process.env.MAIL,
        PASS: process.env.PASS
    },
    SQL: {
        DATABASE: process.env.SQLDB,
        HOST: process.env.SQLHOST,
        USER: process.env.SQLUSER,
        PASSWORD: process.env.SQLPASS
    },
    MONGO: {
        URI: process.env.MONGOURI,
        // HOST: process.env.MONGOHOST,
        // PORT: 27017,
        // DB_NAME: process.env.MONGODB,
       // SESSION: "sessions"
    }
};
if(process.env.NODE_ENV === "production"){
    module.exports = PRODUCTION_CONFIGS;
}else {
    module.exports = require("./configs-local");
}
