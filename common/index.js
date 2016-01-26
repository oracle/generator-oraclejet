/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';
//common helpers for generators
var fs = require('fs-extra');
var path = require('path');
module.exports = {

  gruntSpawnCommandPromise: function _gruntSpawnCommandPromise(context, cmd, args, logMessage)
  {
    var generator = context.generator;
    args = args || [];

    generator.log(logMessage);

    return new Promise(function (resolve, reject) 
    {

      generator.spawnCommand(cmd, args)
        .on("exit", function(err) 
        {
          if(err) 
          {
            return reject(err);
          }

          resolve(context);
        })
        .on("error", function(err)
        {
          reject(err);
        });

    });
  },

  writeCommonGruntScripts: function _writeCommonGruntScripts(generator)
  { 
    var gruntSource = generator.templatePath('../../../common/grunt');
    var gruntDest = generator.destinationPath(generator.appDir + '/scripts/grunt/common/');
    
    return new Promise(function (resolve,reject)
    {      
      fs.copy(gruntSource, gruntDest, function(err)
      {
        if(err)
        {
          reject(err);
        } 

        resolve(generator);
      });    
    });
  },

  validateAppDirNotExistsOrIsEmpty: function _validateAppDirNotExistsOrIsEmpty(appDir)
  { 
    return new Promise(function (resolve,reject)
    { 
      appDir = path.resolve(appDir);     
      fs.stat(appDir, function (err,stats)
      {
        if(err)
        {
          //Proceed to scaffold if appDir directory doesn't exist
          resolve(); 
        } 
        else
        {
          fs.readdir(appDir, function(err,items)
          {
            var isEmpty = (!items || !items.length);
            if(isEmpty)
            {
              //Proceed to scaffold if appDir directory is empty
              resolve();
            } 
            else
            {
              reject("Path already exists and is not empty: " + appDir );
            } 
          });
        }
      });
    });
  }
};