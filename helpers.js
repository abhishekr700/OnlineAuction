//CheckLoggedIN
function checkLoggedIn(req, res, next) {
    if (req.user && req.user.dataValues.isVerified===false) {
        res.send("E-mail not verified");
    }else if(req.user)
        next();
    else {
        // console.log("Unauthorized Access !");
        res.redirect("/login");
    }
}

module.exports = {
    checkLoggedIn
};