'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

router.use(cookieParser());

router.post('/locInit', function(req, res){
  if (req.cookies.uID) {
    mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
      var GameProcess = client.db("DarkWorld");
      var collection = GameProcess.collection("UserLocationsData");

      if(err) return console.log(err);

      collection.find({userID: req.cookies.uID }).toArray(function(err, results){
        if(results[0] !== undefined){
          client.db("DarkWorld").collection("Locations").find({LOC_ID:results[0].userLocation}).toArray(function(err, resultsLOC){
            var dnpc = [];
            var dloc = [];
            //получаем список НПС на локации
            for(let i = 0; i < resultsLOC[0].npc.length; i++){
              dnpc.push(global.NPC.find(x => x.idNPC === resultsLOC[0].npc[i]));
              delete dnpc[i]._id
            }

            for(let i = 0; i < resultsLOC[0].logGo.length; i++){
              dloc.push(global.LOCATION.find(x => x.LOC_ID === parseInt(resultsLOC[0].logGo[i])));
              delete dloc[i]._id
              delete dloc[i].logGo
              delete dloc[i].mon
              delete dloc[i].npc
              delete dloc[i].region
              delete dloc[i].text
              delete dloc[i].warn
            }
            //Отправляем ответ
            res.send({code:500, locDATA: resultsLOC[0], npcData: dnpc, locGO: dloc});
          });
        }else{
            res.send({code:430})
        }
      });
    });
  }
});

module.exports = router;
