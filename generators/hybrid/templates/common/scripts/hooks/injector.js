/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

/*
 * Will provide code for figuring out what to inject
 */

var fs = require("fs");
var path = require("path");

var LOCAL_IP_ADDRESS = "127.0.0.1";
var ANDROID_LOCAL_IP_ADDRESS = "10.0.2.2";
var LOAD_URL_TIMEOUT_VALUE = "loadUrlTimeoutValue";

var injector =
{
  updateIndexHtml: function(platform, external)
  {
    var indexHtmlPath = _getIndexHtmlPath(platform, external);
    var content;

    if (!indexHtmlPath)
    {
      return;
    }
      
    try
    {
      content = fs.readFileSync(indexHtmlPath, "utf-8");
      content = _addPlatformStyleClasses(content, platform);
      if (_isLiveReloadEnabled())
      {
        content = _updateCspForLiveReload(content, platform);
        content = _addLiveReloadElement(content, platform);
      }
      fs.writeFileSync(indexHtmlPath, content);
    }
    catch (e)
    {
    }
  },

  updateConfigXml: function(platform) 
  {
    if (!process || !process.env || !process.env["PLATFORM"])
    {
      return;
    }
    var document;
    var configXml = _getConfigXmlPath(platform);
    if (!configXml)
    {
      return;
    }
    
    try
    {
      document = fs.readFileSync(configXml, "utf-8");
      if (_isLiveReloadEnabled())
      {
        document = _processConfigSrcAttribute(document);
        document = _addNavigationPermission(document);        
      }
      document = _addLoadUrlTimeoutPreference(document);
      fs.writeFileSync(configXml, document);
    }
    catch (e)
    {
      return;
    }
  },
  
  injectCspRule: function(content, cspRule)
  {
    var newContent = content;
    var newCspTag;
    var scriptSrc;
    var newScriptSrc;
    var cspTag = _getXmlTagWithAttrValue(content, "meta", "http-equiv", "Content-Security-Policy");

    if (!cspTag)
    {
      // CSP meta tag not found, do nothing
      return content;
    }
    var contentAttrValue = _getXmlAttrValue(cspTag, "content");
    if (!contentAttrValue)
    {
      // no content attribute, do nothing
      return content;
    }
    var pattern = new RegExp('script-src([^;]*)', 'gi');
    var result = pattern.exec(contentAttrValue);
    if (result)
    {
      scriptSrc = result[0];
      newScriptSrc = scriptSrc + " " + cspRule;
      contentAttrValue = contentAttrValue.replace(scriptSrc, newScriptSrc);
    }
    else
    {
      newScriptSrc = "; script-src " + cspRule;
      contentAttrValue += newScriptSrc;
    }
    newCspTag = _setXmlAttrValue(cspTag, "content", contentAttrValue);
    newContent = content.replace(cspTag, newCspTag);

    return newContent;
  }  
  
};

module.exports = injector;

function _getIndexHtmlPath(platform, external)
{
  var indexHtmlPath;
  var root;
  var prefix = external ? "hybrid/" : "";
    
  if (platform === "android")
  {
    root = prefix + "platforms/android/assets/www/";
  }
  else if (platform === "ios")
  {
    root = prefix + "platforms/ios/www/";
  }
  else {
    return null;
  }
  
  if (root)
  {
    indexHtmlPath = path.resolve(root, "index.html");
  }
  
  return indexHtmlPath;  
}

function _addPlatformStyleClasses(content, platform)
{
  var bodyTag;
  var classAttrValue;
  var newBodyTag;
  var newClassAttrValue;
  var newContent = content;
  
  var classStr = " oj-platform-cordova";
  if (platform === "android")
  {
    classStr += " oj-platform-android";
  }
  else if (platform === "ios")
  {
    classStr += " oj-platform-ios";
  }
                        
  bodyTag = _getXmlTag(content, "body"); 
  if (bodyTag)
  {
    classAttrValue = _getXmlAttrValue(bodyTag, "class");
    if (classAttrValue)
    {
      newClassAttrValue = classAttrValue + classStr;
    }
    else
    {
      newClassAttrValue = classStr;
    }
    newBodyTag = _setXmlAttrValue(bodyTag, "class", newClassAttrValue);
    newContent = content.replace(bodyTag, newBodyTag);
  }  
  return newContent;
}

function _addLiveReloadElement(content, platform)
{
  var newContent = content;
  var liveReloadPort = process.env["LIVERELOAD_PORT"];  
  var liveReloadSrc = "http://" + _getLocalIpAddress(platform) + ":" + liveReloadPort + "/livereload.js";
  var scriptTag = '<script type="text/javascript" src="' + liveReloadSrc + '"></script>';

  newContent = content.replace("</body>", "  " + scriptTag + "\n  </body>");
  return newContent;
}

function _updateCspForLiveReload(content, platform)
{
  var newContent = content;
  var liveReloadPort = process.env["LIVERELOAD_PORT"];  
  var liveReloadSrc = "http://" + _getLocalIpAddress(platform) + ":" + liveReloadPort;

  newContent = injector.injectCspRule(content, liveReloadSrc);

  return newContent;
}

