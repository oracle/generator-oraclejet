/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var blankTemplate = require("./blank");
var urlTemplate = require("./url");
var commonTemplate = require("./common");
var npmTemplate = require("./npm");
var commonMessages = require("../messages");

var _HYBRID = "hybrid";
var _WEB = "web";

var BLANK_TEMPLATE = blankTemplate.BLANK_TEMPLATE;

var _TEMPLATES_NPM_URL =  "oraclejet-templates@2.1.0";

var _TEMPLATES = [BLANK_TEMPLATE, 'basic',  'navbar', 'navdrawer'];


module.exports =
{
  handleTemplate: function _handleTemplate(generator, templateDestDirectory) 
  {
    var template = generator.options.template || BLANK_TEMPLATE;

    generator.log("Processing template...", template);
  
    var templateUrl = _toTemplateUrl(template, generator.options.namespace);
    
    try 
    {
      if (templateUrl)
      {
        return commonTemplate.handle(urlTemplate.handle(generator, templateUrl, templateDestDirectory));
      }
    
      var templateSpec = _resolveTemplateSpec(generator, template);
      if (templateSpec['name'] === BLANK_TEMPLATE)
      {
        return commonTemplate.handle(blankTemplate.handle(generator, templateDestDirectory, templateSpec['type']));
      }
      else
      {
        return  npmTemplate.handle(generator, _TEMPLATES_NPM_URL, templateDestDirectory, templateSpec);
      }
    }
    catch (err)
    {
      return Promise.reject(commonMessages.error(err, "processing template"));   }
    }
};

function _isUrl(url) 
{
  return /^https?:\/\/?([\da-z\.-]+)(:\d{2,4})?([\/\w \.-]*)*\/?$/.test(url);
}

function _toTemplateUrl(template) 
{
  if (_isUrl(template))
  {
    return template;
  }
  
  return null;   
}

function _resolveTemplateSpec(generator, template)
{
  var res = template.split(':');

  var templateName = res[0];
  var templateType = (res.length > 1) ? res[1] : _getGeneratorType(generator.options.namespace);
  
  _validateTemplateName(templateName);
  _validateTemplateType(templateType);
   
  return { 'name': templateName, 'type': templateType };
}

function _validateTemplateName(templateName)
{
  if (_TEMPLATES.indexOf(templateName) < 0)
  {
    let templateList = '';
    _TEMPLATES.forEach(function(value)
    {
      templateList += '\n  ' + value;
    });
    let msg = '\nA URL or one of the following names is expected: ' + templateList;
    throw new Error('Invalid template name: ' + templateName + '. ' + msg);
  }
}

function _getGeneratorType(generatorNameSpace) 
{
  return /hybrid/.test(generatorNameSpace) ? _HYBRID : _WEB;
}

function _validateTemplateType(templateType) 
{ 
  if (templateType !== _WEB && templateType !== _HYBRID)
  {
    throw new Error('Invalid template type: ' + templateType);
  }
}

