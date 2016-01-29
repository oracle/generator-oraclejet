/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

/*
 * Will contain functions to be invoked in the Gruntfile.js
 */

var fs = require('fs-extra');
var path = require("path");

var platformPaths = require("../common/platformPaths");
var util = require('../common/util');
var constants = require('../common/constants');
var injector = require('../common/injector');

var CORDOVA_WWW_DIRECTORY = "hybrid/www";

module.exports = {

  handleFileChange: function(action, filePath, target) 
  {
    if(action === "changed") 
    {
      if(target === "livereload") 
      {
        //from src directory to www + platform directories
        _copyFileOver(filePath);

        _indexHTMLPlatformInjection(filePath);
      }
      else if(target === "platformFiles") 
      {
        //need to copy from merge to appropriate file paths and since not a direct mapping need to manipulate the path a bit
        _copyMergesFileChange(action, filePath, target);
      }
    }
  }

};

function _copyFileOver(filePath)
{

  //copies file over for the watch events
  var index = filePath.indexOf(constants.APP_SRC_DIRECTORY);
  var begPath = filePath.substring(0, index);
  var endPath = filePath.substring(index+3);

  _copyFileToWWW(filePath, begPath, endPath);
  _copyFileToPlatforms(filePath, begPath, endPath);
}

function _copyFileToWWW(filePath, begPath, endPath) 
{
  fs.copySync(filePath, begPath + CORDOVA_WWW_DIRECTORY + endPath);
}

function _copyFileToPlatforms(filePath, begPath, endPath)
{
  var newBuildPath;
  var newPath;

  var parsed = JSON.parse(fs.readFileSync(path.resolve(constants.CORDOVA_DIRECTORY + "/platforms/platforms.json"), 'utf8'));
  var configXML = path.resolve(constants.CORDOVA_DIRECTORY + "/config.xml");
  var appName = util.getAppName(configXML);

  Object.keys(parsed).forEach(function(platform) 
  {
    var paths = platformPaths[platform].getCopyPaths(begPath, endPath, appName);

    paths.forEach(function(currPath) 
    {
      var exists = fs.existsSync(currPath);

      if(exists) 
      {
        fs.copySync(filePath, currPath);
      }
    });
  });
}

function _indexHTMLPlatformInjection(filePath)
{
  //if index.html need an additional step of performing inject
  var splitted = filePath.split(path.sep);
  var length = splitted.length;

  if(length > 1 && splitted[length-1] === "index.html" && splitted[length-2] === constants.APP_SRC_DIRECTORY)
  {
    injector.injectCordovaFeatures(true);
  }
}

function _copyMergesFileChange(action, filePath, target)
{
  var splitted = filePath.split(path.sep);
  var configXML = path.resolve(constants.CORDOVA_DIRECTORY + "/config.xml");
  var paths = platformPaths[splitted[1]].getCopyPaths("", splitted.slice(2).join("/"), util.getAppName(configXML));

  paths.forEach(function(currPath) 
  {
    fs.exists(currPath, function(exists) 
    {
      if(exists) 
      {
        fs.copy(filePath, currPath, function(err) 
        {
          if(err) 
          {
            return console.error(err);
          }
        });
      }
    });
  });

}