/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt copy task

module.exports = {
  
  // need to copy resources directory as nls content are loaded per need
  release: 
  {
    src: [
      "**",
      "!bower_components/**",
      "!grunt/**",
      "!scripts/**",
      "!js/**/*.js",
      "js/libs/**",
      "!js/libs/**/*debug*",
      "!js/libs/**/*debug*/**",
      "!node_modules/**",
      "!release/**",
      "!test/**",
      "!.gitignore",
      "!bower.json",
      "!Gruntfile.js",
      "!npm-shrinkwrap.json",
      "!oraclejetconfig.json",
      "!package.json"
    ],
    dest: "release/",
    expand: true
  }
  
};