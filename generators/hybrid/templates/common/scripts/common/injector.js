/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

/*
 * Will provide code for figuring out what to inject
 */

var fs = require('fs-extra');
var path = require("path");
var DOMParser = require('xmldom').DOMParser;

var constants = require('./constants');
var platformPaths = require("./platformPaths");
var util = require('./util');

module.exports = {

  injectCordovaFeatures: function()
  {
    var injectSourceContent = _getInjectSourceContent();
    var indexHTML = injectSourceContent.indexHTML;
    var document = injectSourceContent.document;
    
    _injectCordovaScript(injectSourceContent);
    _injectLiveReloadScript(injectSourceContent);
    _injectPlatformStyleClasses(injectSourceContent);
    
    fs.writeFileSync(indexHTML, document);    
  }
};

function _getInjectSourceContent()
{
  var platform = process.env[constants.PLATFORM_ENV_KEY];
  var root = platformPaths[platform].ROOT;
  var indexHTML = path.resolve(root, "index.html");
  var document = new DOMParser().parseFromString(fs.readFileSync(indexHTML, "utf-8"), 'text/html');

  return {indexHTML: indexHTML, document: document};
}

function _injectCordovaScript(injectSourceContent)
{
  var document = injectSourceContent.document;
  var cordovaElement = _createScriptLibraryElement(document, "cordova.js");
  
  if(cordovaElement)
  {
    _inject(injectSourceContent, cordovaElement);
  }
}

function _injectLiveReloadScript(injectSourceContent)
{
  var document = injectSourceContent.document;
  var liveReloadElement;

  if(_isLiveReloadEnabled())
  {
    liveReloadElement = _createLiveReloadElement(document);
    if(liveReloadElement)
    {
      _inject(injectSourceContent, liveReloadElement);
    }
  }
}

function _injectPlatformStyleClasses(injectSourceContent)
{
  var platform = process.env[constants.PLATFORM_ENV_KEY];

  var classes = ["oj-platform-cordova"];
  if (platform === "android")
  {
    classes.push("oj-platform-android");
  }
  else if (platform === "ios")
  {
    classes.push("oj-platform-ios");
  }
  _attachClassesToBody(injectSourceContent, classes);
}  

function _isLiveReloadEnabled() 
{
  return process.env[constants.LIVERELOAD_ENABLED_ENV_KEY] !== "false";
}

function _createLiveReloadElement(document)
{
  var liveReloadPort = process.env[constants.LIVERELOAD_PORT_ENV_KEY];
  var platform = process.env[constants.PLATFORM_ENV_KEY];
  
  var liveReloadSrc = "http://" + util.getLocalIp(platform) + ":" + liveReloadPort + "/livereload.js";

  return _createScriptLibraryElement(document, liveReloadSrc);
}

function _createScriptLibraryElement(document, src)
{
  if (_scriptSrcExists(document, src))
  {
    return null;
  }

  var scriptElement = document.createElement("script");
  scriptElement.setAttribute("src", src);
  _appendDummyTextNode(document, scriptElement);
  
  return scriptElement;
}

function _scriptSrcExists(document, scriptSrc)
{
  var scripts = document.getElementsByTagName("script");
  for(var i = 0, len = scripts.length; i < len; i++)
  {
    if(scripts[i].getAttribute("src") === scriptSrc)
    {
      return true;
    }
  }
  return false;
}

function _appendDummyTextNode(document, scriptElement) 
{
  //need to add a textNode; otherwise added script node is invalid 
  //<script .../> rather than <script ..></script>
  var textNode = document.createTextNode("");
  scriptElement.appendChild(textNode);
}

function _inject(injectSourceContent, scriptElement) 
{
  var document = injectSourceContent.document;
  var html = document.getElementsByTagName("html")[0];

  if (scriptElement)  
  {
    html.appendChild(scriptElement);
  }
}

function _attachClassesToBody(injectSourceContent, classes)
{
  var document = injectSourceContent.document;
  var body = document.getElementsByTagName("body")[0];

  var classAttr = body.getAttribute("class");

  classes = classes || [];

  classes.forEach(function(cls)
  {
    if (cls)
    {
      classAttr += " " + cls;
    }
  });

  body.setAttribute("class", classAttr);
}



