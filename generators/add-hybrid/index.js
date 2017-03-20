/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const common = require('../../common');
const paths = require('../../util/paths');
const commonMessages = require('../../common/messages');
const commonHybrid = require('../../hybrid');
const cordovaHelper = require('../../hybrid/cordova');
const platformsHelper = require('../../hybrid/platforms');

const _configPaths = {};

/*
 * Generator for the add-hybrid step
 */
const OracleJetAddHybridGenerator = generators.Base.extend(
  {
    constructor: function() {     //eslint-disable-line
      generators.Base.apply(this, arguments); //eslint-disable-line

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
      this.option('appId', { desc: 'Deprecated. Use --appid instead.' });
      this.option('appname', {
        desc: 'Specify the app name for scaffolded hybrid app'
      });
    // Deprecated version
      this.option('appName', { desc: 'Deprecated. Use --appname instead.' });
    },

    initializing: function () { //eslint-disable-line
      const done = this.async();
      _setConfigPaths(paths.getConfiguredPaths(this.destinationPath()));
      common.validateArgs(this)
      .then(common.validateFlags)
      .then(_validateAppDirForAddHybrid)
      .then(() => {
        this.appDir = path.basename(this.destinationRoot());
        commonHybrid.setupHybridEnv(this);
        done();
      })
      .catch((err) => {
        this.env.error(commonMessages.prefixError(err));
      });
    },

    prompting: function () {  //eslint-disable-line
      const done = this.async();

      platformsHelper.getPlatforms(this)
      .then(() => {
        done();
      });
    },

    writing: function() { //eslint-disable-line
      const done = this.async();

      _createExtraSrcDirs(this)
      .then(cordovaHelper.create.bind(this))
      .then(commonHybrid.copyHooks.bind(this))
      .then(commonHybrid.copyResources.bind(this))
      .then(_copyCordovaMocks.bind(this))
      .then(commonHybrid.removeExtraCordovaFiles.bind(this))
      .then(platformsHelper.addPlatforms.bind(this))
      .then(commonHybrid.updateConfigXml.bind(this))
      .then(() => {
        done();
      })
      .catch((err) => {
        if (err) {
          this.env.error(commonMessages.prefixError(err));
        }
      });
    },

    end: function() { //eslint-disable-line
      this.log(commonMessages.appendJETPrefix('Add-hybrid finished.'));
    }

  });

function _setConfigPaths(configPathObj) {
  Object.keys(configPathObj).forEach((key) => {
    _configPaths[key] = configPathObj[key];
  });
}

function _validateAppDirForAddHybrid(generator) {
  return _validateSrcDirExists(generator)
    .then(_validateHybridDirDoesNotExist.bind(generator));
}


function _createExtraSrcDirs(generator) {
  let srcHybridPath = _configPaths.sourceHybrid;
  let srcWebPath = _configPaths.sourceWeb;
  srcWebPath = generator.destinationPath(srcWebPath);
  srcHybridPath = generator.destinationPath(srcHybridPath);
  fs.ensureDirSync(srcHybridPath);
  fs.ensureDirSync(srcWebPath);

  return Promise.resolve(generator);
}

function _validateSrcDirExists(generator) {
  let errorMsg;
  const appSrcPath = _configPaths.source;
  try {
    fs.statSync(generator.destinationPath(appSrcPath));
    return Promise.resolve(generator);
  } catch (err) {
    errorMsg = `Missing '${appSrcPath}' directory. `
             + 'Invalid JET project structure.';
    return Promise.reject(commonMessages.error(errorMsg, 'validateSrcDirExists'));
  }
}

function _validateHybridDirDoesNotExist(generator) {
  let stats;
  let errorMsg;

  try {
    const hybridPath = _configPaths.stagingHybrid;
    stats = fs.statSync(generator.destinationPath(hybridPath));
    if (stats.isDirectory) {
      errorMsg = `The project already contains the '${hybridPath
                }' directory.`;
      return Promise.reject(commonMessages.error(errorMsg, 'validateHybridDirDoesNotExist'));
    }
  } catch (err) {
    // hybrid dir does not exist, OK to proceed
  }
  return Promise.resolve(generator);
}

function _copyCordovaMocks(generator) {
  const source = generator.templatePath('../../hybrid/templates/common/src/js/');
  const srcHybridPath = _configPaths.sourceHybrid;
  const srcJsPath = _configPaths.sourceJavascript;
  const dest = generator.destinationPath(`./${srcHybridPath}/${srcJsPath}/`);

  return new Promise((resolve, reject) => {
    if (common.fsExistsSync(source)) {
      fs.copy(source, dest, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(generator);
      });
    } else {
      reject('Missing file \'cordovaMocks.js\'.');
    }
  });
}

module.exports = OracleJetAddHybridGenerator;
