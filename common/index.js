/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const commonMessages = require('./messages');
const CONSTANTS = require('../util/constants');

module.exports =
{
  gruntSpawnCommandPromise: function _gruntSpawnCommandPromise(context, cmd, args, log, options) {
    const generator = context.generator;
    const newArgs = args || [];

    generator.log(log);

    return new Promise((resolve, reject) => {
      // close event is fired after all stdio, which can catch errors from any
      // additional childProcesses inovked
      generator.spawnCommand(cmd, newArgs, options)
        .on('close', (err) => {
          if (err) {
            reject(commonMessages.error(err, log));
          } else {
            resolve(context);
          }
        })
        .on('error', (err) => {
          reject(commonMessages.error(err, log));
        });
    });
  },

  writeGitIgnore: function _writeGitIgnore(generator) {
    const gitSource = generator.destinationPath('_gitignore');
    const gitDest = generator.destinationPath('.gitignore');

    return new Promise((resolve, reject) => {
      fs.move(gitSource, gitDest, (err) => {
        if (err) {
          reject(commonMessages.error(err, 'writeGitIgnore'));
        } else {
          resolve(generator);
        }
      });
    });
  },

  writeCommonTemplates: function _writeCommonTemplates(generator) {
    const templateSrc = path.join(generator.templatePath(), '../../../template/common');
    const templateDest = generator.destinationPath();

    return new Promise((resolve, reject) => {
      fs.copy(templateSrc, templateDest, (err) => {
        if (err) {
          reject(commonMessages.error(err, 'writeCommonTemplates'));
        } else {
          resolve(generator);
        }
      });
    });
  },

  updatePackageJSON: function _updatePacakgeJSON(generator) {
    return new Promise((resolve) => {
      _updateJSONAppName(generator, 'package.json');
      resolve(generator);
    });
  },

  validateAppDirNotExistsOrIsEmpty: function _validateAppDirNotExistsOrIsEmpty(generator) {
    return new Promise((resolve, reject) => {
      const appDir = _handleAbsoluteOrMissingPath(generator);
      fs.stat(appDir, (err) => {
        if (err) {
          // Proceed to scaffold if appDir directory doesn't exist
          resolve(appDir);
        } else {
          fs.readdir(appDir, (readErr, items) => {
            const isEmpty = (!items || !items.length);
            if (isEmpty) {
              // Proceed to scaffold if appDir directory is empty
              resolve(appDir);
            } else {
              items.forEach((filename) => {
                if (_fileNotHidden(filename)) {
                  const error = `path already exists and is not empty: ${path.resolve(appDir)}`;
                  reject(commonMessages.error(error, 'validateAppDir'));
                } else if (filename === '.gitignore') {
                  const error = 'path already exists and contains a .gitignore file';
                  reject(commonMessages.error(error, 'validateAppDir'));
                }
              });
              resolve(appDir);
            }
          });
        }
      });
    });
  },

  switchToAppDirectory: function _switchToAppDirectory(generator) {
    generator.destinationRoot(generator.destinationPath(
      path.basename(path.resolve(generator.appDir))));
    return Promise.resolve(generator);
  },

  validateArgs: function _validateArgs(generator) {
    return new Promise((resolve, reject) => {
      const args = generator.arguments;
      const validLength = _getValidArgLength(generator.options.namespace);

      if (args.length > validLength) {
        reject(commonMessages.error(`Invalid additional arguments: ${args.splice(validLength)}`, 'validateArgs'));
      } else {
        resolve(generator);
      }
    });
  },

  validateFlags: function _validateFlags(generator) {
    return new Promise((resolve, reject) => {
      const flags = generator.options;
      const SUPPORTED_FLAGS = CONSTANTS.SUPPORTED_FLAGS(flags.namespace);
      Object.keys(flags).forEach((key) => {
        if (SUPPORTED_FLAGS.indexOf(key) === -1) {
          reject(commonMessages.error(`Invalid flag: ${key}`, 'validateFlags'));
        }
      });

      resolve(generator);
    });
  },

  fsExistsSync(filePath) {
    try {
      fs.statSync(filePath);
      return true;
    } catch (err) {
      // file/directory does not exist
      return false;
    }
  }
};

function _getValidArgLength(namespace) {
  // add-hybrid, restore, restore-web, restore-hybrid, add-sass, allow no argument
  // add-theme, app, hybrid, optional to take 1 argument
  return (/add-hybrid/.test(namespace) || /restore/.test(namespace) || /add-sass/.test(namespace))
  ? 0 : 1;
}

function _fileNotHidden(filename) {
  return !/^\..*/.test(filename);
}

function _handleAbsoluteOrMissingPath(generator) {
  let appDir = generator.appDir;
  const appDirObj = path.parse(appDir);
  // appDir is absolute or missing
  if (path.isAbsolute(appDir) || appDirObj.dir) {
    const parentDir = path.resolve(appDir, '..');
    fs.ensureDirSync(parentDir);
    generator.destinationRoot(parentDir);
    appDir = appDirObj.base;
  } else if (appDirObj.name === '.') {
    const absolutePath = path.resolve(appDir);
    generator.destinationRoot(path.resolve(absolutePath, '..'));
    appDir = path.basename(absolutePath);
  }
  return appDir;
}

function _updateJSONAppName(generator, jsonPath) {
  const json = fs.readJSONSync(generator.destinationPath(jsonPath));
  // space in app name will result in npm install failure
  json.name = _removeSpaceInAppName(generator.options.appname);
  fs.writeJSONSync(jsonPath, json);
}

function _removeSpaceInAppName(appName) {
  return appName.replace(' ', '-');
}
