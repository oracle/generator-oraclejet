/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt watch task

var fileChangeHandler = require('../fileChangeHandler');

module.exports = function(grunt) {

  //to handle the changed files (i.e. copy over to platforms directory and etc)
  grunt.event.on('watch', function(action, filePath, target) 
  {
    fileChangeHandler.handleFileChange(action, filePath, target);
  });

  //will be in the option if spawned inside a script (i.e. serve)
  var livereloadPort = grunt.option("oraclejet.ports.livereload");
  if(livereloadPort)
  {
    grunt.config.set("oraclejet.ports.livereload", livereloadPort);
  }  
  
  //to watch for changes in file and to perform livereload
  return {
  
    livereload: 
    {
      files: 
      [
      'www/css/!(libs)/**/*.css',
      'www/js/!(libs)/**/*.js',
      'www/js/{,*/}*.js',
      'www/css/{,*/}*.css',
      'www/**/*.html'
      ],

      options: 
      {
        livereload: '<%= oraclejet.ports.livereload %>'
      }
    },

    platformFiles:
    {
      files: 
      [
        'merges/**'
      ]
    }
  };

};