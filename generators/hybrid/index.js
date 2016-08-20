/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var constants = require("../../util/constants");
var path = require("path");
var templateHandler = require("../../common/template/");
var common = require("../../common");
var commonHybrid = require("../../hybrid");
var commonMessages = require("../../common/messages");
var cordovaHelper = require("../../hybrid/cordova");
var platformsHelper = require("../../hybrid/platforms");

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 * 2) perform cordova create
 * 3) perform cordova add
 */
var OracleJetHybridCreateGenerator = generators.Base.extend({

  constructor: function() 
  {
    generators.Base.apply(this, arguments);

    this.argument(
      "appDir",
      {
        type: String,
        required: false,
        optional: true,
        defaults: ".",
        desc: "Application directory to contain the scaffold content"
      });

    this.option("platforms", {desc:"Create the application for multiple mobile platforms"});
    this.option("platform", {desc:"Create the application with single platform"});
    this.option("template", {desc:"Use one of the starter templates"});
    this.option("appid", {desc:"Specify the app id for your application"});
    // Deprecated version
    this.option("appId",{desc:"Deprecated. Use --appid instead."});
    
    this.option("appname",{desc:"Specify the app name for your application"});
    // Deprecated vrsion
    this.option("appName", {desc:"Deprecated. Use --appname instead."});
  },

  initializing: function() 
  {
    var done = this.async();
    common.validateArgs(this)
      .then(common.validateFlags)
      .then(common.validateAppDirNotExistsOrIsEmpty)
      .then(function(validAppDir)
      {
        this.appDir = path.basename(validAppDir);
        
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
    
    _writeTemplate(this)
      .then(common.writeCommonGruntScripts)
      .then(common.switchToAppDirectory.bind(this))
      .then(common.writeGitIgnore)
      .then(cordovaHelper.create)
      .then(commonHybrid.copyResources.bind(this))
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

  },

  end: function() 
  {    
    this.log(commonMessages.scaffoldComplete());
    if (!this.options.norestore)
    { 
      this.composeWith("oraclejet:restore-hybrid", { options: this.options });
    }
  }
});

module.exports = OracleJetHybridCreateGenerator;

function _writeTemplate(generator)
{
  return new Promise(function(resolve, reject) 
  {
    var appDir = generator.appDir;

    templateHandler.handleTemplate(generator, generator.destinationPath(appDir + "/" + constants.APP_SRC_DIRECTORY + "/"))
      .then(function() 
      {
        resolve(generator);
      })
      .catch(function(err)
      {
        reject(commonMessages.error(err, "writeTemplate"));
      });
  });
}

