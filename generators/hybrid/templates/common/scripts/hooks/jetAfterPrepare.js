#!/usr/bin/env node
/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

// After prepare hook implementation

var injector = require("./injector");

module.exports = function(context)
{
  var platforms = context.opts.platforms;
  
  if (platforms)
  {
    platforms.forEach(function(value)
      {
        injector.updateIndexHtml(value);
        injector.updateConfigXml(value);
      }
    );
  }    
};
