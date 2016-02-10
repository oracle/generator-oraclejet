/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var fs = require("fs-extra");
var path = require("path");
var commonMessages = require("./messages");
module.exports =
{
  gruntSpawnCommandPromise: function _gruntSpawnCommandPromise(context, cmd, args,logMessage)
  {
    var generator = context.generator;
    args = args || [];

    generator.log(logMessage);

    return new Promise(function(resolve, reject) 
    {
      // close event is fired after all stdio, which can catch errors from any
      // additional childProcesses inovked 
      generator.spawnCommand(cmd, args)
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

  validateAppDirNotExistsOrIsEmpty: function _validateAppDirNotExistsOrIsEmpty(generator)
  { 
    return new Promise(function(resolve,reject)
    { 
      appDir = path.resolve(appDir);     
      fs.stat(appDir, function(err,stats)
      {
        if (err)
        {
          // Proceed to scaffold if appDir directory doesn't exist
          resolve(); 
        } 
        else
        {
          fs.readdir(appDir, function(err,items)
          {
            var isEmpty = (!items || !items.length);
            if (isEmpty)
            {
              // Proceed to scaffold if appDir directory is empty
              resolve();
            } 
            else
            {
              items.forEach(function(filename)
              {
                if (_fileNotHidden(filename)) 
                  {
                    var error = "path already exists and is not empty: " + path.resolve(appDir);
                    reject(commonMessages.error(error,"validateAppDir"));
                  }
              }); 
              resolve(appDir);
            }           
          });
        }
      });
    });
  }
};

function _fileNotHidden(filename)
{
  return !/^\..*/.test(filename);
}

function _handleAbsolutePath(generator)
{
  var appDir = generator.appDir;
  if (path.isAbsolute(appDir))
  { 
    var parentDir = path.resolve(appDir, ".."); 
    fs.ensureDirSync(parentDir);
    generator.destinationRoot(parentDir);
    appDir = path.basename(appDir);  
  }

  return appDir;
}
