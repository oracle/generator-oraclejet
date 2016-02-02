/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt task for build

var constants = require("../../common/constants");
var util = require("../../common/util");
var injector = require("../../common/injector");

module.exports = function(grunt) {

  grunt.registerTask('build', function(target) 
  {
    var platform = grunt.option("platform");

    if (!platform) 
    {
      throw new Error("Platform option is required");
    }

    if (_checkDirectoryStructure(grunt))
    {
      return grunt.log.error(["Invalid directory structure containing ROOT/www, please migrate to new structure"]);
    }
    
    target = target || "dev";
    _processBuildConfigs(grunt, platform, target);

    var tasks =
    [
      "clean:www",
      "copy:www" + (target === "dev" ? "Dev" : "Release"),
      "copy:merges",
      "includeCordovaJs"
    ];

    if (target === "dev") 
    {
      tasks = tasks.concat(
      [
        "shell:cordovaPrepare",
        "shell:cordovaCompile"
      ]);
    }
    else if (target === "release")
    {
      tasks = tasks.concat(
      [
        "injector:mainReleasePaths",
        "uglify:release",
        "requirejs",
        "clean:mainTemp",
        "shell:cordovaPrepare",
        "shell:cordovaCompile"
      ]);
    }
    else
    {
      return grunt.log.error(["Invalid argument, try build:dev or build:release"]);
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask("includeCordovaJs", function(target) 
  {
    injector.injectCordovaScript();
  });
};

function _processBuildConfigs(grunt, platform, target)
{
  // need to pass in various values for grunt tasks

  grunt.config.set("platform", platform);
  grunt.config.set("target", target);
  grunt.config.set("oraclejet.ports.livereload", false);
  grunt.config.set("buildType", util.getCordovaBuildType(target));
  grunt.config.set("buildConfig", util.getCordovaBuildConfig(grunt));

  process.env[constants.PLATFORM_ENV_KEY] = platform;
  process.env[constants.TARGET_ENV_KEY] = target;
  process.env[constants.LIVERELOAD_ENABLED_ENV_KEY] = false;
}

function _checkDirectoryStructure(grunt) 
{
  return grunt.file.exists("www");
}
