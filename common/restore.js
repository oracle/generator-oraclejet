/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require("path");

var constants = require("../util/constants");
var fetchZip = require ("../util/fetchZip");
var util = require("../util");
var common = require("./index");
var commonMessages = require("./messages");
var ORACLE_JET_CONFIG_FILE = "oraclejetconfig.json";

module.exports =
{
  writeOracleJetConfigFile: function _writeOracleJetConfigFile(context)
  {
    var generator = context.generator;

    var destinationRoot = generator.destinationRoot();
    var configPath = path.resolve(destinationRoot, ORACLE_JET_CONFIG_FILE);
    
    return new Promise(function(resolve, reject)
    {
      generator.log("Writing ", ORACLE_JET_CONFIG_FILE);

    // need to place the oracletjetconfig.json at origDestRoot

      fs.stat(configPath, function(err,stats)
      {
        var generatorVersion = _getOracleJetGeneratorVersion(generator);
        if (err)
        {
          generator.log(commonMessages.appendJETPrefix() + "No config file...writing the default config...");
          fs.writeJSONSync(configPath, {"generatorVersion": generatorVersion});       
        }
        else
        {
          var configJson = fs.readJSONSync(configPath);
          configJson.generatorVersion = generatorVersion;
          fs.writeJSONSync(configPath, configJson);     
          generator.log(commonMessages.appendJETPrefix() + ORACLE_JET_CONFIG_FILE +" file exists...checking config...");
        }
      });

      resolve(context);
    });
   
  },

  invokeBowerCopyScript: function _invokeBowerCopyScript(context)
  {
    return common.gruntSpawnCommandPromise(context, "grunt", ["bowercopy"], "Invoking grunt bowercopy.", {stdio:'ignore'});
  },

  npmBowerInstall: function _npmBowerInstall(context)
  {
    var generator = context.generator;
    var self = this;
    
    return new Promise(function(resolve, reject) 
    {
      Promise.all([
        common.gruntSpawnCommandPromise(context, "npm", ["install"], "Invoking npm install"),
        common.gruntSpawnCommandPromise(context, "bower", ["install"], "Invoking bower install")
      ])
        .then(function(values)
        {
          // rejection will be handled by each promise which will 
          // halt the generator
          resolve(context);
        })
        .catch(function(err)
        {
          reject(err);
        });
    });
  }
};

/*
 * Gets the generator version 
 */
function _getOracleJetGeneratorVersion(generator)
{
  // We intend to read the top level package.json for the generator-oraclejet module.
  // Note this path to package.json depends on the location of this file within the module (common/restore.js)
  var generatorJSON = require('../package.json');
  return generatorJSON.version;
}