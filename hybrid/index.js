/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require("path");

var common = require("../common");
var constants = require("../util/constants");
var commonMessages = require("../common/messages");
var DOMParser = require("xmldom").DOMParser;
var endOfLine = require("os").EOL;
var graphics = require("./graphics");

var ORACLEJET_APP_ID = "org.oraclejet.";

var CORDOVA_HOOKS =
[
  {
    type: "after_prepare", src: "scripts/hooks/jetAfterPrepare.js"
  }
];


module.exports =
{
  setupHybridEnv: function _setupHybridEnv(generator)
  {
    // platforms that will be added by cordova API.
    // note if this.options.platforms is not provided        
    // it will test out the platform candidates during the prompting
    // lifecycle; otherwise it will parse the provided 
    // platforms options and filter to those that are capable 
    // on the user's machine
    generator._platformsToInstall = []; 

    // prefer appname but support appName
    var appname = generator.options.appname ? generator.options.appname : generator.options.appName;
    if (!appname) 
    {
      generator.options.appname = _getAppBaseName(generator.appDir);
    }
    else
    {
      generator.options.appname = appname;
    }

    // prefer appid but support appId
    var appid = generator.options.appid ? generator.options.appid : generator.options.appId;
    if (!appid)
    {      
      generator.options.appid = _getDefaultAppId(generator.appDir);
    }
    else
    {
      generator.options.appid = appid;
    }
  },

  removeExtraCordovaFiles: function _removeExtraCordovaFiles(generator)
  { 
    var cordovaDir = generator.destinationPath(constants.CORDOVA_DIRECTORY);

    return new Promise(function(resolve, reject)
    {    
      try
      {
        fs.removeSync(path.resolve(cordovaDir, "hooks"));
        fs.removeSync(path.resolve(cordovaDir, "www/*"));
        resolve(generator);
      }
      catch (err)
      {
        reject(commonMessages.error(err, "removeExtraCordovaFiles"));
      }
    });
  },

  copyResources: function _copyResources(generator)
  {
    var source = generator.templatePath("../../hybrid/templates/common/res");
    var dest = generator.destinationPath(constants.CORDOVA_DIRECTORY) + "/res/";

    return new Promise(function(resolve, reject)
    {      
      fs.copy(source, dest, function(err)    
      {
        if(err)
        {
          reject(err);
          return;
        } 
        resolve(generator);
      });    
    });
  },
  
  updateConfigXml: function _updateConfigXml(generator)
  {
    var configXml = generator.destinationPath(constants.CORDOVA_DIRECTORY + "/" + constants.CORDOVA_CONFIG_XML);

    return new Promise(function(resolve, reject)
    {
      try {
        var configRead = fs.readFileSync(configXml, "utf-8");
        var document = new DOMParser().parseFromString(configRead, "text/xml");
        _addCordovaConfigDescriptionAndAuthor(document);
        _addCordovaConfigHooks(document);
        _addIosOrientationPreference(document);
        _addIosOverscrollPreference(document);
        _addAndroidOverscrollPreference(document);
        _addWindowsPreferences(document);
        _addIcons(document);
        _addSplash(document);
        fs.writeFileSync(configXml, document);
        resolve(generator);
      }
      catch (err)
      {
        reject(commonMessages.error(err, "updateConfigXml"));
      }
    });
  },

  copyHooks: function(context) 
  {
    // 'Generator' may be passed as {generator: generator} or {generator}
    const generator = context.generator || context;
    
    const source = generator.destinationPath('node_modules/oraclejet-tooling/hooks/');
    const dest = generator.destinationPath('hybrid/scripts/hooks/');

    return new Promise(function (resolve, reject) 
    {
      if (common.fsExistsSync(source))
      {
        fs.copy(source, dest, function (err)
        {
          if (err)
          {
            reject(err);
            return;
          }
          resolve(context);
        });
      }
      else
      {
        reject('Missing folder \'oraclejet-tooling/hooks/\'.')
      }
    });
  }
};


function _getDefaultAppId(appDir)
{
  appDir = _getAppBaseName(appDir);

 // strip non-word chars
  var appId = appDir.replace(/\W/g, "");

  // make sure the id does not start with a digit or underscore
  if (/^[\d_]+/.test(appId))
  {
    appId = "oj" + appId;
  }

  return ORACLEJET_APP_ID + appId.toLowerCase();  
}


function _getAppBaseName(appDir)
{
  return path.basename(path.resolve(appDir));  
}


