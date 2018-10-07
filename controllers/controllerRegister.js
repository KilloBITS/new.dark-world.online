'use strict';
const express = require('express');
const router = express.Router();
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase
const bParser = require('body-parser');
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'riznik.comment@gmail.com',
        pass: 'qazwsx159357'
    }
});

function mailOptions(a, b, c, d) {
    this.from = a, //'riznik.comment@gmail.com',
    this.to = b, //'mr.kalinuk@gmail.com',
    this.subject = c, //'Sending Email using Node.js',
    this.text = d;//'That was easy!';
}

function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

var registrations = function(req, res, next)  {
  let userNEW = req.body.data;
  // res.send('{"code":500, "message":"Регистрация временно недоступна, следите за новостями!"}');
  mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
    var db = client.db("DarkWorld");
    var collection = db.collection("Users");
    if(err) return console.log(err);

    collection.find({nick:userNEW.nick}).toArray(function(err, results){
      if(results[0] !== undefined){
        res.send('{"code":450, "message":"Пользователь с таким ником уже сущевствует!"}');
      }else{ //Такого пользователя нету, регистрация возможна
        let userDATA = userNEW;
        userDATA.privilegies = 1;
        userDATA.secret = null;

        //создаем объект с физуальными характеристиками
        let visual = new Object({
          hairy: userDATA.hairy,
          face: userDATA.face,
          body: userDATA.body,
          foot: userDATA.foot,
          foot2: userDATA.foot2
        });

        userDATA.visual = visual;
        userDATA.rank = 1;
        userDATA.repa = 1;

        let txt = randomInteger(100000, 999999).toString();
        userDATA.private = {
          code: txt,
          pod: undefined
        }
        //удаляем ненужное с глобального объекта
        delete userDATA.hairy;
        delete userDATA.face;
        delete userDATA.body;
        delete userDATA.foot;
        delete userDATA.foot2;

        // let ml = new mailOptions("riznik.comment@gmail.com", userDATA.email, 'Код Подтверждения регистрации: ', txt); //panriznik@gmail.com
        // transporter.sendMail(ml, function (error, info) {
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         console.log('Email sent: ' + info.response);
        //         let users1 = 'userSMS' + results[0].Name;
        //         global[users1] = txt;
        //     }
        // });

        collection.insertOne(userDATA);

        client.db("DarkWorld").collection("Users").find({nick:userNEW.nick}).toArray(function(err, results){
          let NewUserGame = {
            userID: results[0]._id.toString(),
            userLocation: 8,
            userRegion: 1,
            userNick: userNEW.nick
          }
          client.db("DarkWorld").collection("UserLocationsData").insertOne(NewUserGame);
        });

        res.send('{"code":500, "message":"Вы успешно зарегистрированы.<br>Сообщение с кодом подтверждения отправленно вам на електронную почту!"}');

          var GameData = client.db("DarkWorld");

          var loc = GameData.collection("Locations");
          var npc  = GameData.collection("NPC");

          if(err) return console.log(err);

          loc.find().toArray(function(err, results){
            global.LOCATION = results;
          });
          npc.find().toArray(function(err, results){
            global.NPC = results;
          });

      }
      // client.close();
    });
  });
};

router.post('/registrations', registrations, function(req, res, next){});

module.exports = router;
