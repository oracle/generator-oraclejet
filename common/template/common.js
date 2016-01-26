/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var fs = require('fs-extra');

module.exports = {
  
  handle: function _handle(baseTemplateHandler) 
  {
    
    return new Promise(function(resolve, reject)
    {
      
      baseTemplateHandler
        .then(function(generator)
        {
          var common = generator.templatePath("common");
          var commonDest = generator.destinationPath(generator.appDir + "/");

          fs.copySync(common, commonDest);
          resolve();
        })
        .catch(function(err)
        {
          reject(err);
        });
      
    });
  }

};