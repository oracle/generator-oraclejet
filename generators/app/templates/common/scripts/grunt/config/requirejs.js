/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt requirejs task

module.exports =
{
  // to compress the main.js
  main: 
  {
    options: 
    {
      baseUrl: "./release/js",
      name: "main-temp",
      mainConfigFile: "release/js/main-temp.js",
      optimize: "none",
      out: "release/js/main.js"
    }
  }
  
};
