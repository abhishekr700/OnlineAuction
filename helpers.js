//CheckLoggedIN
function checkLoggedIn(req,res,next) {
    if(req.user)
        next();
    else {
       // console.log("Unauthorized Access !");
        res.redirect("/login");
    }
}

module.exports = {
    checkLoggedIn
};