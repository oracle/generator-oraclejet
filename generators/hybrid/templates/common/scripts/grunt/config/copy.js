/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt copy task

var constants = require("../../common/constants");
var cordovaDirectory = constants.CORDOVA_DIRECTORY;
var appSrcDirectory = constants.APP_SRC_DIRECTORY;

module.exports = {
  
  //need to copy resources directory as nls content are loaded per need
  wwwRelease: 
  {
    files:
    [
      {
        cwd: appSrcDirectory,
        src: [
          '**',
          '!js/**/*.js',
          'js/libs/**',
          '!js/libs/**/*debug*',
          '!js/libs/**/*debug*/**',
          '!cordova.js',
        ],
        dest: cordovaDirectory + '/www',
        expand: true
      }
    ]
  },

  wwwDev:
  {
    files:
    [
      {
        cwd: appSrcDirectory,
        src: "**/**",
        dest: cordovaDirectory + '/www',
        expand: true
      }
    ]
  },

  merges:
  {
    cwd: cordovaDirectory + "/merges/<%= platform %>",
    src: [
      '**'
    ],
    dest: cordovaDirectory + '/www',
    expand: true
  }
};