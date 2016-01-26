/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var generators = require('yeoman-generator');

var constants = require("../../util/constants");

var templateHandler = require("../../common/template/");
var common = require("../../common");

var cordovaHelper = require("./helper/cordova");
var platformsHelper = require("./helper/platforms");

var path = require('path');
var fs = require('fs-extra');
var endOfLine = require('os').EOL;
var DOMParser = require('xmldom').DOMParser;

var CORDOVA_HOOKS =
[
  {
    type: "after_prepare", src: "scripts/hooks/jetAfterPrepare.js"
  },
  {
    type: "before_compile", src: "scripts/hooks/jetBeforeCompile.js"
  },
  {
    type: "before_run", src: "scripts/hooks/jetBeforeRun.js"
  }  
];

var ORACLEJET_DOMAIN = "org.oraclejet.";

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 * 2) perform cordova create
 * 3) perform cordova add
 */
var OracleJetHybridCreateGenerator = generators.Base.extend({

  constructor: function () 
  {
    generators.Base.apply(this, arguments);

    this.argument('appDir', { type: String, required: false, optional:true, defaults:".", desc: "Application directory to contain the scaffold content" });

    this.option('platforms');
    this.option('template');
    this.option('domain');
    this.option('title');
  },

  initializing: function() 
  { 
    var done = this.async();
    _validateTemplate(this);
    common.validateAppDirNotExistsOrIsEmpty(this.appDir)
      .then(function()
      {
        done();
      })
      .catch(function(err)
      {
        this.env.error(err);
      }.bind(this));

    this._platformsToProcess; //platforms that will be added by cordova API
                              //note if this.options.platforms is not provided
                              //it will test out the platform candidates during the prompting
                              //lifecycle; otherwise it will parse the provided 
                              //platforms options and filter to those that are capable 
                              //on the user's machine
    
    if (!this.options.title) 
    {
      this.options.title = _getAppBaseName(this.appDir);
    }

    if (!this.options.domain)
    {      
      this.options.domain = _getDefaultAppId(this.appDir);
    }
  },

  prompting: function()
  {
    
    if(!this.options.platforms) 
    {
      //if platforms option is not provided do prompt
      var done = this.async();
      
      //need to figure out which platforms user has enabled in their environment
      //since need to spawnCommands for testing, need to use Promise and since 
      //tests don't need to handle reject
      this._getPlatformsToProcess()
        .then(function(values) 
        {
          if(values.length === 0) 
          {
            this._platformsToProcess = [];
            return done();
          }

          this.prompt(
          {
            type    : "checkbox",
            name    : 'platforms',
            choices : platformsHelper.filterPromptingPlatforms(values),
            message : 'Please choose the platforms you want to install'
          }, function (answers) 
          {

            //preserve the values for the corodva add part
            this._platformsToProcess = answers.platforms;
            done();

          }.bind(this));

        }.bind(this));
      
    } 

  },

  writing: function () 
  {
    var done = this.async();
    
    cordovaHelper.create(this)  
      .then(_removeExtraCordovaFiles.bind(this))            
      .then(_writeTemplate.bind(this))
      .then(common.writeCommonGruntScripts)
      .then(this._updateConfigXml.bind(this)) 
      .then(this._getPlatformsToProcess.bind(this))  
      .then(this._addPlatforms.bind(this))                 
      .then(function()
      {
        done();
      })
      .catch(function(err)
      {
        if(err)
        {
          this.env.error(err);
        }
      }.bind(this));

  },

  _getPlatformsToProcess: function() 
  {
    var platforms = this.options.platforms || constants.SUPPORTED_PLATFORMS.join(",");
    var self = this;
    if(this._platformsToProcess)
    {
      //meaning populated by prompting, just return the array since already processed
      //by filtering out possible platforms using all supported platforms for the 
      //generator
      return Promise.resolve(this._platformsToProcess);
    }
    else 
    {
      //hasn't been processed yet so check out which are valid platforms
      return new Promise(function (resolve, reject) 
      {

        platformsHelper.testPlatforms(self, _processPlatformOptions(self, platforms))
          .then(function(possiblePlatforms) 
          {
            self._platformsToProcess = possiblePlatforms;
            resolve(possiblePlatforms);
          })
          .catch(function(err)
          {
            reject(err);
          });
      });      
    }
  },

  _updateConfigXml: function ()
  {
    process.chdir(this.destinationPath(this.appDir));
    var configXml = this.destinationPath(constants.CORDOVA_CONFIG_XML);
    var configRead = fs.readFileSync(configXml, "utf-8");
    var document = new DOMParser().parseFromString(configRead, 'text/xml');
    _addCordovaConfigDescriptionAndAuthor(document);  
    _addCordovaConfigHooks(document); 
    fs.writeFileSync(configXml, document);     
  },

  _addPlatforms: function() 
  {
    var platformPromises = [];
    var platforms = this._platformsToProcess;
    var context = {generator: this};

    platforms.forEach(function(value) 
    {
      var addCordova = common.gruntSpawnCommandPromise(context, "cordova", 
        ["platform", "add", value, "--save"], "Adding platform : " + value);

      platformPromises.push(addCordova);
    });

    return new Promise(function(resolve, reject)
    {
      Promise.all(platformPromises)
        .then(resolve)
        .catch(function(err)
        {
          reject(err);
        });
    });

  },

  end: function() 
  {
    this.composeWith('oraclejet:restore-hybrid');
  }
});

