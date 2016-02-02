/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt clean task

module.exports =
{
  // to remove the release directory
  options: 
  {
    force: true
  },
  
  release: ["release/*"],
  mainTemp: ["js/main-temp.js", "release/js/main-temp.js"]
};
