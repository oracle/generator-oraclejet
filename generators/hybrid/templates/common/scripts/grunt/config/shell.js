/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt shell task

module.exports = {

  cordovaPrepare:
  {
    command: 'cordova prepare <%= platform %>'
  },

  cordovaCompile:
  {
    command: 'cordova compile <%= platform %> <%= buildType %> <%= buildConfig %>'
  },

  cordovaBuild: 
  {
    command: 'cordova build <%= platform %> <%= buildType %> <%= buildConfig %>'
  },

  cordovaRun:
  {
    command: 'cordova run <%= platform %> <%= destination %> <%= buildType %> <%= buildConfig %>'
  }

};