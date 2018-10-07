'use strict';
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase
const bParser = require('body-parser');

router.use(cookieParser());

var AuthController = {
  NotLogin: "Неверный логин или пароль!",
  BlockedAccaunt: "Ваш аккаунт заблокирован. :(",
  NotCaptcha: "Неверная капча.",
  key_generator: function(len){ //генератор ключа
    var length = (len) ? (len) : (10);
    var string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; //to upper
    var numeric = '01234567895645874684156873524357454151156468755154686002545641025374';
    var password = "";
    var character = "";
    while (password.length < length) {
         var entity1 = Math.ceil(string.length * Math.random() * Math.random());
         var entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
         var hold = string.charAt(entity1);
         hold = (entity1 % 2 === 0) ? (hold.toUpperCase()) : (hold);
         character += hold;
         character += numeric.charAt(entity2);
         password = character;
    }
    return password;
  },
  setSession: function(a, b, c){  //a - Ник; b - uID; c - AuthKey (Создание сессии)
    mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
      var db = client.db("DarkWorld");
      var collection = db.collection("Session");

      if(err) return console.log(err);

      // collection.find({nick:userLogin}).toArray(function(err, results){
        let SessionData = new Object();
        SessionData.a = a;
        SessionData.b = b;
        SessionData.c = c;
        console.log(SessionData)
        collection.insertOne(SessionData);
        client.close();
      // });
    });
  },
  authStructure: function(req, res, next){ //Функция авторизации
    mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
      var db = client.db("DarkWorld");
      var collection = db.collection("Users");

      if(err) return console.log(err);
      let userLogin = req.body.login;
      let userPass = req.body.password;

      collection.find({nick:userLogin}).toArray(function(err, results){
        if(results[0] !== undefined){
          if(results[0].pass === userPass){
            if(!results[0].blocked){
              results[0].pass = 'Информация недоступна!';
              results[0].secret = 'Информация недоступна!';

              let newKey = AuthController.key_generator(35);

              AuthController.setSession(results[0].nick, results[0]._id.toString(), newKey);

              res.cookie('AuthKEY', newKey);
              res.cookie('uID', results[0]._id.toString());
              res.cookie('language', "rus");

              res.send({code:500, userDATA:JSON.stringify(results[0])})
            }else{
              res.send({code:450, type:"nRed", error: AuthController.BlockedAccaunt})
            }
          }else{
            res.send({code:450, type:"nRed", error: AuthController.NotLogin})
          }
          next();
        }else{
          res.send({code:450, type:"nRed", error:AuthController.NotLogin})
          next();
        }
        client.close();
      });
    });
  }
};

router.post('/auth', AuthController.authStructure, function(req, res, next){});

module.exports = router;
