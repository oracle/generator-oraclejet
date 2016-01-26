/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt bowercopy task

//To align with Jet demo's 3rd party library directory structure, this config will copy from its 
//original location in github to specific path with the file name being modified to include the 
//version of the 3rd party.

module.exports = {

  options: 
  {
    runBower: false
  },

  oraclejetCss:
  {
    options:
    {
      srcPrefix: 'bower_components/oraclejet/css/libs/',
      destPrefix: 'css/libs'
    },

    src: 'oj/<%= oraclejetconfig.version %>/!(alta-android|alta-ios|alta-windows)/**'
  },

  oraclejetJs:
  {
    options:
    {
      srcPrefix: 'bower_components',
      destPrefix: 'js'
    },

    files:
    {
      'libs': 'oraclejet/js/libs/'
    }
  },

  //place in the same directory as jet's demo app
  thirdParty:
  {
    options:
    {
      destPrefix: 'js/libs'
    },

    files:
    {
      'es6-promise/promise-<%= grunt.file.readJSON("bower_components/es6-promise/bower.json").version %>.js': 'es6-promise/promise.js',
      'es6-promise/promise-<%= grunt.file.readJSON("bower_components/es6-promise/bower.json").version %>.min.js': 'es6-promise/promise.min.js',
      'hammer/hammer-<%= grunt.file.readJSON("bower_components/hammerjs/bower.json").version %>.js': 'hammerjs/hammer.js',
      'hammer/hammer-<%= grunt.file.readJSON("bower_components/hammerjs/bower.json").version %>.min.js': 'hammerjs/hammer.min.js',
      'jquery/jquery-<%= grunt.file.readJSON("bower_components/jquery/bower.json").version %>.js': 'jquery/dist/jquery.js',
      'jquery/jquery-<%= grunt.file.readJSON("bower_components/jquery/bower.json").version %>.min.js': 'jquery/dist/jquery.min.js',
      'js-signals': 'js-signals/dist',
      'knockout/knockout-<%= grunt.file.readJSON("bower_components/knockout/bower.json").version %>.debug.js': 'knockout/dist/knockout.debug.js',
      'knockout/knockout-<%= grunt.file.readJSON("bower_components/knockout/bower.json").version %>.js': 'knockout/dist/knockout.js',
      'require/require.js': 'requirejs/require.js',
      'require': 'text'
    }
  }
  
};