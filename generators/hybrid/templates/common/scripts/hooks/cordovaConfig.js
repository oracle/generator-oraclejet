/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

/*
 * Will contain functions to be invoked in the Gruntfile.js
 */

var fs = require('fs-extra');
var path = require("path");
var DOMParser = require('xmldom').DOMParser;

var util = require('../common/util');
var constants = require('../common/constants');

module.exports = {

  updateConfig: function() 
  {
    var configxml = path.resolve("config.xml");
    var document = new DOMParser().parseFromString(fs.readFileSync(configxml, "utf-8"), 'text/xml');
    
    _processConfigSrcAttribute(document);
    _appendLoadUrlTimeoutPreference(document.getElementsByTagName("preference"), document);
    
    fs.writeFileSync(configxml, document);
  }

};

function _processConfigSrcAttribute(document) 
{
  //need to update the config src for livereloading
  var platform = process.env[constants.PLATFORM_ENV_KEY];
  var liveReloadEnabled = process.env[constants.LIVERELOAD_ENABLED_ENV_KEY];
  var serverPort = process.env[constants.SERVER_PORT_ENV_KEY];
  
  var content = document.getElementsByTagName("content")[0];
  var origSrc = content.getAttribute("original-src");

  if(liveReloadEnabled !== "false") 
  {
    if(!origSrc) 
    {
      //place the original src value so can be reverted back during build
      content.setAttribute("original-src", content.getAttribute("src"));
    }

    //due to how emulator/devices work; localhost does not point to your laptop and etc but its internal one, need to use ip address
    content.setAttribute("src", "http://" + util.getLocalIp(platform) + ":" + serverPort + "/" + platform + "/www/index.html");
  }
  else 
  {
    if(origSrc) 
    {
      //replace the src to original value for apk, ios
      content.setAttribute("src", origSrc);
      content.removeAttribute("original-src");
    }
  }

}

function _appendLoadUrlTimeoutPreference(preferences, document) 
{
  var loadUrlTimeoutValuePref;

  if(preferences) 
  {
    //search for the preference
    for(var i=0, j=preferences.length; i < j; i++) 
    {
      var curr = preferences.item(i);

      if(curr.getAttribute("name") === constants.LOAD_URL_TIMEOUT_PREFERENCE) 
      {
        loadUrlTimeoutValuePref = curr;
        break;
      }
    }
  }

  //need to update loadUrlTimeoutValue; otherwise fails for our app esp emulator
  if(!loadUrlTimeoutValuePref) 
  {
    //need to add in a default one

    var pref = document.createElement("preference");
    pref.setAttribute("name", constants.LOAD_URL_TIMEOUT_PREFERENCE);
    pref.setAttribute("value", "" + constants.LOAD_URL_TIMEOUT_VALUE);

    document.getElementsByTagName("widget")[0].appendChild(pref);
  }

}