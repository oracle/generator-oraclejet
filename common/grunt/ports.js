/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

/*
 *Port-related grunt utilities 
 */
module.exports =
{
  configurePort: function(grunt, portName) 
  {
    var portOpt = grunt.option(portName + "Port");

    if (portOpt)
    { 
      var port = /[^\d]/.test(portOpt) ? NaN : parseInt(portOpt);
      if (!port || port < _MIN_PORT || port > _MAX_PORT)
      {
        _portError(grunt, portName, portOpt);
      }

      grunt.config.set("oraclejet.ports." + portName, port); 
    }
  }
};

function _portError(grunt, portName, portOpt)
{
  grunt.fail.fatal(
    "Invalid value '"+ portOpt + "' for " + portName + 
    ". Please specify a number between " + _MIN_PORT + " and " + _MAX_PORT);
}

var _MIN_PORT = 1024;
var _MAX_PORT = 65535;
