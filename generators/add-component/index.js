/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

const generators = require('yeoman-generator');
const common = require('../../common');
const commonComponent = require('../../common/component');
const commonMessages = require('../../common/messages');
const commonTest = require('../../common/test');
const fs2 = require('fs');
const path = require('path');
/*
 * Generator for the add-component step
 */
const OracleJetAddComponentGenerator = generators.Base.extend(
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
      try {
        this.argument('componentName', { type: String, required: true });
      } catch (err) {
        this.env.error('Missing component name.');
      }
      _validateComponentName(this);
    },

    writing: function() { //eslint-disable-line
      const done = this.async();
      this.options.component = this.componentName;
      commonComponent.writeComponentTemplate(this)
      .then(commonTest.writeTestTemplate)
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
      const cwd = process.cwd();
      const isApp = fs2.existsSync(path.join(cwd, 'oraclejetconfig.json'));
      if (!isApp) {
        this.composeWith('@oracle/oraclejet:app', { options: this.options });
      } else {
        console.log(commonMessages.appendJETPrefix(`add component ${this.componentName} finished.`));
      }
      if (isApp) process.exit(1);
    }

  });

module.exports = OracleJetAddComponentGenerator;

function _validateComponentName(generator) {
  const name = generator.componentName;
  if (name !== name.toLowerCase() || name.indexOf('-') < 0 || !/^[a-z]/.test(name)) {
    const message = 'Invalid component name. Must be all lowercase letters and contain at least one hyphen.';
    throw `\x1b[31m${new Error(message)}\x1b[0m`; //eslint-disable-line
  }
}
