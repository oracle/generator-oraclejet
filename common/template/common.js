/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require("path");
var graphics = require("../../hybrid/graphics");

module.exports =
{
  handle: function _handle(baseTemplateHandler) 
  {
    return new Promise(function(resolve, reject)
    {
      baseTemplateHandler
        .then(function(generator)
        {
          var common = generator.templatePath("common");
          var commonDest = generator.destinationPath(generator.appDir + "/");

          fs.copySync(common, commonDest, {filter: function(file) {
				return (file.indexOf(graphics.PATH + path.sep + "screen") === -1) && 
                                       (file.indexOf(graphics.PATH + path.sep + "icon") === -1);
                             }});
          // copySync filter doesn't handle directories
          fs.removeSync(commonDest + graphics.PATH);
          
          resolve(generator);
        })
        .catch(function(err)
        {
          reject(err);
        });
    });
  }
};
