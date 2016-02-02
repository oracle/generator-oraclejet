/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

/*
 * Will provide code for figuring out what to inject
 */

var fs = require("fs-extra");
var path = require("path");
var DOMParser = require("xmldom").DOMParser;
var constants = require("./constants");
var platformPaths = require("./platformPaths");
var util = require("./util");
var hookInjector = require("../hooks/injector.js");

module.exports =
{
  injectLiveReloadScript: function(updatePlatformFile)
  {
    // note that this function will be invoked only for non-web case
    // and it's purpose is to inject content from the copied over src/index.html
    var injectSourceContent = _getInjectSourceContent(updatePlatformFile);
    var indexHTML = injectSourceContent.indexHTML;
    var document = injectSourceContent.document;
    
    // per discussion the below cordova injection will be removed in the 
    // future when the cordova.js is added to the quick start templates + 
    // addeventlistener (mock) added in
    _injectLiveReloadScript(injectSourceContent);
    
    fs.writeFileSync(indexHTML, document);    
  },
  
  injectCordovaScript: function(updatePlatformFile)
  {
    var injectSourceContent = _getInjectSourceContent(updatePlatformFile);
    var indexHTML = injectSourceContent.indexHTML;
    var document = injectSourceContent.document;

    var cordovaElement = _createScriptLibraryElement(document, "cordova.js");
  
    if (cordovaElement)
    {
      _inject(injectSourceContent, cordovaElement);
      fs.writeFileSync(indexHTML, document);    
    }
  },
  
  injectPlatformStyleClasses: function()
  {
    var platform = process.env[constants.PLATFORM_ENV_KEY];
    hookInjector.injectPlatformStyleClasses(platform, true);
  }
  
};

function _getInjectSourceContent(updatePlatformFile)
{
  var indexHTML;

  if (updatePlatformFile)
  {
    var platform = process.env[constants.PLATFORM_ENV_KEY];
    var root = platformPaths[platform].ROOT;
    indexHTML = path.resolve(root, "index.html");
  }
  else
  {
    indexHTML = path.resolve(constants.CORDOVA_DIRECTORY + "/www/index.html");
  }
  
  var document = new DOMParser().parseFromString(fs.readFileSync(indexHTML, "utf-8"), "text/html");

  return {indexHTML: indexHTML, document: document};
}

function _injectLiveReloadScript(injectSourceContent)
{
  var document = injectSourceContent.document;
  var liveReloadElement;

  if (_isLiveReloadEnabled())
  {
    liveReloadElement = _createLiveReloadElement(document);
    if (liveReloadElement)
    {
      _inject(injectSourceContent, liveReloadElement);
    }
  }
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
  for (var i = 0, len = scripts.length; i < len; i++)
  {
    if (scripts[i].getAttribute("src") === scriptSrc)
    {
      return true;
    }
  }
  return false;
}

function _appendDummyTextNode(document, scriptElement) 
{
  // need to add a textNode; otherwise added script node is invalid 
  // <script .../> rather than <script ..></script>
  var textNode = document.createTextNode("");
  scriptElement.appendChild(textNode);
}

function _inject(injectSourceContent, scriptElement) 
{
  var document = injectSourceContent.document;
  var body = document.getElementsByTagName("body")[0];
  var textNode;
  
  if (scriptElement)  
  {
    body.appendChild(scriptElement);
    textNode = document.createTextNode("\n    ");
    body.appendChild(textNode);
  }
}

