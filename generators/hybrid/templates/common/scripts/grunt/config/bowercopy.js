/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
// grunt bowercopy task

var versions = require("../common/versions");

// To align with Jet demo"s 3rd party library directory structure, this config will copy from its 
// original location in github to specific path with the file name being modified to include the 
// version of the 3rd party.

module.exports = function(grunt)
{
  return {
    options: 
    {
      runBower: false,
      versions: versions.getVersions(grunt)
    },

    oraclejetWebTheme: 
    {
      options:
      {
        srcPrefix: 'bower_components/oraclejet/dist/css/alta',
        destPrefix: 'themes/alta/web',
      },
      files: {
        'alta.css': 'oj-alta.css',
        'alta.min.css': 'oj-alta-min.css',
        'fonts': 'fonts',
        'images': 'images'
      }
    },

    oraclejetWindowsTheme: 
    {
      options:
      {
        srcPrefix: 'bower_components/oraclejet/dist/css/alta-windows',
        destPrefix: 'themes/alta/windows',
      },
      files: {
        'alta.css': 'oj-alta.css',
        'alta.min.css': 'oj-alta-min.css',
        'fonts': 'fonts',
        'images': 'images'
      }
    },

    oraclejetAndroidTheme: 
    {
      options:
      {
        srcPrefix: 'bower_components/oraclejet/dist/css/alta-android',
        destPrefix: 'themes/alta/android',
      },
      files: {
        'alta.css': 'oj-alta.css',
        'alta.min.css': 'oj-alta-min.css',
        'fonts': 'fonts',
        'images': 'images'
      }
    },

    oraclejetIosTheme: 
    {
      options:
      {
        srcPrefix: 'bower_components/oraclejet/dist/css/alta-ios',
        destPrefix: 'themes/alta/ios',
      },
      files: {
        'alta.css': 'oj-alta.css',
        'alta.min.css': 'oj-alta-min.css',
        'fonts': 'fonts',
        'images': 'images'
      }
    },

    oraclejetCommonTheme:
    {
      options:
      {
        srcPrefix: "bower_components/oraclejet/dist/css/common",
        destPrefix: "themes/alta/common"
      },
      src: '**'
    },

    oraclejetJs:
    {
      options:
      {
        srcPrefix: "bower_components",
        destPrefix: "src/js/libs"
      },

      files:
      {
        "oj/v<%= grunt.config.data.bowercopy.options.versions.jetVersion %>": "oraclejet/dist/js/libs/oj/",
        "dnd-polyfill": "oraclejet/dist/js/libs/dnd-polyfill/"
      }
    },
    
    oraclejetNlsRootResources:
    {
      options:
      {
        srcPrefix: "bower_components/oraclejet/dist/js/libs/oj/resources/nls",
        destPrefix: "src/js/libs/oj/v<%= grunt.config.data.bowercopy.options.versions.jetVersion %>/resources/root"
      },
      
      src: '*.js'
    },

    // place in the same directory as jet's demo app
    thirdParty:
    {
      options:
      {
        srcPrefix: "bower_components",
        destPrefix: "src/js/libs"
      },
      files:
      {
        "es6-promise/es6-promise.js": "es6-promise/es6-promise.js",
        "es6-promise/es6-promise.min.js": "es6-promise/es6-promise.min.js",
        "hammer/hammer-<%= grunt.config.data.bowercopy.options.versions.hammerVersion %>.js": "hammerjs/hammer.js",
        "hammer/hammer-<%= grunt.config.data.bowercopy.options.versions.hammerVersion %>.min.js": "hammerjs/hammer.min.js",
        "jquery/jquery-<%= grunt.config.data.bowercopy.options.versions.jqueryVersion %>.js": "jquery/dist/jquery.js",
        "jquery/jquery-<%= grunt.config.data.bowercopy.options.versions.jqueryVersion %>.min.js": "jquery/dist/jquery.min.js",
        "js-signals": "js-signals/dist",
        "knockout/knockout-<%= grunt.config.data.bowercopy.options.versions.knockoutVersion %>.debug.js": "knockout/dist/knockout.debug.js",
        "knockout/knockout-<%= grunt.config.data.bowercopy.options.versions.knockoutVersion %>.js": "knockout/dist/knockout.js",
        "require/require.js": "requirejs/require.js",
        "require": "text",
        "proj4js": "proj4",
        "require-css": "require-css",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/core.js":"jquery-ui/ui/minified/core.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/data.js":"jquery-ui/ui/minified/data.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/disable-selection.js":"jquery-ui/ui/minified/disable-selection.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/effect.js":"jquery-ui/ui/minified/effect.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/escape-selector.js":"jquery-ui/ui/minified/escape-selector.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/focusable.js":"jquery-ui/ui/minified/focusable.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/form.js":"jquery-ui/ui/minified/form.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/form-reset-mixin.js":"jquery-ui/ui/minified/form-reset-mixin.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/ie.js":"jquery-ui/ui/minified/ie.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/jquery-1-7.js":"jquery-ui/ui/minified/jquery-1-7.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/keycode.js":"jquery-ui/ui/minified/keycode.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/labels.js":"jquery-ui/ui/minified/labels.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/plugin.js":"jquery-ui/ui/minified/plugin.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/position.js":"jquery-ui/ui/minified/position.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/safe-active-element.js":"jquery-ui/ui/minified/safe-active-element.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/safe-blur.js":"jquery-ui/ui/minified/safe-blur.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/scroll-parent.js":"jquery-ui/ui/minified/scroll-parent.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/tabbable.js":"jquery-ui/ui/minified/tabbable.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/unique-id.js":"jquery-ui/ui/minified/unique-id.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/version.js":"jquery-ui/ui/minified/version.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/widget.js":"jquery-ui/ui/minified/widget.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/widgets/draggable.js":"jquery-ui/ui/widgets/draggable.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/widgets/mouse.js":"jquery-ui/ui/widgets/mouse.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>.min/widgets/sortable.js":"jquery-ui/ui/widgets/sortable.js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>":"jquery-ui/ui/+(core|data|disable-selection|effect|escape-selector|focusable|form|form-reset-mixin|ie|jquery-1-7|keycode|labels|plugin|position|safe-active-element|safe-blur|scroll-parent|tabbable|unique-id|version|widget).js",
        "jquery/jqueryui-amd-<%= grunt.config.data.bowercopy.options.versions.jqueryUIVersion %>/widgets":"jquery-ui/ui/widgets/+(draggable|mouse|sortable).js"
      }
    }
  }
};
