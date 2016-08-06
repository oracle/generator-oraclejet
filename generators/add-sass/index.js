/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var fs = require("fs-extra");
var path = require("path");
var constants = require("../../util/constants");
var common = require("../../common");
var commonMessages = require("../../common/messages");

/*
 * Generator for the add-sass step
 */
var OracleJetAddSassGenerator = generators.Base.extend(
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
  
  writing: function() 
  {
    var done = this.async();
    
    _npmInstallNodeSass(this)               
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
    this.log(commonMessages.appendJETPrefix('add-sass finished.'));
    process.exit(1);
  }

});

module.exports = OracleJetAddSassGenerator;


function _npmInstallNodeSass(generator) {
  try {
    generator.npmInstall(['node-sass@3.4.2'], {'saveDev':true});
    return Promise.resolve(generator);
  } catch (err) {
    return Promise.reject(commonMessages.error(err, "install node-sass"));
  }
  
}