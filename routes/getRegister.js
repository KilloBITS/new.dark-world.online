'use strict';

var express = require('express');
var routerReg = express.Router();
const mongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/"; //url from mongoDB dataBase

routerReg.get('/', function(req, res){
  mongoClient.connect(url, function(err, client){
      const db = client.db("DarkWorld");
      const config = db.collection("config");

      if(err) return console.log(err);

     config.find().toArray(function(err, results_config){
         res.render('register.ejs',{config: results_config[0]})
         client.close();
     });
  });
});

module.exports = routerReg;
