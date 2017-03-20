/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const common = require('../../common');
const commonMessages = require('../../common/messages');
const templateHandler = require('../../common/template');
const path = require('path');

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 */
const OracleJetWebCreateGenerator = generators.Base.extend(
  {
    initializing: function () {   //eslint-disable-line
      const done = this.async();
      common.validateArgs(this)
      .then(common.validateFlags)
      .then(common.validateAppDirNotExistsOrIsEmpty)
      .then((validAppDir) => {
        this.appDir = path.basename(validAppDir);
        this.options.appname = this.appDir;
        return Promise.resolve(this);
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        this.env.error(commonMessages.prefixError(err));
      });
    },

    constructor: function () {                //eslint-disable-line
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

      this.option('template', {
        desc: 'blank, basic[:web|:hybrid], navbar[:web|:hybrid], navdrawer[:web|:hybrid], or <URL to zip file>'
      });
    },

    writing: function () {  //eslint-disable-line
      const done = this.async();
      const self = this;

      _writeTemplate(self)
      .then(common.switchToAppDirectory.bind(this))
      .then(common.writeCommonTemplates)
      .then(common.writeGitIgnore)
      .then(common.updatePackageJSON)
      .then(() => {
        done();
      })
      .catch((err) => {
        if (err) {
          self.env.error(commonMessages.prefixError(err));
        }
      });
    },

    end: function () {  //eslint-disable-line
      this.log(commonMessages.scaffoldComplete());

      if (!this.options.norestore) {
        this.composeWith('oraclejet:restore-web', { options: this.options });
      }
    }
  });

module.exports = OracleJetWebCreateGenerator;

function _writeTemplate(generator) {
  return new Promise((resolve, reject) => {
    const appDirectory = generator.destinationPath(path.join(generator.appDir, 'src'));

    templateHandler.handleTemplate(generator, appDirectory)
      .then(() => {
        resolve(generator);
      })
      .catch((err) => {
        reject(commonMessages.error(err, 'writeTemplate'));
      });
  });
}

