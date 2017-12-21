/*
    Import Modules
 */
const express = require("express");
const path = require("path");

/*
    Import User Files
 */
const CONFIG = require("./configs");

//Initialise Server
const app = express();

/*
    MiddleWares
 */
app.use(express.static(path.join(__dirname,"/public_html")));


//Listen on port
app.listen(CONFIG.SERVER.PORT,function () {
   console.log(`Server running @ http://${CONFIG.SERVER.HOST}:${CONFIG.SERVER.PORT}`);
});
