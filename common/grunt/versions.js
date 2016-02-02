/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

/*
 * Version-related grunt utilities 
 */
module.exports =
{
  getVersions: function(grunt) 
  {
    var versions =
    {
      jetVersion : _getVersionFromBower(grunt, "oraclejet"),
      jqueryVersion : _getVersionFromBower(grunt, "jquery"),
      jqueryUIVersion : _getVersionFromBower(grunt, "jquery-ui"),
      es6PromiseVersion : _getVersionFromBower(grunt, "es6-promise"),
      hammerVersion : _getVersionFromBower(grunt, "hammerjs"),
      knockoutVersion : _getVersionFromBower(grunt, "knockout")
    }; 

    return versions;
  }
};

function _getVersionFromBower(grunt, path)
{
  var bowerJSON = grunt.file.readJSON("bower_components/" + path + "/bower.json");
  if (bowerJSON.hasOwnProperty("version"))
  {
    return bowerJSON.version;
  }

  // In case some packages do not have a version string, use .bower.json which  is created by bower
  bowerJSON = grunt.file.readJSON("bower_components/" + path + "/.bower.json");
  return bowerJSON.version;
}
