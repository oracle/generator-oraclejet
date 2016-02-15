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
  injectCordovaScript: function(updatePlatformFile, platform)
  {
    var injectSourceContent = _getInjectSourceContent(updatePlatformFile, platform);
    var indexHTML = injectSourceContent.indexHTML;
    var document = injectSourceContent.document;

    var cordovaElement = _createScriptLibraryElement(document, "cordova.js");
  
    if (cordovaElement)
    {
      _inject(injectSourceContent, cordovaElement);
      fs.writeFileSync(indexHTML, document);    
    }
  },
  
  updateIndexHtml: function(platform)
  {
    hookInjector.updateIndexHtml(platform, true);
  }
  
};

function _getInjectSourceContent(updatePlatformFile, platform)
{
  var indexHTML;

  if (updatePlatformFile)
  {
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

