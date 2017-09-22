/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
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

        const appDir = generator.appDir === undefined
          ? process.cwd() : generator.destinationPath(generator.appDir);

        const _configPaths = generator.appDir === undefined
          ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();

        const destDirectory = generator.destinationPath(
          path.join(appDir, _configPaths.source,
            _configPaths.sourceJavascript, CONSTANTS.JET_COMPOSITES, generator.options.component));

        // avoid overwrite component
        if (fs.existsSync(destDirectory)) {
          console.log('Component already exists. ');
          return resolve(generator);
        }
        fs.ensureDirSync(destDirectory);
        fs.copySync(templateSrc, destDirectory);
        _replaceComponentTemplateToken(generator);
      }

      return resolve(generator);
    });
  }
};

function _replaceComponentTemplateToken(generator) {
  const componentName = generator.componentName || generator.options.component;

  const appDir = generator.appDir === undefined
    ? process.cwd() : generator.destinationPath(generator.appDir);

  const _configPaths = generator.appDir === undefined
    ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();

  const base = path.join(appDir, _configPaths.source,
    _configPaths.sourceJavascript, CONSTANTS.JET_COMPOSITES, componentName);

  CONSTANTS.COMPONENT_FILES.forEach((file) => {
    const fileContent = fs.readFileSync(path.join(base, file), 'utf-8');
    fs.outputFileSync(path.join(base, file), fileContent.replace(new RegExp('@component@', 'g'), componentName));
  });
}
