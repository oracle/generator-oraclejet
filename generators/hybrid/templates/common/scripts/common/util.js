/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

/*
 * Will contain util functions for the Grunt tasks
 */

var fs = require("fs-extra");
var path = require("path");
var DOMParser = require("xmldom").DOMParser;

var LOCAL_IP_ADDRESS = "127.0.0.1";
var ANDROID_LOCAL_IP_ADDRESS = "10.0.2.2";

var DEBUG_BUILD_TYPE = "--debug";
var RELEASE_BUILD_TYPE = "--release";

module.exports =
{
  getLocalIp: function(platform) 
  {
    // get the local IPAddress to be used for emulator
    // for ios one can use 127.0.0.1 to point to the actual machine's ipaddress as expected; 
    // however for android one can not as the interpretation is to the android device itself, 
    // so must use the predefined 10.0.2.2 that has been created by android team
    
    return platform === "android" ? ANDROID_LOCAL_IP_ADDRESS : LOCAL_IP_ADDRESS;
  },

  getAppName: function(configxml) 
  {
    // gets the appName for copyPath
    var document = new DOMParser().parseFromString(fs.readFileSync(configxml, "utf-8"), "text/xml");
    var name = document.getElementsByTagName("name")[0];

    return name && name.firstChild ? name.firstChild.nodeValue : "";
  },

  getCordovaBuildType: function(target)
  {
    return target === "dev" ? DEBUG_BUILD_TYPE : RELEASE_BUILD_TYPE;
  },

  getCordovaBuildConfig: function(grunt)
  {
    var bConfig = grunt.option("buildConfig");

    return bConfig ? "--buildConfig=" + bConfig : "";
  }
};
