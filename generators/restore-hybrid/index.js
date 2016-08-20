/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var common = require("../../common");
var commonHybrid = require("../../hybrid");
var commonMessages = require("../../common/messages");
var commonRestore = require("../../common/restore");
var commonBowerCopy = require("../../common/bowerCopy");
var path = require("path");

/*
 * Generator for the restore step
 * Mainly to:
 * 1) invoke npm install + bower install
 * 2) write oraclejetconfig.json file
 * 3) invoke grunt bowercopy
 */
var OracleJetHybridRestoreGenerator = generators.Base.extend(
{
  initializing: function()
  {
    var done = this.async();
    common.validateArgs(this)
      .then(common.validateFlags)
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
  },

  install: function() 
  {
    this.log("Performing npm, bower installs may take a bit...");
    var done = this.async();
    
    commonRestore.npmBowerInstall({generator: this})
      .then(commonHybrid.copyHooks)
      .then(commonRestore.writeOracleJetConfigFile)
      .then(commonRestore.invokeBowerCopyScript)
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
    this.log(commonMessages.restoreComplete(this.options.invokedByRestore, path.basename(this.env.cwd)));
  }

});

module.exports = OracleJetHybridRestoreGenerator;
