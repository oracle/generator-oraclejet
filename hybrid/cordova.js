/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";
var paths = require("../util/paths");
var fs = require("fs-extra");

module.exports =
{
  create: function _create(generator)
  {
    return new Promise(function(resolve, reject) 
    {
      var cordovaDir = paths.getConfiguredPaths(generator.destinationPath()).stagingHybrid;
      fs.ensureDirSync(cordovaDir);
      var args = ["create", cordovaDir];
      
      var appid = generator.options.appid;
      var appname = generator.options.appname;
      
      if (appid && appname) 
      {
        args = args.concat([appid, appname]);
      }
      else if (appname)
      {
        // will stop the generator since invalid option set
        reject(new Error("Error: appid option must be provided if appname is provided"));
      }
      else if (appid)
      {
        // will stop the generator since invalid option set
        reject(new Error("Error: appname option must be provided if appid is provided"));
      }

      // invoke cordova create for the skeleton
      generator.spawnCommand("cordova", args)
        .on("exit", function(err) 
        {
          if (err) 
          {
            // stop the generator as cordova create failed
            reject(err);
          }

          resolve(generator);
        }).
        on("error", function(err)
        {
          reject(err);
        });
    });
  }
};
