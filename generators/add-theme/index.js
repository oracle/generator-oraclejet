/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var fs = require("fs-extra");
var path = require("path");
var constants = require("../../util/constants");
var common = require("../../common");
var commonMessages = require("../../common/messages");
const DEFAULT_THEME = 'mytheme';
const JET_SCSS_SRC_PATH = 'bower_components/oraclejet/dist/scss';
const PLATFORM_TOKEN = '<%= platform %>';
const JET_VERSION_TOKEN = '<%= jetversion %>';
const THEMENAME_TOKEN = '<%= themename %>';
/*
 * Generator for the add-theme step
 */
var OracleJetAddThemeGenerator = generators.Base.extend(
{
  initializing: function()
  {
    var done = this.async();
    common.validateArgs(this)
      .then(common.validateFlags)
      .then(() => {
        done();
      })    
      .catch(function(err)
      {
        this.env.error(commonMessages.prefixError(err));
      }.bind(this));
  },
  constructor: function () 
  {
    generators.Base.apply(this, arguments);
    try {
      this.argument('themeName', {type: String, required: true});
    } catch (err) {
      this.env.error(commonMessages.prefixError(err));
    }
    if(this.themeName === constants.DEFAULT_THEME) {
      this.env.error(commonMessages.prefixError("Theme " + constants.DEFAULT_THEME + " is reserved."));    }    
  },
  
  writing: function() 
  {
    var done = this.async();
    _addSassTheme(this) 
      .then(function(){
        done();
      })              
      .catch(function(err)
      {
        if (err)
        {
          this.env.error(commonMessages.prefixError(err));
        }
      }.bind(this));
  },

  end: function() 
  {
    this.log(commonMessages.appendJETPrefix(this.themeName + ' theme added.'));
    process.exit(1);
  }

});

module.exports = OracleJetAddThemeGenerator;


function _addSassTheme(generator) {
  var themeName = generator.themeName;

  const srcPath = generator.destinationPath(constants.APP_SRC_DIRECTORY);
  const themeDestPath =  path.join(srcPath, 'themes', themeName);
  fs.ensureDirSync(themeDestPath);

  var source = generator.templatePath(DEFAULT_THEME);

  return new Promise((resolve, reject) => {
    try {
      // first copy over templates
      fs.copySync(source, themeDestPath); 
      _copySettingsFilesFromJETSrc(themeName, themeDestPath, generator);  
      _renameFilesAllPlatforms(themeName, themeDestPath, generator);   
      return resolve(generator);
    } catch (err) {
      return reject(commonMessages.error(err, "add-theme"));
    }  
  }); 
}

function _renameFilesAllPlatforms(themeName, dest, generator) {
  let platforms = _getAllSupportedPlatforms();

  platforms.forEach((platform) => {
    _renameFileOnePlatform(themeName, dest, platform, generator);
  });
}

function _getAllSupportedPlatforms() {
  return constants.SUPPORTED_PLATFORMS;
}

function _renameFileOnePlatform(themeName, dest, platform, generator) {
  let fileDir = path.join(dest, platform);
  let fileList = fs.readdirSync(fileDir);
  let scssFiles = fileList.filter(_isScssFile);

  scssFiles.forEach((file) => {     
    let newPath = _renameFile(themeName, fileDir, file);
    _replaceTokens(newPath, generator, themeName, platform); 
  });
}

//replace mytheme.css to the actual themeName.css
function _renameFile(themeName, fileDir, file) {
  let oldPath = path.join(fileDir, file);  
  let newPath = file.replace(DEFAULT_THEME, themeName);
  newPath = path.join(fileDir, newPath);
  fs.renameSync(oldPath, newPath);
  return newPath;
}

function _isScssFile(file) {
  return /scss/.test(path.extname(file));
}

function _getJetVersion(generator) {
  let bowerJSON = generator.destinationPath('bower_components/oraclejet/bower.json');
  bowerJSON = fs.readJsonSync(bowerJSON);
  return bowerJSON.version;
}

// default marker <%= jetversion %> <%= themename %> <%= platform %>are used to inject jet version and themename
function _replaceTokens(filePath, generator, themeName, platform) {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  const jetVersion = _getJetVersion(generator); 
  fileContent = fileContent.replace(new RegExp(JET_VERSION_TOKEN, 'g'), jetVersion);
  fileContent = fileContent.replace(new RegExp(THEMENAME_TOKEN, 'g'), themeName);
  fileContent = fileContent.replace(new RegExp(PLATFORM_TOKEN, 'g'), platform);
  fs.outputFileSync(filePath, fileContent);
}

function _copySettingsFilesFromJETSrc(themeName, dest, generator) {
  
  const settingsFileName = `_oj.alta.${PLATFORM_TOKEN}settings.scss`;

  constants.SUPPORTED_PLATFORMS.forEach((platform) => {
    const platformPath = _getPlatformPath(platform);
    const srcSettingFileName = _getSrcSettingFileName(platform);
    const srcPath = path.join(JET_SCSS_SRC_PATH, platformPath, srcSettingFileName);

    const destSettingFileName = _getDestSettingFileName(themeName, platform);
    const destPath = path.join(dest, platform, destSettingFileName);

    fs.copySync(srcPath, destPath);
    _injectDefaultValues(destPath);
  });

  function _getDestSettingFileName(name, platform) {
    return `_${name}.${platform}.settings.scss`;
  }

  function _getSrcSettingFileName(platform) {
    const platformName = (platform === 'web') ? '' : platform + '.';
    return settingsFileName.replace(PLATFORM_TOKEN, platformName);
  }

  function _getPlatformPath(platform) {
    return (platform === 'web') ? 'alta' : `alta-${platform}`;
  }

  function _injectDefaultValues(filePath) {
    let fileContent = fs.readFileSync(filePath,'utf-8');
    const valuePairs = _getValuePairsArray();
    valuePairs.forEach((valuePair) => {
      fileContent = fileContent.replace(valuePair.str, valuePair.newStr);
    });
    fs.outputFileSync(filePath, fileContent);
  }

  function _getValuePairsArray() {
    return [
      {
        str:'@import "../utilities/oj.utilities.urls";',
        newStr: '@import "../../../../bower_components/oraclejet/dist/scss/utilities/oj.utilities.urls";',
      },
      {
        str: '@import "../utilities/oj.utilities.math";',
        newStr: '@import "../../../../bower_components/oraclejet/dist/scss/utilities/oj.utilities.math";',
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

