/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var admzip = require('adm-zip');
module.exports = {

  handle: function _handle(yoGenerator, templatePath, destination) 
  {
    return new Promise(function(resolve, reject) 
    {    
      _copyLocalTemplate(yoGenerator, templatePath, destination)
        .then(function()
        {
          resolve(yoGenerator);
        })
        .catch(function(err) 
        {
          reject(err);
        });

    });
  }
};

function _copyLocalTemplate(yoGenerator, templatePath, destination)
{
  return new Promise((resolve, reject) => {
    try {
      if (fs.statSync(templatePath).isDirectory()) {
        fs.copySync(templatePath, destination);
      } else if (path.extname(templatePath) === '.zip') {
        const zip = new admzip(templatePath);
        zip.extractAllTo(destination, true);
      } else {
        throw`template path ${templatePath} is not valid`;
      };
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
