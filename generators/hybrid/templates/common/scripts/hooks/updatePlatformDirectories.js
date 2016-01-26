/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//code to perform removal of platform files when ran in target of dev or release


var fs = require('fs-extra');
var path = require("path");

var constants = require("../common/constants");
var platformPaths = require("../common/platformPaths");

module.exports = {

  update: function(platform, target) 
  {

    var root = platformPaths[platform].ROOT;
    var releasePath = path.resolve(root + "/release");
    
    if(target === "dev") 
    {
      //need to remove the release directory
      if(fs.existsSync(releasePath)) 
      {
        fs.removeSync(releasePath);  
      }
    }
    else
    {
      _updateReleaseDirectory(releasePath, root)
    }

  }

}

function _updateReleaseDirectory(releasePath, root)
{
  //need to remove other directories and swap w/ release content
  var directories = _getWWWDirectories();

  directories.forEach(function(directory) 
  {
    _processWWWDirectories(directory, root);
  });

  _processReleaseDirectory(releasePath, root);
}

function _getWWWDirectories()
{
  var source = path.resolve("www");

  return fs.readdirSync(source).filter(function(file) {
    return fs.statSync(path.join(source, file)).isDirectory();
  });
}

function _processWWWDirectories(directory, root)
{
  if(directory === "release") return;
  //other than release if the directory exists remove it
  //since copied over other than js which should be minified

  var toRemove = path.resolve(root, directory);
  
  if(fs.existsSync(toRemove)) 
  {
    fs.emptyDirSync(toRemove);
    fs.removeSync(toRemove);
  }
}

function _processReleaseDirectory(releasePath, root)
{
  fs.copySync(releasePath, path.resolve(root));
  fs.emptyDirSync(releasePath);
  fs.removeSync(releasePath);
}