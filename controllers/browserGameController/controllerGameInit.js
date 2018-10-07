'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase
const bParser = require('body-parser');

router.use(cookieParser());

var initFunction = (req, res, next) => {
  if (req.cookies.uID) {
    mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
      var db = client.db("DarkWorld");
      var collection = db.collection("Session"),
          collection2 = db.collection("Users");

      if(err) return console.log(err);

      collection.find({c:req.cookies.AuthKEY}).toArray(function(err, results){
        if(results[0] !== undefined){
          collection2.find({nick:results[0].a}).toArray(function(err, results2){
            delete results2[0].pass;
            delete results2[0].secret;
            delete results2[0].private;
            res.send({code:500, userDATA: results2[0]})
          });
        }else{
          res.send({code:430})
        }
        client.close();
      });

    });
  }

};

router.post('/gameInit', initFunction, function(req, res, next){});

module.exports = router;
