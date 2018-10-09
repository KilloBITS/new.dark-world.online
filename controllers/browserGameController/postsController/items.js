'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

router.use(cookieParser());

router.post('/doItems', function(req, res){
  mongoClient.connect(url, function(err, client){
    var db = client.db("ITEMS");
    var db2 = client.db("DarkWorld");

    var collection = db.collection(req.body.d.n);
    var collection2 = db2.collection("Items");

    if(err) return console.log(err);
    collection.find({}).toArray(function(err, ItemRes){
      console.log(ItemRes.length);
      if(ItemRes.length > 0){
        var newItems = [];
        for(let i = 0; i < ItemRes.length; i++){
            collection2.find({Item_ID: ItemRes[i].items_id}).toArray(function(err, resss){
              resss[0].itemLengthUser = ItemRes[i].items_len;
              newItems.push(resss[0]);
              if(newItems.length >= ItemRes.length){
                res.send({code:500, items: newItems});
              }
            });
        }
      }else{
        res.send({code:500, items: []});
      }
    });
    client.close();
  });
});

module.exports = router;