function _getConfigXmlPath(platform)
{
  var configXmlPath;

  if (platform === "android")
  {
    configXmlPath = "platforms/android/res/xml";
  }
  else if (platform === "ios")
  {
    configXmlPath = "platforms/ios/" + _getAppName();
  }
  else
  {
    return null;
  }

  return path.resolve(configXmlPath, "config.xml");
}

function _getAppName()
{
  var configXml = path.resolve("config.xml");
  var document = fs.readFileSync(configXml, "utf-8");
  var name = _getXmlNodeText(document, "name");

  return name;  
}


function _processConfigSrcAttribute(document) 
{
  var newDocument = document;

  // need to update the config src for livereloading
  var platform = process.env["PLATFORM"];
  var serverPort = process.env["SERVER_PORT"];
  
  // due to how emulator/devices work; localhost does not point to your
  // laptop and etc but its internal one, need to use ip address
  var newSrcValue = "http://" + _getLocalIpAddress(platform) + ":" + serverPort + "/" + platform + "/www/index.html";
  var contentTag = _getXmlTag(document, "content");
  var newContentTag = _setXmlAttrValue(contentTag, "src", newSrcValue);

  newDocument = document.replace(contentTag, newContentTag);
  return newDocument;
}

function _addLoadUrlTimeoutPreference(document) 
{
  var newDocument = document;
  var newPreferenceTag;
  var contentTag;
  var preferenceTag = _getXmlTagWithAttrValue(document, "preference", "name", LOAD_URL_TIMEOUT_VALUE);
  
  if (preferenceTag)
  {
    newPreferenceTag = _setXmlAttrValue(preferenceTag, "value", "240000");
    newDocument = document.replace(preferenceTag, newPreferenceTag);
  }
  else
  {
    // loadUrlTimeoutValue preference tag does not exist yet, 
    // append it after the content tag
    contentTag = _getXmlTag(document, "content");
    if (contentTag)
    {
      newPreferenceTag = contentTag + '\n    <preference name="' + LOAD_URL_TIMEOUT_VALUE + '" value="240000" />';
      newDocument = document.replace(contentTag, newPreferenceTag);
    }
  }

  return newDocument;    
}

function _addNavigationPermission(document)
{
  // need to update the config src for livereloading
  var newDocument = document;
  var platform = process.env["PLATFORM"];
  var contentTag = _getXmlTag(document, "content");
  
  if (contentTag)
  {
    var newAllowTag = contentTag + '\n    <allow-navigation href="http://' + _getLocalIpAddress(platform) + '/*" />';
    newDocument = document.replace(contentTag, newAllowTag);
  }

  return newDocument;
}

function _isLiveReloadEnabled()
{
  var liveReloadEnabled = process.env["LIVERELOAD_ENABLED"];
  return (liveReloadEnabled !== "false"); 
}

function _getLocalIpAddress(platform)
{
  return (platform === "android") ? ANDROID_LOCAL_IP_ADDRESS : LOCAL_IP_ADDRESS;
}

function _getXmlTag(content, tagName)
{
  var tag;
  var pattern = new RegExp('<' + tagName + '([\\s\\S]*?)>', 'gi');
  var result = pattern.exec(content);
  if (result)
  {
    tag = result[0];
  }

  return tag;
}

function _getXmlAttrValue(tag, attr)
{
  var attrValue;
  var pattern = new RegExp(attr + '=["](.*?)["]', 'gi');
  var result = pattern.exec(tag);
  if (result && result[1])
  {
    attrValue = result[1];
  }

  return attrValue;
}

function _setXmlAttrValue(tag, attr, value)
{
  var newTag;
  var newAttr;
  var pattern = new RegExp(attr + '=["](.*?)["]', 'gi');
  var result = pattern.exec(tag);
  if (result)
  {
    newAttr = result[0].replace(result[1], value);
    newTag = tag.replace(result[0], newAttr);
  }
  else
  {
    // add new attribute at the end, assume tag ends with '>'
    newTag = tag.substr(0, tag.length - 1) + attr + '"' + value + '">';
  }

  return newTag;
}

function _getXmlNodeText(content, tag)
{
  var text;
  var pattern = new RegExp('<' + tag + '([\\s\\S]*?)>(.*?)<\\/' + tag + '>', 'gi');
  var result = pattern.exec(content);
  if (result)
  {
    text = result[2];   
  }

  return text;    
}

function _getXmlTagWithAttrValue(content, tagName, attr, value)
{
  var tag;
  var attrValue;
  var result;
  var pattern = new RegExp('<' + tagName + '([\\s\\S]*?)>', 'gi');
  
  do
  {
    result = pattern.exec(content);
    if (result)
    {
      tag = result[0];
      attrValue = _getXmlAttrValue(tag, attr);
      if (attrValue && attrValue == value)
      {
        return tag;
      }
    }
  } while (result);

  return null;
}

