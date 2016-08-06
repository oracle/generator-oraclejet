/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require('path');

module.exports =
{
  BLANK_TEMPLATE: "blank",

  handle: function _handle(generator, destination, templateType) 
  {
    var source;
    var templatePath;
    
    if (templateType === 'web')
    {
      templatePath = '../../app/templates/';
    }
    else
    {
      templatePath = '../../hybrid/templates/';
    }
    
    templatePath += this.BLANK_TEMPLATE;
    source = path.resolve(generator.sourceRoot(), templatePath);

    return new Promise(function(resolve, reject)
    {
      try
      {
        fs.copySync(source, destination, {clobber: true});
        resolve(generator);
      }
      catch (err)
      {
        return reject(err);
      }
    });
  }
};
