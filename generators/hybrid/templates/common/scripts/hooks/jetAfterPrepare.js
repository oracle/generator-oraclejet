/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
#!/usr/local/bin/env node
//code to process afterPrepare
//ideally one would like to separate out injection of cordova + livereload by serve, emulate, and etc;
//however literally almost everything in cordova copies over the whole content, so need to be placed here

var constants = require("../common/constants");

var platform = process.env[constants.PLATFORM_ENV_KEY];
var target = process.env[constants.TARGET_ENV_KEY];

if(!platform || !target) 
{
  return;
}

var updatePlatformDirectories = require('./updatePlatformDirectories');
updatePlatformDirectories.update(platform, target);

var injector = require('../common/injector');
injector.injectCordovaFeatures();
