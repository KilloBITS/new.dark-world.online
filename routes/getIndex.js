'use strict';
const express = require('express');
const router = express.Router();
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

router.get('/', function(req, res, next){
  mongoClient.connect(url, function(err, client){
      const db = client.db("DarkWorld");
      const collection = db.collection("newsGame");

      if(err) return console.log(err);

     collection.find().toArray(function(err, results){
         res.render('index.ejs',{news: results, online: global.onlineUsers.length})
         client.close();
     });
  });
});

module.exports = router;
