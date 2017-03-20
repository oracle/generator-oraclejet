/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const common = require('../../common');
const commonHybrid = require('../../hybrid');
const commonMessages = require('../../common/messages');
const commonRestore = require('../../common/restore');
const path = require('path');

/*
 * Generator for the restore step
 * Mainly to:
 * 1) invoke npm install
 * 2) write oraclejetconfig.json file
 */
const OracleJetHybridRestoreGenerator = generators.Base.extend(
  {
    initializing: function() {  //eslint-disable-line
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
    constructor: function () { //eslint-disable-line
      generators.Base.apply(this, arguments); //eslint-disable-line
    },

    install: function() {  //eslint-disable-line
      this.log('Performing npm install may take a bit...');
      const done = this.async();

      commonRestore.npmInstall({ generator: this })
      .then(commonHybrid.copyHooks)
      .then(commonRestore.writeOracleJetConfigFile)
      .then(() => {
        done();
      })
      .catch((err) => {
        if (err) {
          this.env.error(commonMessages.prefixError(err));
        }
      });
    },

    end: function() {  //eslint-disable-line
      this.log(commonMessages.restoreComplete(
        this.options.invokedByRestore, path.basename(this.env.cwd)));
      process.exit(1);
    }

  });

module.exports = OracleJetHybridRestoreGenerator;
