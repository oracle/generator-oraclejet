/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt task for serve

var ports = require("../common/ports");

module.exports = function(grunt)
{
  grunt.registerTask("serve", function(target) 
  {
    target = target || "dev";

    _updateGruntConfig(grunt, target);
    _runTasks(grunt, target);
  });

};

function _updateGruntConfig(grunt, target)
{
  ports.configurePort(grunt, "server");
  ports.configurePort(grunt, "livereload");
  grunt.config.set("target", target);
}

function _runTasks(grunt, target)
{
  var tasks = _getTasks(grunt, target);
  grunt.task.run(tasks);
}

function _getTasks(grunt, target)
{
  // disable livereload based on config or if release mode
  var disableLiveReload = !!grunt.option("disableLiveReload") || target !== "dev";

  var tasks =
  [
    "connect:" + target + "Server" + (disableLiveReload ? ":keepalive" : "")
  ];

  !disableLiveReload && (tasks = tasks.concat(["watch"]));

  return tasks;
}
