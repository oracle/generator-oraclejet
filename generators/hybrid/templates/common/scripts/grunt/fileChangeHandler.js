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
var injector = require('../common/injector');

module.exports = {

  handleFileChange: function(action, filePath, target) 
  {
    if(action === "changed") 
    {
      if(target === "livereload") 
      {
        //simple copying file over
        _copyFileOver(filePath);

        _checkIndexHTML(filePath);
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
  var index = filePath.indexOf("www");
  var begPath = filePath.substring(0, index);
  var endPath = filePath.substring(index+4);
  var newBuildPath;
  var newPath;

  var parsed = JSON.parse(fs.readFileSync(path.resolve("platforms/platforms.json"), 'utf8'));
  var appName = util.getAppName();

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

function _checkIndexHTML(filePath)
{
  //if index.html need an additional step of performing inject
  var splitted = filePath.split(path.sep);
  var length = splitted.length;

  if(length > 1 && splitted[length-1] === "index.html" && splitted[length-2] === "www")
  {
    injector.injectCordovaFeatures();
  }
}

function _copyMergesFileChange(action, filePath, target)
{
  var splitted = filePath.split(path.sep);
  var paths = platformPaths[splitted[1]].getCopyPaths("", splitted.slice(2).join("/"), util.getAppName());

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