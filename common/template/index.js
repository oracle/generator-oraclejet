/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var blankTemplate = require("./blank");
var urlTemplate = require("./url");
var commonTemplate = require("./common");
var npmTemplate = require("./npm");
var localTemplate = require("./local");
var commonMessages = require("../messages");
var path = require("path");
var util = require("../../util");
var _HYBRID = "hybrid";
var _WEB = "web";

var BLANK_TEMPLATE = blankTemplate.BLANK_TEMPLATE;

var _TEMPLATES_NPM_URL = "oraclejet-templates@~2.3.0";

var _TEMPLATES = [BLANK_TEMPLATE, 'basic',  'navbar', 'navdrawer'];


module.exports =
{
  handleTemplate: function _handleTemplate(generator, templateDestDirectory) 
  {
    var template = generator.options.template || BLANK_TEMPLATE;
    generator.log("Processing template...", template);
    const templateHandler = _getHandler(generator, template, templateDestDirectory);
    try {
     return commonTemplate.handle(templateHandler);
    } catch (err) {
      return Promise.reject(commonMessages.error(err, "processing template"));  
    }
  }
};

function _getHandler(generator, template, templateDestDirectory) {
  const templateUrl = _toTemplateUrl(template, generator.options.namespace);
  const templateLocalPath = _getLocalFileAbsolutePath(generator, template);
  
  if (templateUrl) {
    return urlTemplate.handle(generator, templateUrl, templateDestDirectory);
  }

  if (templateLocalPath) {
    return localTemplate.handle(generator, templateLocalPath, templateDestDirectory);
  } else {
    const templateSpec = _resolveTemplateSpec(generator, template);
    if (templateSpec['name'] === BLANK_TEMPLATE) {
      return blankTemplate.handle(generator, templateDestDirectory, templateSpec['type']);
    } 
    return npmTemplate.handle(generator, _TEMPLATES_NPM_URL, templateDestDirectory, templateSpec);
  }
}

function _isUrl(url) 
{
  return /^https?:\/\/[^\s\/$.?#].[^\s]*$/i.test(url);
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

function _getLocalFileAbsolutePath(generator, templatePath) {
  var absolutePath = path.isAbsolute(templatePath) ? templatePath 
                      : path.resolve(process.cwd(), templatePath);
  return util.fsExistsSync(absolutePath) ? absolutePath : null;
}