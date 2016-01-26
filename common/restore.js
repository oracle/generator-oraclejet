/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var fs = require('fs-extra');
var path = require('path');

var constants = require("../util/constants");
var fetchZip = require ("../util/fetchZip");
var util = require("../util");
var common = require("./index");

var ORACLE_JET_CONFIG_FILE = "oraclejetconfig.json";
var TEMP_ORACLE_ZIP_URL = "http://den00pwq.us.oracle.com:8080/hudson/job/OJET_Code_V2.0.X/lastSuccessfulBuild/artifact/code/oraclejet.zip";

module.exports = {

  writeOracleJetConfigFile: function _writeOracleJetConfigFile(context)
  {
    var generator = context.generator;
    var destinationRoot = generator.destinationRoot();
    
    generator.log("Writing ", ORACLE_JET_CONFIG_FILE);

    var versionDirectory = _getOracleJetVersion(generator);

    //need to place the oracletjetconfig.json at origDestRoot

    fs.stat(path.resolve(generator.destinationRoot(),ORACLE_JET_CONFIG_FILE), function (err,stats)
    {
      if(err)
      {
        generator.log("No config file...writing the default config");  
        fs.writeJSONSync(path.resolve(destinationRoot, ORACLE_JET_CONFIG_FILE), {"version": versionDirectory, "oraclejet_zip_url":TEMP_ORACLE_ZIP_URL});       
      }
      else
      {
        generator.log("Config file exists...checking version..");
      }

    });

    context.versionDirectory = versionDirectory;
    return context;
  },

  invokeBowerCopyScript: function _invokeBowerCopyScript(context)
  {
    return common.gruntSpawnCommandPromise(context, "grunt", ["bowercopy"], "Invoking grunt bowercopy.");
  },

  npmBowerInstall: function _npmBowerInstall(context)
  {
    var generator = context.generator;
    var self = this;
    
    return new Promise(function (resolve, reject) 
    {

      Promise.all([
        _tempOracleJetFetchZip(context),
        common.gruntSpawnCommandPromise(context, "npm", ["install"], "Invoking npm install"),
        common.gruntSpawnCommandPromise(context, "bower", ["install"], "Invoking bower install")
      ])
        .then(function(values)
        {
          //rejection will be handled by each promise which will 
          //halt the generator
          resolve(context);
        })
        .catch(function(err)
        {
          reject(err);
        });

    });
  },

  removeTempZipLib: function _removeDuplicateLibInZip (context)
 {  
    var generator = context.generator;
     //remove buildnum and revnum
     fs.remove(path.resolve('bower_components/oraclejet/revnum'), function(err){
      if (err) return generator.log(err)
     });
     fs.remove(path.resolve('bower_components/oraclejet/buildnum'), function(err){
      if (err) return generator.log(err)
     });
     //Cleaning dupliate lib file from oraclejetzip
     var lib_dir = 'bower_components/oraclejet/js/libs';
     fs.readdir(lib_dir, function (error, files)
     {   if (error) generator.log(error);
          files.filter(function (fileName)
          {
            return (/hammer|require|js-signals|es6-promise/).test(fileName);
          }).forEach(function(dir)
          {
           fs.remove(path.resolve(lib_dir, dir), function (err) {
            if (err) return generator.log(err)
          })

          });
      }); 
      return context;
    }

};

function _tempOracleJetFetchZip(context) 
{
  var generator = context.generator;

  generator.log("Fetching oraclejet zip");

  return new Promise(function(resolve, reject)
  { 
    var zip_url = TEMP_ORACLE_ZIP_URL;
    var config_file_exist = false;

    fs.stat(path.resolve(generator.destinationRoot(),ORACLE_JET_CONFIG_FILE), function (err,stats)
    {
      if(err)
      {
        generator.log("No config file...using default oraclejet url");         
      }
      else
      {
        generator.log("Config file exists...reading from oraclejetconfig.json");
        config_file_exist = true;
        zip_url = fs.readJSONSync(path.resolve(generator.destinationRoot(), ORACLE_JET_CONFIG_FILE)).oraclejet_zip_url;
      }

      fs.remove('bower_components/oraclejet', function (err) 
      {
        if(err) 
        {
          return reject(err);
        }

        fetchZip( zip_url )
          .then(function (values) 
          {
            var temp_path = path.resolve(generator.destinationRoot(), "bower_components/oraclejet");          
            fs.ensureDirSync(temp_path);          
            values.extractAllTo(temp_path); 
            
            if ( config_file_exist ) _checkOracleJetVersion(generator);
            return resolve();
          })
          .catch(function(err) 
          {
            return reject(err);
          });

      });     

    });

  });

}

/*
 * Gets the jet version by inspecting the directory and returning the directory name
 * Note that the directory must exist; otherwise an error will be triggered.
 */
function _getOracleJetVersion(generator)
{
  var oracleJetCssLibs = generator.destinationPath("bower_components/oraclejet/css/libs/oj/");
  return util.getDirectories(oracleJetCssLibs).sort()[0];
}
/*
 * Compare the jet version in oraclejetconfig.json and the actual version, update 
 * oraclejetconfig.json accordingly
 */
function _checkOracleJetVersion(generator)
{
  var versionDirectory = _getOracleJetVersion(generator);
  var configJSON = fs.readJSONSync(path.resolve(generator.destinationRoot(),ORACLE_JET_CONFIG_FILE));

  if (configJSON.version !== versionDirectory) 
  {
    configJSON.version = versionDirectory;
    fs.writeJSONSync(path.resolve(generator.destinationRoot(), ORACLE_JET_CONFIG_FILE), configJSON);       
  }
}
