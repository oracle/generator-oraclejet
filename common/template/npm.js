/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
module.exports = {

  handle: function _handle(yoGenerator, npmUrl, destination, templateSpec) 
  {

    return new Promise(function(resolve, reject) 
    {
      _installNpmTemplate(yoGenerator, npmUrl)
        .then(function()
        {
          _copyNpmTemplate(yoGenerator, templateSpec, destination);
          return resolve(yoGenerator);
        })
        .catch(function(err) 
        {
          return reject(err);
        });

    });
  }
};

/**
 * ## _copyNpmTemplate
 * Copies template files.
 * 
 * The templates are found in the installed oraclejet-templates module.
 * The source template directory is determined as follows:
 * 1. check if the templateName/type directory exists in oraclejet-templates
 *    e.g. 'navbar/hybrid'.
 * 2. if not, use the content of the templateName directory (only common content
 *    exists for both 'web' and 'hybrid' templates).
 * 
 * @param {Object} yoGenerator  - parent generator
 * @param {Object} templateSpec - template specification
 * @param {string} destination  - destination path
 */
function _copyNpmTemplate(yoGenerator, templateSpec, destination)
{
  const templateRoot = path.join(yoGenerator.destinationPath(yoGenerator.appDir),
                           'node_modules', 'oraclejet-templates');
  const src = _getTemplateFromTypeSpecificDirectory(templateRoot, templateSpec) ||
              _getTemplateFromGenericDirectory(templateRoot, templateSpec);

  if (!src)
  {
    const msg = templateSpec['name'] + ':' + templateSpec['type'];
    throw new Error("Could not find source for template: " + msg);
  }
  
  fs.copySync(src, destination);
}

function _getTemplateFromTypeSpecificDirectory(templateRoot, templateSpec)
{
  let src = path.join(templateRoot, templateSpec['name'], templateSpec['type']);
  if (!_checkDirExists(src))
  {
    return null;
  }
  return src;  
}

function _getTemplateFromGenericDirectory(templateRoot, templateSpec)
{
  let src = path.join(templateRoot, templateSpec['name']);
  if (!_checkDirExists(src))
  {
    return null;
  }
  return src;  
}

function _checkDirExists(path)
{
  try
  {
    // check if the directory exists
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
      return true;
    }
  }
  catch (err)
  {
    return false;
  }
  return false;
}

function _installNpmTemplate(yoGenerator, npmUrl)
{
  return new Promise(function(resolve, reject){
      var cmd = 'npm install ' + npmUrl;
      var appDir = yoGenerator.destinationPath(yoGenerator.appDir);
      fs.ensureDirSync(path.join(appDir, 'node_modules'));
      exec(cmd, {cwd: appDir}, function(err){
        if(err) return reject(err);
        return resolve();
      });
  });
}