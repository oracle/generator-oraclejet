/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt uglify task

module.exports = {
  
  //to minify app js files
  release: 
  {
    files: 
    [{
      expand: true,
      cwd:'www/js',
      src:['**/*.js', '!libs/**', '!main.js'],
      dest:'www/release/js'
    }]    
  }
  
};