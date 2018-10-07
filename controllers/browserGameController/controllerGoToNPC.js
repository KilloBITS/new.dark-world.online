'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

router.use(cookieParser());

router.post('/doNPCGo', function(req, res){
  if (req.cookies.uID) {
    mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){

        client.db("DarkWorld").collection("NPC_dialogs").find({ID: req.body.n }).toArray(function(err, resultsNPC){
          console.log(resultsNPC)
          //Отправляем ответ
          try{
            res.send({code:500, art: resultsNPC[0].art ,dlg: resultsNPC[0].d1, otv: resultsNPC[0].o1});
          }catch(e){
            console.log(e)
            res.send({code:450, error: "NPC dialog ERROR :(", author: 'SYSTEM'});
          }

        });


    });
  }
});

module.exports = router;
