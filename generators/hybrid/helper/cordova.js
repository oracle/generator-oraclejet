/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var constants = require("../../../util/constants");

module.exports =
{
  create: function _create(generator)
  {
    process.chdir(generator.destinationPath(generator.appDir));

    return new Promise(function(resolve, reject) 
    {
      var cordovaDir = constants.CORDOVA_DIRECTORY;
      var args = ["create", cordovaDir];
      
      if (generator.options.appId && generator.options.appName) 
      {
        args = args.concat([generator.options.appId, generator.options.appName]);
      }
      else if (generator.options.appName)
      {
        // will stop the generator since invalid option set
        return reject(new Error("Error: appId option must be provided if appName is provided"));
      }
      else if (generator.options.appId)
      {
        // will stop the generator since invalid option set
        return reject(new Error("Error: appName option must be provided if appId is provided"));
      }

      // invoke cordova create for the skeleton
      generator.spawnCommand("cordova", args)
        .on("exit", function(err) 
        {
          if (err) 
          {
            // stop the generator as cordova create failed
            return reject(err);
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
