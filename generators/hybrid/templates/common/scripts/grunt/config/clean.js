/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt clean task

module.exports = {

  options: 
  {
    force: true
  },
  
  release: ['www/release/*'],
  mainTemp: ['www/js/main-temp.js','www/release/js/main-temp.js']
  
};