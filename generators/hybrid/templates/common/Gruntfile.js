/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var path = require("path");

/*
 * Currently the tooling uses load-grunt-config to manage it's tasks.
 * In future grunt plugin will be created for better management
 */

module.exports = function (grunt) 
{
  require("jit-grunt")(grunt, 
  {
    "shell": "grunt-shell-spawn"
  });

  require("load-grunt-config")(grunt, 
  {
    configPath: path.join(process.cwd(), "scripts/grunt/config"),

    jitGrunt: 
    {
      customTasksDir: "scripts/grunt/tasks"
    },

    data: 
    {
      oraclejet: 
      {
        ports: 
        {
          server: 8090,
          livereload: 35729
        }
      }
    }
  });
};