module.exports = OracleJetHybridCreateGenerator;

//filter the content to perform test on only the platforms that were passed in the invocation; 
//otherwise do on none
function _processPlatformOptions(generator, platforms)
{
  if(!platforms)
  {
    return [];
  }

  var splitted = platforms.split(",");
  var trimmed = splitted.map(function(val)
  {
    return val.trim();
  });

  //now filter the content to only supported ones
  return trimmed.filter(function(val) 
  {
    var supportedValue = constants.SUPPORTED_PLATFORMS.indexOf(val);
    if(supportedValue === -1) 
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
  var appId = appDir.replace(/\W/g, "");   // strip non-word chars
  // make sure the id does not start with a digit or underscore
  if (/^[\d_]+/.test(appId))
  {
    appId = "oj" + appId;
  }
  return ORACLEJET_DOMAIN + appId.toLowerCase();  
}

function _getAppBaseName(appDir)
{
  return path.basename(path.resolve(appDir));  
}

function _writeTemplate(generator)
{
  var self = generator;
  return new Promise(function (resolve, reject) 
  {
    var appDir = self.appDir;

    templateHandler.handleTemplate(self, self.destinationPath(appDir + "/www/"))
      .then(function() 
      {
        resolve(self);
      })
      .catch(function(err)
      {
        reject(err);
      });

  });
}

function _removeExtraCordovaFiles(generator)
{ 
  var appDir = generator.appDir;
  return new Promise(function (resolve, reject)
  {    
    try
    {
      fs.removeSync(path.resolve(appDir,'hooks'));
      fs.removeSync(path.resolve(appDir,'www/*'));
      resolve(generator)
    }
    catch(err)
    {
      return reject(err);
    }
  });
}

function _addCordovaConfigDescriptionAndAuthor(document)
{
  var widget = _getFirstElementByTagName(document, "widget");
  var packageJSON = fs.readJSONSync(path.resolve("package.json"));
  _updateCordovaConfigAuthor(widget, packageJSON);
  _updateCordovaConfigDescription(widget,packageJSON);
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

function _validateTemplate(generator) 
{
  if(_isWebTemplate(generator))
  {
    generator.env.error(new Error("Oraclejet: Template " + generator.options.template + " is invalid for hybrid. Try navBar, navDrawer or url!"));
  }
}

function _isWebTemplate(generator) 
{
  return /^(quickStart)$/.test(generator.options.template);
}
