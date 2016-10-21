/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var fs = require("fs-extra");
var path = require("path");
var common = require("../../common");
var constants = require("../../util/constants");
var commonMessages = require("../../common/messages");
var commonHybrid = require("../../hybrid");
var cordovaHelper = require("../../hybrid/cordova");
var platformsHelper = require("../../hybrid/platforms");

/*
 * Generator for the add-hybrid step
 */
var OracleJetAddHybridGenerator = generators.Base.extend(
{
  constructor: function () 
  {
    generators.Base.apply(this, arguments);

    this.option('platforms', {
      desc: 'Specify the platforms to be supported by the scaffolded hybrid app [android, ios, windows]',
    });
    this.option('platform', {
      desc: 'Alias for --platforms if the user wishes to specify a single hybrid platform [android, ios, windows]'
    });
    this.option('appid', {
      desc: 'Specify the app ID for scaffolded hybrid app'
    });
    // Deprecated version
    this.option("appId",{desc:"Deprecated. Use --appid instead."});
    this.option('appname', {
      desc: 'Specify the app name for scaffolded hybrid app'
    });
    // Deprecated version
    this.option("appName", {desc:"Deprecated. Use --appname instead."});
  },

  initializing: function() 
  { 
    var done = this.async();
     common.validateArgs(this)
      .then(common.validateFlags)
      .then(_validateAppDirForAddHybrid)
      .then(function()
      {
        this.appDir = path.basename(this.destinationRoot());
        commonHybrid.setupHybridEnv(this);
        done();
      }.bind(this))
      .catch(function(err)
      {
        this.env.error(commonMessages.prefixError(err));
      }.bind(this));

  },

  prompting: function()
  {
    var done = this.async();
    
    platformsHelper.getPlatforms(this)
      .then(function()
      {
        done();
      });
  },  
  
  writing: function() 
  {
    var done = this.async();
    
    _createExtraSrcDirs(this)
      .then(cordovaHelper.create.bind(this))
      .then(commonHybrid.copyHooks.bind(this))
      .then(commonHybrid.copyResources.bind(this))
      .then(_copyCordovaMocks.bind(this))
      .then(commonHybrid.removeExtraCordovaFiles.bind(this))
      .then(platformsHelper.addPlatforms.bind(this))                 
      .then(commonHybrid.updateConfigXml.bind(this)) 
      .then(function()
      {
        done();
      })
      .catch(function(err)
      {
        if (err)
        {
          this.env.error(commonMessages.prefixError(err));
        }
      }.bind(this));
  }

});

module.exports = OracleJetAddHybridGenerator;


function _validateAppDirForAddHybrid(generator)
{
  return _validateSrcDirExists(generator)
    .then(_validateHybridDirDoesNotExist.bind(generator));
}


function _createExtraSrcDirs(generator)
{
  var srcHybridPath = generator.destinationPath(constants.APP_SRC_HYBRID_DIRECTORY);
  var srcWebPath = generator.destinationPath(constants.APP_SRC_WEB_DIRECTORY);
  
  fs.ensureDirSync(srcHybridPath);
  fs.ensureDirSync(srcWebPath);
  
  return Promise.resolve(generator);
}

function _validateSrcDirExists(generator)
{
  var stats;
  var errorMsg;
  
  try
  {
    stats = fs.statSync(generator.destinationPath(constants.APP_SRC_DIRECTORY));
    return Promise.resolve(generator);
  }
  catch (err)
  {
    errorMsg = "Missing '" + constants.APP_SRC_DIRECTORY + "' directory. "
             + "Invalid JET project structure.";
    return Promise.reject(commonMessages.error(errorMsg, "validateSrcDirExists"));
  }
    
}

function _validateHybridDirDoesNotExist(generator)
{
  var stats;
  var errorMsg;
  
  try
  {
    stats = fs.statSync(generator.destinationPath(constants.CORDOVA_DIRECTORY));
    if (stats.isDirectory)
    {
      errorMsg = "The project already contains the '" + constants.CORDOVA_DIRECTORY
               + "' directory.";
      return Promise.reject(commonMessages.error(errorMsg, "validateHybridDirDoesNotExist"));
    }
  }
  catch (err)
  {
    // hybrid dir does not exist, OK to proceed
  }
  return Promise.resolve(generator);  
}

function _copyCordovaMocks(generator)
{
  var source = generator.templatePath("../../hybrid/templates/common/src/js/");
  var dest = generator.destinationPath("./src-hybrid/js/");

  return new Promise(function (resolve, reject)
  {
    if (common.fsExistsSync(source))
    {
      fs.copy(source, dest, function (err)
      {
        if (err)
        {
          reject(err);
          return;
        }
        resolve(generator);
      });
    }
    else
    {
      reject('Missing file \'/js/cordovaMocks.js\'.')
    }
  });
}
