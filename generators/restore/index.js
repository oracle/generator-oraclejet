/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var generators = require('yeoman-generator');
var fs = require('fs-extra');
var path = require('path');

var constants = require('../../util/constants');

/*
 * Compose with oraclejet:restore-web or oraclejet:restore-hybrid
 */
var OracleJetRestoreGenerator = generators.Base.extend({

  constructor: function () 
  {
    generators.Base.apply(this, arguments);
  },

  initializing: function() 
  {
    //if the project contains cordova's config.xml, consider it to be a hybrid; otherwise web
    this._hybrid = fs.existsSync(path.resolve(constants.CORDOVA_DIRECTORY, constants.CORDOVA_CONFIG_XML));
  },

  end: function() 
  {
    var appType = constants.APP_TYPE;
    var restoreType = this._hybrid ? appType.HYBRID : appType.WEB;

    this.composeWith('oraclejet:restore-' + restoreType);
  }
});

module.exports = OracleJetRestoreGenerator;