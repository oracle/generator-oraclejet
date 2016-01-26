/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var fs = require('fs-extra');
module.exports = {
  BLANK_TEMPLATE: "blank",

  handle: function _handle(generator, destination) 
  {
    var source = generator.templatePath(this.BLANK_TEMPLATE);

    return new Promise(function(resolve, reject)
    {
      
      try
      {
        fs.copySync(source, destination, {clobber:true});
        resolve(generator);
      }
      catch(err)
      {
        return reject(err);
      }
      
    });
  }

};