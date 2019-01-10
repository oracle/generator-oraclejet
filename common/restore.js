/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const common = require('./index');
const commonMessages = require('./messages');
const generatorJSON = require('../package.json');

const ORACLE_JET_CONFIG_FILE = 'oraclejetconfig.json';

module.exports =
{
  writeOracleJetConfigFile: function _writeOracleJetConfigFile(context) {
    const generator = context.generator;

    const destinationRoot = generator.destinationRoot();
    const configPath = path.resolve(destinationRoot, ORACLE_JET_CONFIG_FILE);

    return new Promise((resolve) => {
      generator.log('Writing:', ORACLE_JET_CONFIG_FILE);

    // need to place the oracletjetconfig.json at origDestRoot

      fs.stat(configPath, (err) => {
        const generatorVersion = _getOracleJetGeneratorVersion(generator);
        if (err) {
          generator.log(`${commonMessages.appendJETPrefix()}No config file. Writing the default config.`);
          fs.writeJSONSync(configPath, { generatorVersion });
        } else {
          const configJson = fs.readJSONSync(configPath);
          configJson.generatorVersion = generatorVersion;
          fs.writeJSONSync(configPath, configJson);
          generator.log(`${commonMessages.appendJETPrefix() + ORACLE_JET_CONFIG_FILE} file exists. Checking config.`);
        }
        resolve(context);
      });
    });
  },

  npmInstall: function _npmInstall(context) {
    return new Promise((resolve, reject) => {
      Promise.all([
        common.gruntSpawnCommandPromise(context, 'npm', ['install'], 'Invoking npm install.')
      ])
        .then(() => {
          // rejection will be handled by each promise which will
          // halt the generator
          resolve(context);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

/*
 * Gets the generator version
 */
function _getOracleJetGeneratorVersion() {
  // We intend to read the top level package.json for the generator-oraclejet module.
  // Note this path to package.json depends on the location of this file within the
  // module (common/restore.js)
  return generatorJSON.version;
}

