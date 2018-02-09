/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const generators = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const constants = require('../../util/constants');
const common = require('../../common');
const paths = require('../../util/paths');
const commonMessages = require('../../common/messages');

const DEFAULT_THEME = 'mytheme';
const JET_SCSS_SRC_PATH = 'node_modules/@oracle/oraclejet/dist/scss';
const PLATFORM_TOKEN = '<%= platform %>';
const JET_VERSION_TOKEN = '<%= jetversion %>';
const THEMENAME_TOKEN = '<%= themename %>';
/*
 * Generator for the add-theme step
 */
const OracleJetAddThemeGenerator = generators.Base.extend(
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
    constructor: function () { //eslint-disable-line
      generators.Base.apply(this, arguments);//eslint-disable-line
      try {
        this.argument('themeName', { type: String, required: true });
      } catch (err) {
        this.env.error(commonMessages.prefixError(err));
      }
      if (this.themeName === constants.DEFAULT_THEME) {
        this.env.error(commonMessages.prefixError(`Theme ${constants.DEFAULT_THEME} is reserved.`));
      }

      if (!_isValidThemeName(this.themeName)) {
        this.env.error(commonMessages.prefixError(`Special characters invalid in theme name ${this.themeName}.`));
      }
    },

    writing: function () { //eslint-disable-line
      const done = this.async();
      _addSassTheme(this)
      .then(() => {
        done();
      })
      .catch((err) => {
        if (err) {
          this.env.error(commonMessages.prefixError(err));
        }
      });
    },

    end: function () {  //eslint-disable-line
      this.log(commonMessages.appendJETPrefix(`${this.themeName} theme added.`));
      process.exit(1);
    }

  });

module.exports = OracleJetAddThemeGenerator;

function _addSassTheme(generator) {
  const themeName = generator.themeName;
  const _configPaths = paths.getConfiguredPaths(generator.destinationPath());
  const srcPath = _configPaths.source;
  const srcThemes = _configPaths.sourceThemes;
  const themeDestPath = path.resolve(srcPath, srcThemes, themeName);
  fs.ensureDirSync(themeDestPath);

  const source = generator.templatePath(DEFAULT_THEME);

  return new Promise((resolve, reject) => {
    try {
      // first copy over templates
      fs.copySync(source, themeDestPath);
      _copySettingsFilesFromJETSrc(themeName, themeDestPath, generator);
      _renameFilesAllPlatforms(themeName, themeDestPath, generator);
      return resolve(generator);
    } catch (err) {
      return reject(commonMessages.error(err, 'add-theme'));
    }
  });
}

function _renameFilesAllPlatforms(themeName, dest, generator) {
  const platforms = _getAllSupportedPlatforms();

  platforms.forEach((platform) => {
    _renameFileOnePlatform(themeName, dest, platform, generator);
  });
}

function _getAllSupportedPlatforms() {
  return constants.SUPPORTED_PLATFORMS;
}

function _renameFileOnePlatform(themeName, dest, platform, generator) {
  const fileDir = path.join(dest, platform);
  const fileList = fs.readdirSync(fileDir);
  const scssFiles = fileList.filter(_isScssFile);

  scssFiles.forEach((file) => {
    const newPath = _renameFile(themeName, fileDir, file);
    _replaceTokens(newPath, generator, themeName, platform);
  });
}

// replace mytheme.css to the actual themeName.css
function _renameFile(themeName, fileDir, file) {
  const oldPath = path.join(fileDir, file);
  let newPath = file.replace(DEFAULT_THEME, themeName);
  newPath = path.join(fileDir, newPath);
  fs.renameSync(oldPath, newPath);
  return newPath;
}

function _isScssFile(file) {
  return /scss/.test(path.extname(file));
}

function _isValidThemeName(string) {
  return !(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(string)); //eslint-disable-line
}

function _getJetVersion(generator) {
  let packageJSON = generator.destinationPath('node_modules/@oracle/oraclejet/package.json');
  packageJSON = fs.readJsonSync(packageJSON);
  return packageJSON.version;
}

// default marker <%= jetversion %> <%= themename %> <%= platform %>
// are used to inject jet version and themename
function _replaceTokens(filePath, generator, themeName, platform) {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  const jetVersion = _getJetVersion(generator);
  fileContent = fileContent.replace(new RegExp(JET_VERSION_TOKEN, 'g'), jetVersion);
  fileContent = fileContent.replace(new RegExp(THEMENAME_TOKEN, 'g'), themeName);
  fileContent = fileContent.replace(new RegExp(PLATFORM_TOKEN, 'g'), platform);
  fs.outputFileSync(filePath, fileContent);
}

function _copySettingsFilesFromJETSrc(themeName, dest) {
  const settingsFileName = `_oj.alta.${PLATFORM_TOKEN}settings.scss`;

  constants.SUPPORTED_PLATFORMS.forEach((platform) => {
    const platformPath = _getPlatformPath(platform);
    const srcSettingFileName = _getSrcSettingFileName(platform);
    const srcPath = path.join(JET_SCSS_SRC_PATH, platformPath, srcSettingFileName);

    const destSettingFileName = _getDestSettingFileName(DEFAULT_THEME, platform);
    const destPath = path.join(dest, platform, destSettingFileName);

    fs.copySync(srcPath, destPath);
    _injectDefaultValues(destPath);
  });

  function _getDestSettingFileName(name, platform) {
    return `_${name}.${platform}.settings.scss`;
  }

  function _getSrcSettingFileName(platform) {
    const platformName = (platform === 'web') ? '' : `${platform}.`;
    return settingsFileName.replace(PLATFORM_TOKEN, platformName);
  }

  function _getPlatformPath(platform) {
    return (platform === 'web') ? 'alta' : `alta-${platform}`;
  }

  function _injectDefaultValues(filePath) {
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    const valuePairs = _getValuePairsArray();
    valuePairs.forEach((valuePair) => {
      fileContent = fileContent.replace(valuePair.str, valuePair.newStr);
    });
    fs.outputFileSync(filePath, fileContent);
  }

  function _getValuePairsArray() {
    return [
      {
        str: new RegExp('@import\ \"\.\.\/utilities', 'g'), //eslint-disable-line
        newStr: '@import "../../../../node_modules/@oracle/oraclejet/dist/scss/utilities',
      },
      {
        str: new RegExp('.*\\$themeName.*'),
        newStr: `$themeName:           ${THEMENAME_TOKEN} !default;`,
      },
      {
        str: new RegExp('.*\\$imageDir.*'),
        newStr: `$imageDir: "../../../alta/${JET_VERSION_TOKEN}/${PLATFORM_TOKEN}/images/" !default;`,
      },
      {
        str: new RegExp('.*\\$fontDir.*'),
        newStr: `$fontDir:  "../../../alta/${JET_VERSION_TOKEN}/${PLATFORM_TOKEN}/fonts/" !default;`,
      },
      {
        str: new RegExp('.*\\$commonImageDir.*'),
        newStr: `$commonImageDir:  "../../../alta/${JET_VERSION_TOKEN}/common/images/" !default;`,
      },
    ];
  }
}

