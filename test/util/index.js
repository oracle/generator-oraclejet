/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';
//common helpers for generator tests
var fs = require('fs-extra');
var path = require('path');
var	net = require('net');
module.exports = {

  isSuccess: function _isSuccess(std)
  { 
  	return (std.indexOf("without errors") > -1 ? true : false);
  },

  isWindows:function _isWindows(OS)
  {
    return /^Windows/.test(OS);
  },

  getJetVersion: function _getJetVersion(filePath, file)
  {
    return fs.readdirSync(path.join(filePath,file));
  },

  getPlatform: function _getPlatform(OS)
  {
    var isWindows = /^Windows/.test(OS);
    return isWindows ? 'android' : 'ios';
  },

  isCheckedOut: function(std)
  {
    return (std.indexOf("Checked out revision") > -1 ? true : false);
  },

  matchInArray: function(string, arrayOfStrings)
  {
    for (var i=0; i < arrayOfStrings.length; i++)
    {
      if (arrayOfStrings[i].match(new RegExp(string)))
      {
        return true;
      }
    }
    return false;
  }
};
