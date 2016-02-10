/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var generators = require("yeoman-generator");
var common = require("../../common");
var commonMessages = require("../../common/messages");
var templateHandler = require("../../common/template");

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
    common.validateAppDirNotExistsOrIsEmpty(this)
      .then(function()
      {
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
  },

  writing: function () 
  { 
    var done = this.async();
    var self = this;

    _writeTemplate(self)
      .then(common.writeCommonGruntScripts) 
      .then(function() 
      {
        // note the error will be handled in the writeTemplate and stop the 
        // generator

        // change the directory for oraclejet:restore and the invocation of cordova add
        self.destinationRoot(self.destinationPath(self.appDir));
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
    var appDirectory = generator.destinationPath(generator.appDir);
    
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




