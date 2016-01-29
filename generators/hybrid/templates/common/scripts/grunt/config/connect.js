/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt connect task

var constants = require("../../common/constants");
var cordovaDirectory = constants.CORDOVA_DIRECTORY;

module.exports = {
  
  //to start the server for hosting
  devServer: 
  {
    options: 
    { 
      hostname:'localhost',
      port: '<%= oraclejet.ports.server %>',
      livereload: '<%= oraclejet.ports.livereload %>',
      base: [cordovaDirectory + "/merges/<%= platform %>", cordovaDirectory + "/www"]
    }
  },

  releaseServer: 
  {
    options: 
    {
      port: '<%= oraclejet.ports.server %>',
      base: [cordovaDirectory + "/merges/<%= platform %>", cordovaDirectory + "/www"]
    }
  }
  
};