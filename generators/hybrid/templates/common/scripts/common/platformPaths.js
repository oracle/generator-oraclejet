/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

/*
 * Will contain information for platforms
 */

var path = require("path");

module.exports = {

  "android" : 
  {
    ROOT: "platforms/android/assets/www/",

    getCopyPaths: function(begPath, endPath, appName) 
    {
      return [
        path.resolve(begPath + "platforms/android/build/intermediates/assets/debug/www/" + endPath),
        path.resolve(begPath + this.ROOT + endPath)
      ];
    }
  },

  "ios" : 
  {
    ROOT: "platforms/ios/www/",

    getCopyPaths: function(begPath, endPath, appName) 
    {
      return [
        path.resolve(begPath + "platforms/ios/build/emulator/" + appName + ".app/www/" + endPath),
        path.resolve(begPath + this.ROOT + endPath)
      ];
    }
  },

  "windows": 
  {
    ROOT: "platforms/windows/www/",

    getCopyPaths: function(begPath, endPath, appName) 
    {
      return [
        path.resolve(begPath + this.ROOT + endPath)
      ];
    }
  }

};