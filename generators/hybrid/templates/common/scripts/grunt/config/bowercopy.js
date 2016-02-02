/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt bowercopy task

var versions = require("../common/versions");
var constants = require("../../common/constants");

// To align with Jet demo"s 3rd party library directory structure, this config will copy from its 
// original location in github to specific path with the file name being modified to include the 
// version of the 3rd party.

var cordovaDirectory = constants.CORDOVA_DIRECTORY;
var appSrcDirectory = constants.APP_SRC_DIRECTORY;

module.exports = function(grunt)
{
  return {
    options: 
    {
      runBower: false,
      versions: versions.getVersions(grunt)
    },
    
    oraclejetAndroidCss:
    {
      options:
      {
        srcPrefix: "bower_components/oraclejet/dist/css/",
        destPrefix: cordovaDirectory + "/merges/android/css/libs"
      },
      
      files: 
      {
        "oj/v<%= grunt.config.data.bowercopy.options.versions.jetVersion %>/alta/": "./alta-android/"
      }
    },

    oraclejetIosCss:
    {
      options:
      {
        srcPrefix: "bower_components/oraclejet/dist/css/",
        destPrefix: cordovaDirectory + "/merges/ios/css/libs"
      },
      
      files: 
      {
        "oj/v<%= grunt.config.data.bowercopy.options.versions.jetVersion %>/alta/": "./alta-ios/"
      }
    },

    oraclejetWindowsCss:
    {
      options:
      {
        srcPrefix: "bower_components/oraclejet/dist/css/",
        destPrefix: cordovaDirectory + "/merges/windows/css/libs"
      },
      
      files: 
      {
        "oj/v<%= grunt.config.data.bowercopy.options.versions.jetVersion %>/alta/": "./alta-windows/"
      }
    },

    oraclejetCss:
    {
      options:
      {
        srcPrefix: "bower_components/oraclejet/dist/css/",
        destPrefix: appSrcDirectory + "/css/libs"
      },

      src: "./!(alta-android|alta-ios|alta-windows|alta)/"
    },

    oraclejetJs:
    {
      options:
      {
        srcPrefix: "bower_components",
        destPrefix: appSrcDirectory + "/js/libs"
      },

      files:
      {
        "oj/v<%= grunt.config.data.bowercopy.options.versions.jetVersion %>": "oraclejet/dist/js/libs/oj/",
        "dnd-polyfill": "oraclejet/dist/js/libs/dnd-polyfill/"
      }
    },

    // place in the same directory as jet's demo app
    thirdParty:
    {
      options:
      {
        srcPrefix: "bower_components",
        destPrefix: appSrcDirectory + "/js/libs"
      },
      files:
      {
        "es6-promise/promise-<%= grunt.config.data.bowercopy.options.versions.es6PromiseVersion %>.js": "es6-promise/promise.js",
        "es6-promise/promise-<%= grunt.config.data.bowercopy.options.versions.es6PromiseVersion %>.min.js": "es6-promise/promise.min.js",
        "hammer/hammer-<%= grunt.config.data.bowercopy.options.versions.hammerVersion %>.js": "hammerjs/hammer.js",
        "hammer/hammer-<%= grunt.config.data.bowercopy.options.versions.hammerVersion %>.min.js": "hammerjs/hammer.min.js",
        "jquery/jquery-<%= grunt.config.data.bowercopy.options.versions.jqueryVersion %>.js": "jquery/dist/jquery.js",
        "jquery/jquery-<%= grunt.config.data.bowercopy.options.versions.jqueryVersion %>.min.js": "jquery/dist/jquery.min.js",
        "js-signals": "js-signals/dist",
        "knockout/knockout-<%= grunt.config.data.bowercopy.options.versions.knockoutVersion %>.debug.js": "knockout/dist/knockout.debug.js",
        "knockout/knockout-<%= grunt.config.data.bowercopy.options.versions.knockoutVersion %>.js": "knockout/dist/knockout.js",
        "require/require.js": "requirejs/require.js",
        "require": "text",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/core.js":"jquery-ui/ui/minified/core.min.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/draggable.js":"jquery-ui/ui/minified/draggable.min.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/mouse.js":"jquery-ui/ui/minified/mouse.min.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/position.js":"jquery-ui/ui/minified/position.min.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/sortable.js":"jquery-ui/ui/minified/sortable.min.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/widget.js":"jquery-ui/ui/minified/widget.min.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>":"jquery-ui/ui/+(core|draggable|mouse|position|sortable|widget).js"
      }
    }
  }
};
