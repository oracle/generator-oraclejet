/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt task for build

var constants = require("../../common/constants");
var util = require("../../common/util");

module.exports = function(grunt) {

  grunt.registerTask('build', function (target) 
  {
    var platform = grunt.option("platform");

    if(!platform) 
    {
      throw new Error("Platform option is required");
    }
    
    target = target || "dev";
    _processBuildConfigs(grunt, platform, target);

    if(target === "dev") 
    {
      grunt.task.run(
      [
        'shell:cordovaPrepare',
        'shell:cordovaCompile'
      ]);
    }
    else if(target === "release")
    {
      grunt.task.run(
      [
        'clean:release',
        'injector:mainReleasePaths',
        'uglify:release',
        'copy:release', 
        'requirejs',
        'clean:mainTemp',
        'shell:cordovaPrepare',
        'shell:cordovaCompile'
      ]);
    }
    else
    {
      grunt.log.error(["Invalid argument, try build:dev or build:release"]);
    }
  
  });

};

function _processBuildConfigs(grunt, platform, target)
{
  //need to pass in various values for grunt tasks

  grunt.config.set('platform', platform);
  grunt.config.set('target', target);
  grunt.config.set('oraclejet.ports.livereload', false);
  grunt.config.set('buildType', util.getCordovaBuildType(target));
  grunt.config.set('buildConfig', util.getCordovaBuildConfig(grunt));

  //update for cordova hooks
  process.env[constants.PLATFORM_ENV_KEY] = platform;
  process.env[constants.TARGET_ENV_KEY] = target;
  process.env[constants.LIVERELOAD_ENABLED_ENV_KEY] = false;
}
