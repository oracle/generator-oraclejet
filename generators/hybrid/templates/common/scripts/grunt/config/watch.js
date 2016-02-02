/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt watch task

var fileChangeHandler = require("../fileChangeHandler");
var constants = require("../../common/constants");

var cordovaDirectory = constants.CORDOVA_DIRECTORY;
var appSrcDirectory = constants.APP_SRC_DIRECTORY;

module.exports = function(grunt)
{
  // to handle the changed files (i.e. copy over to platforms directory and etc)
  grunt.event.on("watch", function(action, filePath, target) 
  {
    fileChangeHandler.handleFileChange(action, filePath, target);
  });

  // will be in the option if spawned inside a script (i.e. serve)
  var livereloadPort = grunt.option("oraclejet.ports.livereload");
  if (livereloadPort)
  {
    grunt.config.set("oraclejet.ports.livereload", livereloadPort);
  }  
  
  // to watch for changes in file and to perform livereload
  return {
    livereload: 
    {
      files: 
      [
        appSrcDirectory + "/css/!(libs)/**/*.css",
        appSrcDirectory + "/js/!(libs)/**/*.js",
        appSrcDirectory + "/js/{,*/}*.js",
        appSrcDirectory + "/css/{,*/}*.css",
        appSrcDirectory + "/**/*.html"
      ],

      options: 
      {
        livereload: "<%= oraclejet.ports.livereload %>"
      }
    },

    platformFiles:
    {
      files: 
      [
        cordovaDirectory + "/merges/**"
      ]
    }
  };
};
