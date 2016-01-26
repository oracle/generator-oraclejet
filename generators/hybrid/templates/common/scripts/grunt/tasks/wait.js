/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
//grunt task for wait

module.exports = function(grunt) {

  grunt.registerTask('wait', function () 
  {
    var done = this.async();

    setTimeout(function () 
    {
      done();
    }, 2000);
  });

};
