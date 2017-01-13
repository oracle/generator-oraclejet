/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require("path");
var commonMessages = require("./messages");
var CONSTANTS = require("../util/constants");

module.exports =
{
  gruntSpawnCommandPromise: function _gruntSpawnCommandPromise(context, cmd, args,logMessage, options)
  {
    var generator = context.generator;
    args = args || [];

    generator.log(logMessage);

    return new Promise(function(resolve, reject) 
    {
      // close event is fired after all stdio, which can catch errors from any
      // additional childProcesses inovked 
      generator.spawnCommand(cmd, args, options)
        .on("close", function(err) 
        {
          if (err) 
          {
            reject(commonMessages.error(err, logMessage));
          }
          else
          {
            resolve(context);
          }          
        })
        .on("error", function(err)
        {
          reject(commonMessages.error(err, logMessage));
        });
    });
  },

  writeCommonGruntScripts: function _writeCommonGruntScripts(generator)
  { 
    var gruntSource = generator.templatePath("../../../common/grunt");
    var gruntDest = generator.destinationPath(generator.appDir + "/scripts/grunt/common/");
    
    return new Promise(function(resolve, reject)
    {      
      fs.copy(gruntSource, gruntDest, function(err)
      {
        if (err)
        {
          reject(commonMessages.error(err, "writeCommonGruntScripts"));
        }
        else
        {
          resolve(generator);
        }
      });    
    });
  },

  writeGitIgnore: function _writeGitIgnore(generator)
  { 
    var gitSource = generator.destinationPath("_gitignore");
    var gitDest = generator.destinationPath(".gitignore");

    return new Promise(function(resolve, reject)
    {      
      fs.move(gitSource, gitDest, function(err)
      {
        if (err)
        {
          reject(commonMessages.error(err, "writeGitIgnore"));
        }
        else
        {
          resolve(generator);
        }
      });    
    });
  },

  validateAppDirNotExistsOrIsEmpty: function _validateAppDirNotExistsOrIsEmpty(generator)
  { 
    return new Promise(function(resolve, reject)
    {  
      var appDir = _handleAbsoluteOrMissingPath(generator);        
      fs.stat(appDir, function(err, stats)
      {
        if (err)
        {
          // Proceed to scaffold if appDir directory doesn't exist
          resolve(appDir); 
        } 
        else
        {
          fs.readdir(appDir, function(err,items)
          {
            var isEmpty = (!items || !items.length);
            if (isEmpty)
            {
              // Proceed to scaffold if appDir directory is empty
              resolve(appDir);
            }
            else
            {
              items.forEach(function(filename)
              {
                if (_fileNotHidden(filename)) 
                  {
                    var error = "path already exists and is not empty: " + path.resolve(appDir);
                    reject(commonMessages.error(error, "validateAppDir"));
                  }
              }); 
              resolve(appDir);
            }           
          });
        }
      });
    });
  },
  
  switchToAppDirectory: function _switchToAppDirectory(generator) {
    generator.destinationRoot(generator.destinationPath(path.basename(path.resolve(generator.appDir))));
    return Promise.resolve(generator);
  },

  validateArgs: function _validateArgs(generator) {
    return new Promise ((resolve, reject) => {
      const args = generator.arguments;
      const validLength = _getValidArgLength(generator.options.namespace);

      if (args.length > validLength) {
        reject(commonMessages.error("Invalid additional arguments: " + args.splice(validLength), "validateArgs"));
      } else {
        resolve(generator);
      }
    });
  },

  validateFlags: function _validateFlags(generator) {
    return new Promise ((resolve, reject) => {
      const flags = generator.options;
      const SUPPORTED_FLAGS = CONSTANTS.SUPPORTED_FLAGS(flags.namespace);
      for (let key in flags) {
        if (flags.hasOwnProperty(key)) {
          if (SUPPORTED_FLAGS.indexOf(key) === -1) {
            reject(commonMessages.error("Invalid flag: " + key, "validateFlags"));
          }
        }
      }
      resolve(generator);    
    });
  },

  fsExistsSync: function(path)
  {
    try
    {
      fs.statSync(path);
      return true;
    }
    catch (err)
    {
      // file/directory does not exist
      return false;
    }
  }
};

function _getValidArgLength(namespace) {  
  //add-hybrid, restore, restore-web, restore-hybrid, add-sass, allow no argument
  //add-theme, app, hybrid, optional to take 1 argument
  return (/add-hybrid/.test(namespace) || /restore/.test(namespace) || /add-sass/.test(namespace) )
  ? 0 : 1;
}

function _fileNotHidden(filename)
{
  return !/^\..*/.test(filename);
}

function _handleAbsoluteOrMissingPath(generator)
{
  var appDir = generator.appDir;
  var appDirObj = path.parse(appDir);
  // appDir is absolute or missing
  if (path.isAbsolute(appDir) || appDirObj.dir)
  { 
    var parentDir = path.resolve(appDir, ".."); 
    fs.ensureDirSync(parentDir);
    generator.destinationRoot(parentDir);
    appDir = appDirObj.base;  
  } 
  else if (appDirObj.name === '.') 
  {
    var absolutePath = path.resolve(appDir);
    generator.destinationRoot(path.resolve(absolutePath, '..'));
    appDir = path.basename(absolutePath);
  }
  return appDir;
}
