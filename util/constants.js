/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

//constants to be used for the yeoman generator

module.exports = {
  SUPPORTED_PLATFORMS: ["android", "ios", "windows", "web"],
  SUPPORTED_HYBRID_PLATFORMS: ["android", "ios", "windows"],
  CORDOVA_CONFIG_XML: "config.xml",
  CORDOVA_DIRECTORY: "hybrid",
  DEFAULT_THEME:"alta",

  APP_SRC_DIRECTORY: "src",
  APP_SRC_HYBRID_DIRECTORY: "src-hybrid",
  APP_SRC_WEB_DIRECTORY: "src-web",

  APP_TYPE: 
  {
    "HYBRID": "hybrid",
    "WEB": "web"
  }, 

  SUPPORTED_FLAGS: (namespace) => {
    
    const systemFlags = [
      'env',
      'resolved',
      'namespace',
      'help',
      'argv',
      'skip-cache',
      'skip-install',
      'app-name',
      'app-id'
    ];

    const hybridFlags = [
      'appid',
      'appId',
      'appname',
      'appName',
      'platform',
      'platforms',
    ];

    const appFlags = [
      'template',
      'norestore',
    ];

    const restoreFlags = [
    'invokedByRestore',
    ];

    if (/hybrid/.test(namespace)) {
      //for hybrid and add-hybrid
      return systemFlags.concat(restoreFlags, hybridFlags, appFlags);
    } else if (/app/.test(namespace)) {
      //for app
      return systemFlags.concat(restoreFlags, appFlags);
    } else if (/restore/.test(namespace)){
      //for restore
      return systemFlags.concat(restoreFlags, hybridFlags, appFlags);
    } else {
      //add-theme, add-sass, no supported flag
      return systemFlags.concat(restoreFlags);
    }

  }
};
