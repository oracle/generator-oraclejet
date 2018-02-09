/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
module.exports = function (grunt) {
  grunt.initConfig({
  });
  

  // Load grunt tasks from NPM packages
  require("load-grunt-tasks")(grunt);
  
  // Merge sub configs
  var options = {
    config : {
      src : "build/generator.js"
    },
    pkg: grunt.file.readJSON("package.json")
  }
  var configs = require('load-grunt-configs')(grunt, options);
  grunt.config.merge(configs);

};

