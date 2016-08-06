/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var path = require("path");
var fs = require("fs-extra");

module.exports =
{
  getDirectories: function(source)
  {
    // util function to get directories listing
    return fs.readdirSync(source).filter(function(file)
      {
        return fs.statSync(path.join(source, file)).isDirectory();
      });
  }
};
