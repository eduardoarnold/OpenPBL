/*global process, module*/
'use strict';

// Declare express app as global
var globalApplication;

// Database connection address.
var databaseURI = process.env.CONN_STRING;

// Initalize all the express server configurations.
module.exports = function(express, app ,path ,mongoose ,cookieParser ,bodyParser ) {

  //set the global app
  globalApplication = app;

  configurePublicPath(express,path);

  configureCookieParser(cookieParser);

  configureBodyParser(bodyParser);

  configureDataBase(mongoose,databaseURI);

};


/**
  Private Fields:

    configurePublicPath   =>  Set the default public acessible path as 'app/public'

    configureCookieParser =>  Get all the cookies baby (͡°͜ʖ͡°)

    configureBodyParser   =>  Enable parsing html forms and URL encoded JSON

    configureDatabase     =>  Gear UP the database mongoose communication, 
                              by default, 'mongodb://' is already set.                          
*/
var configurePublicPath = function(express, path) {
  globalApplication.use(express.static(path.resolve('app/public')));
};

var configureCookieParser = function(cookieParser) {
  globalApplication.use(cookieParser());
};

var configureBodyParser = function(bodyParser) {
  globalApplication.use(bodyParser.json());
  globalApplication.use(bodyParser.urlencoded({ extended: true }));
};

var configureDataBase = function(databasEngine, url) {
  var connectionString = 'mongodb://' + url;
  databasEngine.connect(connectionString);
};