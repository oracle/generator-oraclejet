/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt watch task

module.exports =
{
  // to watch for changes in file and to perform livereload
  livereload: 
  {
    files: 
    [
       "css/!(libs)/**/*.css",
      "js/!(libs)/**/*.js",
      "js/{,*/}*.js",
      "css/{,*/}*.css",
      "**/*.html"
    ],

    options: 
    {
      livereload: "<%= oraclejet.ports.livereload %>"
    }
  }
};
