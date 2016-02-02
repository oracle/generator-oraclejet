/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt clean task

var constants = require("../../common/constants");

var cordovaDirectory = constants.CORDOVA_DIRECTORY;

module.exports =
{
  options: 
  {
    force: true
  },
  
  www: [cordovaDirectory + "/www/*"],
  mainTemp: [cordovaDirectory + "/www/js/main-temp.js"]
};
