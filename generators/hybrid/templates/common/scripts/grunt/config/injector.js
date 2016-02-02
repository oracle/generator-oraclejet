/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt injector task

var path = require("path");

var constants = require("../../common/constants");
var cordovaDirectory = constants.CORDOVA_DIRECTORY;
var appSrcDirectory = constants.APP_SRC_DIRECTORY;

module.exports = function(grunt)
{
  return {

    mainReleasePaths: 
    {
      options : 
      {
        starttag: "//injector:mainReleasePaths",
        endtag: "//endinjector",
        template: appSrcDirectory + "/js/main.js",
        destFile: cordovaDirectory + "/www/js/main-temp.js",
        transform: function(filePath) 
        {
          // need to inject the complete file content. 
          // since we do not want to touch js/main.js and requirejs plugin requires a file 
          // off of the baseUrl create a main-temp.js file which will be cleaned up after 
          // the requirejs task
          var mainReleasePaths = path.resolve(appSrcDirectory + "/js/main-release-paths.json");
          
          return grunt.file.read(mainReleasePaths);
        }
      },

      files: 
      {
        "src/js/main.js": [appSrcDirectory + "/js/main.js"]
      }
    }
  };
};