function _addCordovaConfigDescriptionAndAuthor(document)
{
  var widget = _getFirstElementByTagName(document, "widget");
  var packageJSON = fs.readJSONSync(path.resolve("package.json"));
  _updateCordovaConfigAuthor(widget, packageJSON);
  _updateCordovaConfigDescription(widget, packageJSON);
} 

function _updateCordovaConfigAuthor(widget, packageJSON)
{
  var author = packageJSON.author;
  var authorElement = _getFirstElementByTagName(widget, "author");
  authorElement.childNodes[0].data = "\n        " + author.name +"\n    ";
  authorElement.setAttribute("email", author.email);
  authorElement.setAttribute("href", author.homepage);
}

function _updateCordovaConfigDescription(widget, packageJSON)
{
  var description = packageJSON.description;
  var descriptionElement = _getFirstElementByTagName(widget, "description");
  descriptionElement.childNodes[0].data = "\n        " + description +"\n    ";
}

function _addCordovaConfigHooks(document)
{
  var widget = _getFirstElementByTagName(document,"widget");
  
  CORDOVA_HOOKS.forEach(function(value) 
    {
      widget.appendChild(_createHookElement(document, value));
      widget.appendChild(_createNewLineElement(document));
    });
}

function _addIosOrientationPreference(document)
{
  _addPlatformElement(document, 'ios', 'preference', 'Orientation', 'all');
}

function _addIosOverscrollPreference(document)
{
  _addPlatformElement(document, 'ios', 'preference', 'DisallowOverscroll', 'true');
}

function _addAndroidOverscrollPreference(document)
{
  _addPlatformElement(document, 'android', 'preference', 'DisallowOverscroll', 'true');
}

function _addPlatformElement(document, platform, element, attribute, value) 
{
  const platforms = document.getElementsByTagName('platform');

  for (let i = 0; i < platforms.length; i++)
  {
    if (platforms[i].getAttribute('name') === platform)
    {
      const elementNode = document.createElement(element);
      elementNode.setAttribute('name', attribute);
      elementNode.setAttribute('value', value);

      platforms[i].appendChild(elementNode);
      break;
    }
  }  
}

function _addIcons(document) {
  var platforms = document.getElementsByTagName("platform");
               
  for (var i = 0; i < platforms.length; i++) {
    var platform = platforms[i].getAttribute("name");
    var platformIcons = graphics.ICONS[platform];
    for (var j = 0; j < platformIcons.length; j++) {
        var icon = document.createElement("icon");
        icon.setAttribute("src", path.join(graphics.PATH, "icon", platform, platformIcons[j].file));
        icon.setAttribute("width", platformIcons[j].width);
        icon.setAttribute("height", platformIcons[j].height);
        platforms[i].appendChild(icon);
    }
  }
}

function _addSplash(document) {
  var platforms = document.getElementsByTagName("platform");
               
  for (var i = 0; i < platforms.length; i++) {
    var platform = platforms[i].getAttribute("name");
    var platformSplash = graphics.SPLASH[platform];
    for (var j = 0; j < platformSplash.length; j++) {
        var splash = document.createElement("splash");
        for (var prop in platformSplash[j]) {
            if (prop === "src") {
                splash.setAttribute(prop, path.join(graphics.PATH, "screen", platform, platformSplash[j].src));
            }
            else {
                splash.setAttribute(prop, platformSplash[j][prop]);
            }
        }
        platforms[i].appendChild(splash);
    }
  }    
}

function _addWindowsPreferences(document)
{
  var windowsPlatformElem = _getWindowsPreferencesSection(document);
  var preference = document.createElement('preference');
  preference.setAttribute('name', 'windows-target-version');
  preference.setAttribute('value', '10.0');
  windowsPlatformElem.appendChild(preference);
}

function _getWindowsPreferencesSection(document)
{
  var platforms = document.getElementsByTagName("platform");

  for (var i = 0; i < platforms.length; i++)
  {
    if (platforms[i].getAttribute('name') === 'windows')
    {
      return platforms[i];
    }
  }
  var windowsPlatformElem = document.createElement('platform');
  windowsPlatformElem.setAttribute('name', 'windows');
  document.insertBefore(windowsPlatformElem, platforms[0]);
  return windowsPlatformElem;
}

function _createHookElement(document, value)
{
  var hook = document.createElement("hook");
  hook.setAttribute("type", value.type);
  hook.setAttribute("src", value.src);

  return hook;
}

function _createNewLineElement(document)
{
  return document.createTextNode(endOfLine);
}

function _getFirstElementByTagName(node, tag)
{
  return node.getElementsByTagName(tag)[0];
}

