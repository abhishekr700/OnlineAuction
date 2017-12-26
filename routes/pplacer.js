const route=require('express').Router();
const models = require("../models/mongodb/mongo");
const multer=require('multer');

let Storage = multer.diskStorage({
    destination:  './public_html/Images',
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
route.get('/',function (req,res) {
    res.redirect('http://localhost:2345/pplacer.html');
});
let upload = multer({ storage: Storage });
//add products to db
route.post('/addproduct',upload.single('imgUploader'),function (req,res) {
    models.Products.create({
        img:req.file.filename,
        // userID: req.user.id,
        name: req.body.productname,
        desc: req.body.desc,
        category: req.body.category,
        basevalue: req.body.basevalue,
        duration: req.body.duration
    })
        .then((result)=>{res.redirect('/pplacer')})
        .catch((err)=>{console.error(err)})
});
exports.route=route;