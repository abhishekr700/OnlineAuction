const MongoClient = require('mongodb').MongoClient;
const DB = require('../../configs').DB;
let productcollection=null;
MongoClient.connect(DB.URI,function (err,db) {
    if(err) throw err;
    productcollection=db.collection('products');
});
const Product={
    create:function (productobj) {
        return new Promise(function (resolve,reject) {
            productcollection.insertOne(productobj,function (err,result) {
                if(err) return reject(err);
                return resolve(result);
            })
        })
    },
    findall:function (whereargs) {
        return new Promise(function (resolve,reject) {
            productcollection.find(whereargs).toArray(function (err,result) {
                if(err) return reject(err);
                return resolve(result);
            })
        })
    }
};
exports.models={
    Product
};