/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt requirejs task

var constants = require("../../common/constants");
var cordovaDirectory = constants.CORDOVA_DIRECTORY;

module.exports = {
  
  //to compress the main.js
  main: 
  {
    options: 
    {
      baseUrl: cordovaDirectory + "/www/js",
      name: "main-temp",
      mainConfigFile: cordovaDirectory + "/www/js/main-temp.js",
      optimize: "none",
      out: cordovaDirectory + "/www/js/main.js"
    }
  }
  
};