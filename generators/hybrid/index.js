/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var generators = require("yeoman-generator");
var constants = require("../../util/constants");
var templateHandler = require("../../common/template/");
var common = require("../../common");
var commonMessages = require("../../common/messages");
var cordovaHelper = require("./helper/cordova");
var platformsHelper = require("./helper/platforms");
var path = require("path");
var fs = require("fs-extra");
var endOfLine = require("os").EOL;
var DOMParser = require("xmldom").DOMParser;

var ORACLEJET_APP_ID = "org.oraclejet.";
var APP_SRC_DIRECTORY = "src";

var CORDOVA_HOOKS =
[
  {
    type: "after_prepare", src: "scripts/hooks/jetAfterPrepare.js"
  }
];

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 * 2) perform cordova create
 * 3) perform cordova add
 */
var OracleJetHybridCreateGenerator = generators.Base.extend({

  constructor: function() 
  {
    generators.Base.apply(this, arguments);

    this.argument(
      "appDir",
      {
        type: String,
        required: false,
        optional: true,
        defaults: ".",
        desc: "Application directory to contain the scaffold content"
      });

    this.option("platforms");
    this.option("template");
    this.option("appId");
    this.option("appName");
  },

  initializing: function() 
  { 
    var done = this.async();
    common.validateAppDirNotExistsOrIsEmpty(this)
      .then(function(validAppDir)
      {
        this.appDir = path.basename(validAppDir);

        // platforms that will be added by cordova API.
        // note if this.options.platforms is not provided        
        // it will test out the platform candidates during the prompting
        // lifecycle; otherwise it will parse the provided 
        // platforms options and filter to those that are capable 
        // on the user's machine
        this._platformsToProcess; 
    
        if (!this.options.appName) 
        {
          this.options.appName = _getAppBaseName(this.appDir);
        }

        if (!this.options.appId)
        {      
          this.options.appId = _getDefaultAppId(this.appDir);
        }

        done();
      }.bind(this))
      .catch(function(err)
      {
        this.env.error(commonMessages.prefixError(err));
      }.bind(this));
  },

  prompting: function()
  {
    
    if (!this.options.platforms) 
    {
      // if platforms option is not provided do prompt
      var done = this.async();
      
      // need to figure out which platforms user has enabled in their environment
      // since need to spawnCommands for testing, need to use Promise and since 
      // tests don't need to handle reject
      this._getPlatformsToProcess()
        .then(function(values) 
        {
          if (values.length === 0) 
          {
            this._platformsToProcess = [];
            return done();
          }

          this.prompt(
          {
            type: "checkbox",
            name: "platforms",
            choices: platformsHelper.filterPromptingPlatforms(values),
            message: "Please choose the platforms you want to install"
          }, function(answers) 
          {

            // preserve the values for the corodva add part
            this._platformsToProcess = answers.platforms;

            done();
          }.bind(this));

        }.bind(this));
      
    } 
  },

  writing: function() 
  {
    var done = this.async();
    
    _writeTemplate(this)
      .then(common.writeCommonGruntScripts)
      .then(cordovaHelper.create)
      .then(_removeExtraCordovaFiles.bind(this))
      .then(_writeCordovaHookScripts.bind(this))            
      .then(this._updateConfigXml.bind(this)) 
      .then(this._getPlatformsToProcess.bind(this))  
      .then(this._addPlatforms.bind(this))                 
      .then(function()
      {
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

  _getPlatformsToProcess: function() 
  {
    var platforms = this.options.platforms || constants.SUPPORTED_PLATFORMS.join(",");
    var self = this;
    if (this._platformsToProcess)
    {
      // meaning populated by prompting, just return the array since already processed
      // by filtering out possible platforms using all supported platforms for the 
      // generator
      return Promise.resolve(this._platformsToProcess);
    }
    else 
    {
      // hasn't been processed yet so check out which are valid platforms
      return new Promise(function(resolve, reject) 
      {
        platformsHelper.testPlatforms(self, _processPlatformOptions(self, platforms))
          .then(function(possiblePlatforms) 
          {
            self._platformsToProcess = possiblePlatforms;
            resolve(possiblePlatforms);
          })
          .catch(function(err)
          {
            reject(commonMessages.error(err,"testPlatform"));
          });
      });      
    }
  },

  _updateConfigXml: function()
  {
    var configXml = this.destinationPath(constants.CORDOVA_DIRECTORY + "/" + constants.CORDOVA_CONFIG_XML);
    var configRead = fs.readFileSync(configXml, "utf-8");
    var document = new DOMParser().parseFromString(configRead, "text/xml");
    _addCordovaConfigDescriptionAndAuthor(document);
    _addCordovaConfigHooks(document); 
    fs.writeFileSync(configXml, document);     
  },

  _addPlatforms: function() 
  {
    var platformPromises = [];
    var platforms = this._platformsToProcess;
    var context = {generator: this};

    this.destinationRoot(this.destinationPath(constants.CORDOVA_DIRECTORY));

    platforms.forEach(function(value) 
    {
      var addCordova = common.gruntSpawnCommandPromise(context, "cordova", 
        ["platform", "add", value, "--save"], "Adding platform : " + value);

      platformPromises.push(addCordova);
    });

    return new Promise(function(resolve, reject)
    {
      Promise.all(platformPromises)
        .then(function() 
        {
          context.generator.destinationRoot(path.resolve(".."));
          resolve();
        })
        .catch(function(err)
        {
          reject(commonMessages.error(err, "addPlatforms"));
        });
    });
  },

  end: function() 
  {    
    this.log(commonMessages.scaffoldComplete());
    if (!this.options.norestore)
    { 
      this.composeWith("oraclejet:restore-hybrid", {options: this.options});
    }
  }
});

module.exports = OracleJetHybridCreateGenerator;

// filter the content to perform test on only the platforms that were passed in the invocation; 
// otherwise do on none
function _processPlatformOptions(generator, platforms)
{
  if (!platforms)
  {
    return [];
  }

  var splitted = platforms.split(",");
  var trimmed = splitted.map(function(val)
  {
    return val.trim();
  });

  // now filter the content to only supported ones
  return trimmed.filter(function(val) 
  {
    var supportedValue = constants.SUPPORTED_PLATFORMS.indexOf(val);
    if (supportedValue === -1) 
    {
      generator.log("WARNING: Passed in unsupported platform - ", val);
    }

    return supportedValue !== -1;
  });
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

function _writeTemplate(generator)
{
  return new Promise(function(resolve, reject) 
  {
    var appDir = generator.appDir;

    templateHandler.handleTemplate(generator, generator.destinationPath(appDir + "/" + APP_SRC_DIRECTORY + "/"))
      .then(function() 
      {
        resolve(generator);
      })
      .catch(function(err)
      {
        reject(commonMessages.error(err,"writeTemplate"));
      });
  });
}

function _removeExtraCordovaFiles(generator)
{ 
  var cordovaDir = this.destinationPath(constants.CORDOVA_DIRECTORY);

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
      return reject(commonMessages.error(err, "removeExtraCordovaFiles"));
    }
  });
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

function _getFirstElementByTagName(node, tag)
{
  return node.getElementsByTagName(tag)[0];
}

function _writeCordovaHookScripts(generator)
{ 
  var source = generator.templatePath("common/scripts/hooks");
  var dest = generator.destinationPath(constants.CORDOVA_DIRECTORY) + "/scripts/hooks/";
  fs.ensureDirSync(dest);
  
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
}

