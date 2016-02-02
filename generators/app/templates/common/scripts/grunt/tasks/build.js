/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt task for build

module.exports = function(grunt)
{
  grunt.registerTask("build", function (target) 
  {
    target = target || "dev";

    // need to pass in target for grunt tasks
    grunt.config.set("target", target);

    if (target === "release")
    {
      grunt.task.run(
      [
        "clean:release",
        "injector:mainReleasePaths",   
        "uglify:release",
        "copy:release",          
        "requirejs",
        "clean:mainTemp"
      ]);
    }
    else if (target !== "dev")
    {
      grunt.log.error(["Invalid argument, try build:dev or build:release"]);
    }
  });
};
