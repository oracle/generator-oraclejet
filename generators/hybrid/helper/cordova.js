/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

module.exports = {

  create: function _create(generator)
  {
    return new Promise(function (resolve, reject) 
    {
      var appDir = generator.appDir;
      var args = ["create", appDir];
      var appDirectory = generator.destinationPath(appDir);
      
      if(generator.options.domain && generator.options.title) 
      {
        args = args.concat([generator.options.domain, generator.options.title]);
      }
      else if(generator.options.title)
      {
        //will stop the generator since invalid option set
        return reject(new Error("Error: domain option must be provided if title is provided"));
      }
      else if(generator.options.domain)
      {
        //will stop the generator since invalid option set
        return reject(new Error("Error: title option must be provided if domain is provided"));
      }

      //invoke cordova create for the skeleton
      generator.spawnCommand("cordova", args)
        .on("exit", function(err) 
        {
          if (err) 
          {
            //stop the generator as cordova create failed
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