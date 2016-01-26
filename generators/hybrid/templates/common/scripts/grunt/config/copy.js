/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt copy task

module.exports = {
  
  //need to copy resources directory as nls content are loaded per need
  release: 
  {
    files:
    [{
      cwd: "www",
      src: [
        '**',
        '!js/**/*.js',
        'js/libs/**',
        '!js/libs/**/*debug*',
        '!js/libs/**/*debug*/**',
        '!release/**',
        '!cordova.js',
      ],
      dest: 'www/release/',
      expand: true
    },
    {
      cwd: "merges/<%= platform %>",
      src: [
        '**'
      ],
      dest: 'www/release/',
      expand: true
    }]
  }
};