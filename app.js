'use strict';  //use ES6
const http = require('http');
const https = require('https');
const express = require('express');
const bParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();

//project libs use
app.use(bParser.urlencoded({extended: true}));
app.use(bParser.json());
app.use(express.static(__dirname + '/publick/'));
app.use(cookieParser());

//routes pages
const index = require('./routes/getIndex');
const register = require('./routes/getRegister');
const game = require('./routes/getGame');
const panel = require('./routes/getPanel');
const support = require('./routes/getSupport');

app.use('/', index);
app.use('/register', register);
app.use('/world', game);
// app.use('/panel', panel);
// app.use('/support', support);

//idnex controllers
const auth = require('./controllers/controllerAuthification');
app.post('/auth', auth);

const init = require('./controllers/controllerInit');
app.post('/init', init);

//register controllers
const registers = require('./controllers/controllerRegister');
app.post('/registrations', registers);

//game controllers
const gameInit = require('./controllers/browserGameController/controllerGameInit');
app.post('/gameInit', gameInit);

const locInit = require('./controllers/browserGameController/controllerLocationInit');
app.post('/locInit', locInit);

const doLocGo = require('./controllers/browserGameController/controllerGoToLocation');
app.post('/doLocGo', doLocGo);

const doNPCGo = require('./controllers/browserGameController/controllerGoToNPC');
app.post('/doNPCGo', doNPCGo);

const chat = require('./controllers/browserGameController/controllerChat');
app.post('/chat', chat);

const doItems = require('./controllers/browserGameController/postsController/items');
app.post('/doItems', doItems);

app.listen(8000, function(){
  global.onlineUsers = [];

  const mongoClient = require("mongodb").MongoClient;
  // const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase
  const url = "mongodb://134.249.117.218:27017/"; //url from mongoDB dataBase

  mongoClient.connect(url, { useNewUrlParser: true } ,function(err, client){
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

  });

  console.warn('started server Dark World from port: 8000');
});




// var options = {
//   key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
//   cert: fs.readFileSync('test/fixtures/keys/agent2-cert.cert')
// };
// app.listen(443, options, function(){
//   console.warn('started server Dark World from port: 443');
// })

// http.createServer(app).listen(8000);
// This line is from the Node.js HTTPS documentation.
// var options = {
  // key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  // cert: fs.readFileSync('test/fixtures/keys/agent2-cert.cert')
// };

// https.createServer(options, app).listen(443);


// const mongoClient = require("mongodb").MongoClient;

// const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

// mongoClient.connect(url, function(err, client){
//     const db = client.db("UsersData");
//     const collection = db.collection("users");
//
//     if(err) return console.log(err);
//
//        collection.find().toArray(function(err, results){
//            console.log(results);
//            client.close();
//        });
//
//       //  db.collection("users").remove({name: 'Tom'}, function(err, obj) {
//       //     if (err) throw err;
//       //     console.log(obj.result.n + " document(s) deleted");
//       //     client.close();
//       // });
// });
