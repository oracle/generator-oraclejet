/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const paths = require('../../util/paths');
const constants = require('../../util/constants');

/*
 * Compose with oraclejet:restore-web or oraclejet:restore-hybrid
 */
const OracleJetRestoreGenerator = generators.Base.extend(
  {
    constructor: function () { //eslint-disable-line
      generators.Base.apply(this, arguments); //eslint-disable-line
    },

    initializing: function () { //eslint-disable-line
    // if the project contains cordova's config.xml, consider it to be a hybrid; otherwise web
      const cordovaDir = paths.getConfiguredPaths(this.destinationPath()).stagingHybrid;
      this._hybrid = fs.existsSync(path.resolve(cordovaDir, constants.CORDOVA_CONFIG_XML));
    },

    end: function () { //eslint-disable-line
      const appType = constants.APP_TYPE;
      const restoreType = this._hybrid ? appType.HYBRID : appType.WEB;
      this.options.invokedByRestore = true;

      this.composeWith(
      `@oracle/oraclejet:restore-${restoreType}`,
      { options: this.options, arguments: this.arguments });
    }
  });

module.exports = OracleJetRestoreGenerator;
