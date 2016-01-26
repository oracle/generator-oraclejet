/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var blankTemplate = require("./blank");
var urlTemplate = require("./url");
var commonTemplate = require("./common");

module.exports = {

  handleTemplate: function _handleTemplate(generator, templateDestDirectory) 
  {
    //templateDestDirectory will be www or appDirectory for hybrid and web respectively
    var BLANK_TEMPLATE = blankTemplate.BLANK_TEMPLATE;
    var URL_TEMPLATE = urlTemplate.URL_TEMPLATE;
    var template = generator.options.template || BLANK_TEMPLATE;
    
    if(URL_TEMPLATE.hasOwnProperty(template)) 
    {
      //use the predefined url
      template = URL_TEMPLATE[template];
    }

    generator.log("Processing template...", template);
    
    if(template === BLANK_TEMPLATE) 
    {
      return commonTemplate.handle(blankTemplate.handle(generator, templateDestDirectory));
    }
    else if(_isUrl(template)) 
    {
      //is of url
      return commonTemplate.handle(urlTemplate.handle(generator, template, templateDestDirectory));
    }
    else 
    {
      return Promise.reject(new Error("Error: Invalid template name or URL: " + template));
    }
    
  }

};

function _isUrl(url) 
{
  return /^https?:\/\/?([\da-z\.-]+)(:\d{2,4})?([\/\w \.-]*)*\/?$/.test(url);
}
