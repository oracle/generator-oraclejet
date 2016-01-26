/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
#!/usr/local/bin/env node
//code to update config.xml

var constants = require("../common/constants");

var platform = process.env[constants.PLATFORM_ENV_KEY];

if(!platform) 
{
  return;
}

var cordovaConfig = require('./cordovaConfig');
cordovaConfig.updateConfig();