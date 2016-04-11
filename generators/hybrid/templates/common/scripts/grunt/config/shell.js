/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt shell task

var constants = require("../../common/constants");

var cordovaDirectory = constants.CORDOVA_DIRECTORY;

module.exports =
{
  cordovaPrepare:
  {
    command: "cordova prepare <%= platform %>",
    options:
    {
      execOptions: 
      {
        cwd: cordovaDirectory
      }
    }
  },

  cordovaCompile:
  {
    command: "cordova compile <%= platform %> <%= buildType %> <%= buildConfig %>",
    options:
    {
      execOptions: 
      {
        cwd: cordovaDirectory
      }
    }
  },
  
  cordovaRun:
  {
    command: "cordova run <%= platform %> <%= destination %> <%= buildType %> <%= buildConfig %>",
    options:
    {
      execOptions: 
      {
        cwd: cordovaDirectory
      }
    }
  },

  cordovaClean:
  {
    command: "cordova clean <%= platform %>",
    options:
    {
      execOptions: 
      {
        cwd: cordovaDirectory
      }
    }
  }
};
