'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

router.use(cookieParser());

router.post('/doNPCGo', function(req, res){
  if (req.cookies.uID) {
    mongoClient.connect(url, function(err, client){
        client.db("DarkWorld").collection("NPC_dialogs").find({ID: req.body.n}).toArray(function(err, result){
          try{
            res.send({code:500, art: result[0].art ,dlg: result[0].d1, otv: result[0].o1});
          }catch(e){
            console.log(e)
            res.send({code:450, error: "NPC dialog ERROR :(", author: 'SYSTEM'});
          }
        });
    });
  }
});

router.post('/doNPCdlg', function(req, res){
mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
    client.db("DarkWorld").collection("NPC_dialogs").find({ID: req.body.n[0] }).toArray(function(err, resultsNPC){
      // console.log(resultsNPC)
      let nuDLG = parseInt(req.body.n[1].replace(/[^-0-9]/gim,''))+1;
      //Отправляем ответ
      console.log(resultsNPC[0]["d"+(nuDLG+1)]);
      console.log(resultsNPC[0]["o"+(nuDLG+1)]);
      try{
        res.send({code:500, art: resultsNPC[0].art ,dlg: resultsNPC[0]["d"+(nuDLG+1)], otv: resultsNPC[0]["o"+(nuDLG+1)]});
      }catch(e){
        console.log(e)
        res.send({code:450, error: "NPC dialog ERROR :(", author: 'SYSTEM'});
      }

    });


});

// res.send('500')
});

module.exports = router;
