/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var common = require("../../common");
var commonMessages = require("../../common/messages");
var templateHandler = require("../../common/template");
var path = require("path");

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 */
var OracleJetWebCreateGenerator = generators.Base.extend(
{
  initializing: function()
  {
    var done = this.async();
    common.validateArgs(this)
      .then(common.validateFlags)
      .then(common.validateAppDirNotExistsOrIsEmpty)
      .then(function(validAppDir)
      {
        this.appDir = path.basename(validAppDir);
        return Promise.resolve(this);
      }.bind(this))
      .then(() => {
        done();
      })    
      .catch(function(err)
      {
        this.env.error(commonMessages.prefixError(err));
      }.bind(this));
  },

  constructor: function () 
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
    
    this.option('template', {
      desc: 'blank, basic[:web|:hybrid], navbar[:web|:hybrid], navdrawer[:web|:hybrid], or <URL to zip file>'
    });
  },

  writing: function () 
  { 
    var done = this.async();
    var self = this;

    _writeTemplate(self)
      .then(common.writeCommonGruntScripts)
      .then(common.switchToAppDirectory.bind(this))
      .then(common.writeGitIgnore) 
      .then(function() 
      {
        done();
      })
      .catch(function(err)
      {
        if (err)
        {          
          self.env.error(commonMessages.prefixError(err));
        }       
      }.bind(self));
  },

  end: function() 
  {
    this.log(commonMessages.scaffoldComplete());

    if (!this.options.norestore)
    {
      this.composeWith("oraclejet:restore-web", {options:this.options});
    }
  }
});

module.exports = OracleJetWebCreateGenerator;

function _writeTemplate(generator) 
{

  return new Promise(function (resolve, reject) 
  { 
    var appDirectory = generator.destinationPath(path.join(generator.appDir, 'src'));
    
    templateHandler.handleTemplate(generator, appDirectory)
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




