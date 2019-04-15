const CONFIG = require("./configs");
const MONGOOSE_URI = `mongodb+srv://${CONFIG.MONGO.USER}:${CONFIG.MONGO.PASS}@${CONFIG.MONGO.HOST}/${CONFIG.MONGO.DB_NAME}?ssl=true`

//CheckLoggedIN
function checkLoggedIn(req, res, next) {
    if (req.user && req.user.dataValues.isVerified===false) {
        res.render("email-not-verified");
    }else if(req.user)
        next();
    else {
        // console.log("Unauthorized Access !");
        res.redirect("/login");
    }
}

module.exports = {
    checkLoggedIn,MONGOOSE_URI
};