/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const paths = require('../../util/paths');
const path = require('path');
const templateHandler = require('../../common/template/');
const common = require('../../common');
const commonHybrid = require('../../hybrid');
const commonComponent = require('../../common/component');
const commonMessages = require('../../common/messages');
const commonTest = require('../../common/test');
const cordovaHelper = require('../../hybrid/cordova');
const platformsHelper = require('../../hybrid/platforms');

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 * 2) perform cordova create
 * 3) perform cordova add
 */
const OracleJetHybridCreateGenerator = generators.Base.extend(
  {
    constructor: function () { //eslint-disable-line
      generators.Base.apply(this, arguments); //eslint-disable-line

      this.argument(
      'appDir',
        {
          type: String,
          required: false,
          optional: true,
          defaults: '.',
          desc: 'Application directory to contain the scaffold content'
        });

      this.option('platforms', {
        desc: 'Specify the platforms to be supported by the scaffolded hybrid app [android, ios, windows]',
      });
      this.option('platform', {
        desc: 'Alias for --platforms if the user wishes to specify a single hybrid platform [android, ios, windows]'
      });
      this.option('template', {
        desc: 'Specify the starter template that is used to scaffold the app [blank, basic[:web|:hybrid], navbar[:web|:hybrid], navdrawer[:web|:hybrid], or <URL to zip file>'
      });
      this.option('appid', {
        desc: 'Specify the app ID for scaffolded hybrid app',
      });
    // Deprecated version
      this.option('appId', { desc: 'Deprecated. Use --appid instead.' });
      this.option('appname', {
        desc: 'Specify the app name for scaffolded hybrid app'
      });
    // Deprecated vrsion
      this.option('appName', { desc: 'Deprecated. Use --appname instead.' });
    },

    initializing: function () { //eslint-disable-line
      const done = this.async();
      if (this.options.component) {
        this.appDir = this.options.component;
      }
      common.validateArgs(this)
      .then(common.validateFlags)
      .then(common.validateAppDirNotExistsOrIsEmpty)
      .then((validAppDir) => {
        this.appDir = path.basename(validAppDir);

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

    writing: function () {  //eslint-disable-line
      const done = this.async();
      _writeTemplate(this)
      .then(common.switchToAppDirectory.bind(this))
      .then(common.writeCommonTemplates)
      .then(common.writeGitIgnore)
      .then(common.updatePackageJSON)
      .then(cordovaHelper.create)
      .then(commonHybrid.copyResources.bind(this))
      .then(commonHybrid.removeExtraCordovaFiles.bind(this))
      .then(platformsHelper.addPlatforms.bind(this))
      .then(commonHybrid.updateConfigXml.bind(this))
      .then(() => {
        done();
      })
      .catch((err) => {
        if (err) {
          this.log.error(err);
          process.exit(1);
        }
      });
    },

    end() {
      if (this.options.component) {
        this.log(`Oracle JET: Your component ${this.options.component} project is scaffolded. Performing npm install may take a bit...`);
      } else {
        this.log(commonMessages.scaffoldComplete());
      }

      if (!this.options.norestore) {
        this.composeWith('@oracle/oraclejet:restore-hybrid', { options: this.options });
      }
    }
  });

module.exports = OracleJetHybridCreateGenerator;

function _writeTemplate(generator) {
  return new Promise((resolve, reject) => {
    const appDir = generator.appDir;
    const appSrc = paths.getDefaultPaths().source;

    templateHandler.handleTemplate(generator, generator.destinationPath(`${appDir}/${appSrc}/`))
      .then(commonComponent.writeComponentTemplate)
      .then(commonTest.writeTestTemplate)
      .then(() => {
        resolve(generator);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

