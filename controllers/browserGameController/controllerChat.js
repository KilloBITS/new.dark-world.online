'use strict';
const express = require('express');
const http = require('http');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase
const bParser = require('body-parser');
const options = {pingInterval: 10, cookie: false};

let app = express();
let server = http.createServer(app);

const io = require('socket.io').listen(server,  options);
global.socketIO = io;

io.sockets.on('connection', function (client) {
    client.on('clientConnect', function(data){ //подключение к чату
        client.username = data.nickName;
        client.ak = data.AuthKEY;

        mongoClient.connect(url, { useNewUrlParser: true } ,function(err, clientDB){
          clientDB.db("DarkWorld").collection("UserLocationsData").updateOne({ userNick: data.nickName },{ $set: {online: true}  });
        });

        if(global.onlineUsers.indexOf(data.nickName) === -1){
          global.onlineUsers.push(data.nickName);
        }

        client.join('mainChat');
        client.join('ShopChat');
        mongoClient.connect(url, { useNewUrlParser: true } ,function(err, clientDB){
            clientDB.db("DarkWorld").collection("UserLocationsData").find({userNick: data.nickName}).toArray(function(err, reslocLen){
              client.join("loc"+reslocLen[0].userLocation);
            });
        });
    });

    client.on('JoinRoom', function (JL) {
      console.log(JL.JR);
      client.join("loc"+JL.JR);
    });

    client.on('message', function (MD) { //функция отправки сообщений
      mongoClient.connect(url, { useNewUrlParser: true } ,function(err, clientMDB){
        var db = clientMDB.db("DarkWorld");
        var collection = db.collection("Session"),
            collection2 = db.collection("Users");

        collection.find({c:MD.ak}).toArray(function(err, results){
            collection2.find({nick: results[0].a}).toArray(function(err, results2){
              if(MD.type && (MD.type === 1) && parseInt(results2[0].rank) > 8){
                var typeMSG = 1;
              }else{
                var typeMSG = 0;
              }

              var userLoc = MD.r;

              let msg = {
                m: MD.message,
                n: results2[0].nick,
                r: 'textColor'+results2[0].rank,
                t: typeMSG,
                ro: userLoc
              };

              switch(msg.t){
                case 0: io.sockets.in(userLoc).emit('message', msg);break;
                case 1: io.sockets.emit('message', msg); break;
              }
            });
          clientMDB.close();
        });
      });
    });

    client.on('ULL', function(loc){ //подключение к чату
      mongoClient.connect(url, { useNewUrlParser: true } ,function(err, clientdb){
          clientdb.db("DarkWorld").collection("UserLocationsData").find({userLocation: loc.myLoc, online: true}).toArray(function(err, reslocLen){
            io.sockets.in("loc"+loc.myLoc).emit('ULL', reslocLen)
            // client.emit('ULL', reslocLen);
          });
      });
    });

    // Отключение от сервера
    client.on('disconnect', function() {
      let index = global.onlineUsers.indexOf(client.username);
      if( index !== -1 ){
        global.onlineUsers.splice(index, 1);
        mongoClient.connect(url, { useNewUrlParser: true } ,function(err, clientDB){
          clientDB.db("DarkWorld").collection("UserLocationsData").updateOne({ userNick: client.username },{ $set: {online: false}  });
        });
      }
    });
});

server.listen(3000, function (err) {
  console.log('Chat server starter...');
});

module.exports = router;
