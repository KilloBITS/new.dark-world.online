'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase
const bParser = require('body-parser');
router.use(cookieParser());

var getGame = {
  getAuth: function(req, res, next){
    if (req.cookies.uID) {
      mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
        var db = client.db("DarkWorld");
        var collection = db.collection("Session");
        if(err) return console.log(err);

        collection.find({c:req.cookies.AuthKEY}).toArray(function(err, results){
          if(results[0] !== undefined){
              res.render('game.ejs');
          }else{
              res.redirect('/');
          }
          client.close();
        });

      });
    }else{
        res.redirect('/');
    }
  }
}

router.get('/', getGame.getAuth);

module.exports = router;
