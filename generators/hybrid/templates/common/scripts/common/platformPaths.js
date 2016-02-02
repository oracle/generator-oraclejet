/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

/*
 * Will contain information for platforms
 */

var path = require("path");
var constants = require("./constants");

var cordovaDirectory = constants.CORDOVA_DIRECTORY;

module.exports =
{
  "android" : 
  {
    ROOT: cordovaDirectory + "/platforms/android/assets/www/",

    getCopyPaths: function(begPath, endPath, appName) 
    {
      return [
        path.resolve(begPath + this.ROOT + endPath)
      ];
    }
  },

  "ios" : 
  {
    ROOT: cordovaDirectory + "/platforms/ios/www/",

    getCopyPaths: function(begPath, endPath, appName) 
    {
      return [
        path.resolve(begPath + this.ROOT + endPath)
      ];
    }
  },

  "windows": 
  {
    ROOT: cordovaDirectory + "/platforms/windows/www/",

    getCopyPaths: function(begPath, endPath, appName) 
    {
      return [
        path.resolve(begPath + this.ROOT + endPath)
      ];
    }
  }
};