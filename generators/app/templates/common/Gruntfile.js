/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

var path = require('path');

module.exports = function(grunt) {

  require("load-grunt-config")(grunt, 
  {
    configPath: path.join(process.cwd(), "scripts/grunt/config")
  }); 

  grunt.loadNpmTasks("grunt-oraclejet");

  grunt.registerTask("build", (buildType) => {
    grunt.task.run([`oraclejet-build:${buildType}`]);
  });

  grunt.registerTask("serve", (buildType) => {
    grunt.task.run([`oraclejet-serve:${buildType}`]);
  }); 
};

