/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt uglify task

var constants = require("../../common/constants");
var cordovaDirectory = constants.CORDOVA_DIRECTORY;
var appSrcDirectory = constants.APP_SRC_DIRECTORY;

module.exports =
{
  // to minify app js files
  release: 
  {
    files: 
    [
      {
        expand: true,
        cwd: appSrcDirectory + "/js",
        src:["**/*.js", "!libs/**", "!main.js"],
        dest: cordovaDirectory + "/www/js"
      }
    ]    
  }
};
