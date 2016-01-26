/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt requirejs task

module.exports = {
  
  //to compress the main.js
  main: 
  {
    options: 
    {
      baseUrl: "www/release/js",
      name: "main-temp",
      mainConfigFile: "www/release/js/main-temp.js",
      optimize: "none",
      out: "www/release/js/main.js"
    }
  }
  
};