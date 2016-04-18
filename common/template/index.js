/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var blankTemplate = require("./blank");
var urlTemplate = require("./url");
var commonTemplate = require("./common");
var commonMessages = require("../messages");
var _HYBRID = "hybrid";
var _WEB = "web";
var _BOTH = "both";

var BLANK_TEMPLATE = blankTemplate.BLANK_TEMPLATE;
var _TEMPLATE_URL_ROOT = "https://github.com/oracle/oraclejet/releases/download/2.0.1/";

var _TEMPLATES =
{
  "navBar":
  {
    url: _TEMPLATE_URL_ROOT + "OracleJET_QuickStartHybridNavBar.zip",
    targetType: _HYBRID
  },
  "navDrawer":
  {
    url: _TEMPLATE_URL_ROOT + "OracleJET_QuickStartHybridNavDrawer.zip",
    targetType: _HYBRID
  },
  "basic":
  {
    url: _TEMPLATE_URL_ROOT + "OracleJET_QuickStartBasic.zip",
    targetType: _WEB
  }
};

_TEMPLATES[BLANK_TEMPLATE] =
{
  url: null,
  targetType: _BOTH
}

module.exports =
{
  handleTemplate: function _handleTemplate(generator, templateDestDirectory) 
  {
    // templateDestDirectory will be src or appDirectory for hybrid and web respectively
    var template = generator.options.template || BLANK_TEMPLATE;
    
    generator.log("Processing template...", template);
  
    var templateUrl = _toTemplateUrl(template, generator.options.namespace);    
    
    if(templateUrl) 
    {
      return commonTemplate.handle(urlTemplate.handle(generator, templateUrl, templateDestDirectory));
    }
    
    if(template === BLANK_TEMPLATE) 
    {
      return commonTemplate.handle(blankTemplate.handle(generator, templateDestDirectory));
    }

    var error = _getTemplateError(template, generator.options.namespace); 
    return Promise.reject(commonMessages.error(error , "processing template"));
  }
};

function _isUrl(url) 
{
  return /^https?:\/\/?([\da-z\.-]+)(:\d{2,4})?([\/\w \.-]*)*\/?$/.test(url);
}

function _toTemplateUrl(template, generatorNameSpace) 
{
  if (_isUrl(template))
  {
    return template;
  }

  if (_TEMPLATES.hasOwnProperty(template) && _isValidTargetType(template, _getGeneratorType(generatorNameSpace))) 
  {     
    // use the predefined url if the targetType matches
    return _TEMPLATES[template].url;
  }
  
  return null;   
}

function _getGeneratorType(generatorNameSpace) 
{
  return /hybrid/.test(generatorNameSpace) ? _HYBRID : _WEB;
}

function _isValidTargetType(template, generatorType) 
{ 
  var templateType = _TEMPLATES[template].targetType;
  return (templateType == generatorType) || (templateType == _BOTH);
}

function _getTemplateError(template, generatorNameSpace) 
{
  var generatorType = _getGeneratorType(generatorNameSpace);
  var validTemplateNames = ". \nTry valid " + generatorType + " templates: " + _getTemplateNames (generatorType);
  var errorMessage = "Error: Invalid template name or URL for ";
  return new Error(errorMessage + generatorType + ": " + template + validTemplateNames);
}

function _getTemplateNames(generatorType)
{
  var templateNames = [];

  for (var key in _TEMPLATES)
  {
    if (_isValidTargetType(key, generatorType))
      templateNames += '"' + key + '" or '; 
  }

  return templateNames.slice(0,-4) + ".";
}
