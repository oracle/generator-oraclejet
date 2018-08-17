/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const CONSTANTS = require('../util/constants');
const paths = require('../util/paths');

module.exports =
{
  writeComponentTemplate: function _writeComponentTemplate(generator) {
    return new Promise((resolve) => {
      if (generator.options.component) {
        const templateSrc = path.join(generator.templatePath(), '../../../template/component');
        const isApp = fs.existsSync(path.join(process.cwd(), CONSTANTS.APP_CONFIG_JSON))
          || generator.appDir !== undefined;

        if (!isApp) return resolve(generator);

        const destDirectory = _getComponentDestPath(generator);
        // avoid overwrite component
        if (fs.existsSync(destDirectory)) {
          console.log('Component already exists. ');
          return resolve(generator);
        }

        fs.ensureDirSync(destDirectory);
        fs.copySync(templateSrc, destDirectory);
        if (generator.options.pack) _updatePackInfo(generator);
        _renamePrefix(generator);
        _replaceComponentTemplateToken(generator);
      }

      return resolve(generator);
    });
  }
};

function _getComponentDestPath(generator) {
  let destBase = _getCompositesBasePath(generator);

  if (generator.options.pack) {
    const packPath = path.join(destBase, generator.options.pack);
    fs.ensureDirSync(packPath);
    destBase = path.join(destBase, generator.options.pack);
  }
  return path.join(destBase, generator.options.component);
}

function _replaceComponentTemplateToken(generator) {
  const componentName = _getComponentName(generator);
  const base = _getComponentDestPath(generator);
  _replaceComponentTokenInFileList(base, componentName);
  _replaceComponentTokenInFileList(path.join(base, 'resources/nls'), componentName);
}

function _replaceComponentTokenInFileList(base, componentName) {
  fs.readdirSync(base).forEach((file) => {
    if (path.extname(file).length !== 0) {
      const fileContent = fs.readFileSync(path.join(base, file), 'utf-8');
      fs.outputFileSync(path.join(base, file), fileContent.replace(new RegExp('@component@', 'g'), componentName));
    }
  });
}

function _getCompositesBasePath(generator) {
  const appDir = generator.appDir === undefined
    ? process.cwd() : generator.destinationPath(generator.appDir);

  const _configPaths = generator.appDir === undefined
    ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();

  return path.join(appDir, _configPaths.source,
    _configPaths.sourceJavascript, CONSTANTS.JET_COMPOSITES);
}

function _getComponentName(generator) {
  return generator.componentName || generator.options.component;
}

function _renamePrefix(generator) {
  let base = _getComponentDestPath(generator);
  const componentName = _getComponentName(generator);
  fs.readdirSync(base).forEach((file) => {
    if (/@component@/.test(file)) _renamePrefixFile(generator, base, file, componentName);
  });

  base = path.join(base, 'resources/nls');
  if (fs.existsSync(base)) {
    fs.readdirSync(base).forEach((file) => {
      if (/@component@/.test(file)) _renamePrefixFile(generator, base, file, componentName);
    });
  }
}

// replace prefix to include the component name
function _renamePrefixFile(generator, fileDir, file, componentName) {
  const oldPath = path.join(fileDir, file);
  let newPath = file.replace('@component@', componentName);
  newPath = path.join(fileDir, newPath);
  fs.renameSync(oldPath, newPath);
}

function _updatePackInfo(generator) {
  const jsonPath = path.join(_getComponentDestPath(generator), 'component.json');
  const componentJson = fs.readJsonSync(jsonPath);
  componentJson.pack = generator.options.pack;
  fs.outputJsonSync(jsonPath, componentJson);
}

