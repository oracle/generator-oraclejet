/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const common = require('../../common');
const commonMessages = require('../../common/messages');

/*
 * Generator for the add-sass step
 */
const OracleJetAddSassGenerator = generators.Base.extend(
  {
    initializing: function () { //eslint-disable-line
      const done = this.async();
      common.validateArgs(this)
      .then(common.validateFlags)
      .then(() => {
        done();
      })
      .catch((err) => {
        this.env.error(commonMessages.prefixError(err));
      });
    },

    constructor: function() { //eslint-disable-line
      generators.Base.apply(this, arguments); //eslint-disable-line
    },

    writing: function() { //eslint-disable-line
      const done = this.async();

      _npmInstallNodeSass(this)
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
      console.log(commonMessages.appendJETPrefix('add-sass finished.'));
      process.exit(1);
    }

  });

module.exports = OracleJetAddSassGenerator;


function _npmInstallNodeSass(generator) {
  try {
    generator.npmInstall(['node-sass@4.5.3'], { saveDev: true });
    return Promise.resolve(generator);
  } catch (err) {
    return Promise.reject(commonMessages.error(err, 'install node-sass'));
  }
}
