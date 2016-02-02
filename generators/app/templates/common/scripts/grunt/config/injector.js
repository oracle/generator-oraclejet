/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt injector task

var path = require("path");

module.exports = function(grunt)
{
  return {

    mainReleasePaths: 
    {
      options : 
      {
        starttag: "//injector:mainReleasePaths",
        endtag: "//endinjector",
        template: "js/main.js",
        destFile: "js/main-temp.js",
        transform: function(filePath) 
        {
          // need to inject the complete file content. 
          // since we do not want to touch js/main.js and requirejs plugin requires a file 
          // off of the baseUrl create a main-temp.js file which will be cleaned up after 
          // the requirejs task
          var mainReleasePaths = path.resolve("js/main-release-paths.json");
          
          return grunt.file.read(mainReleasePaths);
        }
      },

      files: 
      {
        "js/main.js": ["js/main.js"]
      }
    }
  };
};
