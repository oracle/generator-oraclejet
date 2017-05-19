/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const blankTemplate = require('./blank');
const urlTemplate = require('./url');
const commonTemplate = require('./common');
const npmTemplate = require('./npm');
const localTemplate = require('./local');
const commonMessages = require('../messages');
const path = require('path');
const util = require('../../util');

const _HYBRID = 'hybrid';
const _WEB = 'web';

const BLANK_TEMPLATE = blankTemplate.BLANK_TEMPLATE;

const _TEMPLATES_NPM_URL = 'oraclejet-templates@~3.1.0';

const _TEMPLATES = [BLANK_TEMPLATE, 'basic', 'navbar', 'navdrawer'];


module.exports =
{
  handleTemplate: function _handleTemplate(generator, templateDestDirectory) {
    const template = generator.options.template || BLANK_TEMPLATE;
    generator.log('Processing template...', template);
    const templateHandler = _getHandler(generator, template, templateDestDirectory);
    try {
      return commonTemplate.handle(templateHandler);
    } catch (err) {
      return Promise.reject(commonMessages.error(err, 'processing template'));
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
  }
  const templateSpec = _resolveTemplateSpec(generator, template);
  if (templateSpec.name === BLANK_TEMPLATE) {
    return blankTemplate.handle(generator, templateDestDirectory, templateSpec.type);
  }
  return npmTemplate.handle(generator, _TEMPLATES_NPM_URL, templateDestDirectory, templateSpec);
}

function _isUrl(url) {
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url);
}

function _toTemplateUrl(template) {
  if (_isUrl(template)) {
    return template;
  }

  return null;
}

function _resolveTemplateSpec(generator, template) {
  const res = template.split(':');

  const templateName = res[0];
  const templateType = (res.length > 1) ? res[1] : _getGeneratorType(generator.options.namespace);

  _validateTemplateName(templateName);
  _validateTemplateType(templateType);

  return { name: templateName, type: templateType };
}

function _validateTemplateName(templateName) {
  if (_TEMPLATES.indexOf(templateName) < 0) {
    let templateList = '';
    _TEMPLATES.forEach((value) => {
      templateList += `\n  ${value}`;
    });
    const msg = `\nA URL or one of the following names is expected: ${templateList}`;
    throw new Error(`Invalid template name: ${templateName}. ${msg}`);
  }
}

function _getGeneratorType(generatorNameSpace) {
  return /hybrid/.test(generatorNameSpace) ? _HYBRID : _WEB;
}

function _validateTemplateType(templateType) {
  if (templateType !== _WEB && templateType !== _HYBRID) {
    throw new Error(`Invalid template type: ${templateType}`);
  }
}

function _getLocalFileAbsolutePath(generator, templatePath) {
  const absolutePath = path.isAbsolute(templatePath) ? templatePath
                      : path.resolve(process.cwd(), templatePath);
  return util.fsExistsSync(absolutePath) ? absolutePath : null;
}
