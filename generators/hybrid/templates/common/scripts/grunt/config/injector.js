/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt injector task
var path = require("path");

module.exports = function(grunt) {

  return {

    mainReleasePaths: 
    {
      options : 
      {
        starttag: '//injector:mainReleasePaths',
        endtag: '//endinjector',
        template: "www/js/main.js",
        destFile: "www/js/main-temp.js",
        transform: function(filePath) 
        {
          //need to inject the complete file content. 
          //since we do not want to touch js/main.js and requirejs plugin requires a file 
          //off of the baseUrl create a main-temp.js file which will be cleaned up after 
          //the requirejs task
          var mainReleasePaths = path.resolve("www/js/main-release-paths.json");
          
          return grunt.file.read(mainReleasePaths);
        }
      },

      files: 
      {
        "www/js/main.js": ['www/js/main.js']
      }
    }
    
  };

};