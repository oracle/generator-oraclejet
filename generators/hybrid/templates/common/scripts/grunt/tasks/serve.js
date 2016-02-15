/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
// grunt task for serve
var ports = require("../common/ports");
var constants = require("../../common/constants");
var util = require("../../common/util");
var injector = require("../../common/injector");
var StringDecoder = require("string_decoder").StringDecoder;

module.exports = function(grunt) {

  grunt.registerTask("serve", function(target) 
  {
    var platform = grunt.option("platform");
    
    if(!platform) 
    {
      throw new Error("Platform option is required");
    }

    target = target || "dev";

    var web = grunt.option("web");
    var disableLiveReload = _updateGruntConfig(grunt, platform, web, target);
    
    _updateProcessEnv(grunt, platform, target, disableLiveReload);

    _runTasks(grunt, disableLiveReload, web, target);
  });

  grunt.registerTask("customServe", function(target) 
  {
    // need to manage how the serve is performed due to almost all tasks in codova 
    // doing copy 

    var destination = grunt.config("destination");
    var buildConfig = grunt.config("buildConfig");

    // intentionally hold out since the task should not end 
    var done = this.async();
    var args = [];
    var cmd;

    // unfortunately this is necessary for one to preserve the PATH for windows
    // there is a bug for nodejs (don't recall) dating back to 2012 or 13 and think 
    // they won't fix it, since there were comments regarding status update from 2015
    if (process.platform === "win32") 
    {
      cmd = "cmd.exe";
      args = ["/s", "/c", "cordova"];
    } 
    else 
    {
      cmd = "cordova";
      args = [];
    }

    process.chdir(constants.CORDOVA_DIRECTORY);
    _cordovaServe(grunt, cmd, args.slice())
      .then(function() 
      {
        _cordovaRun(grunt, cmd, args.slice(), destination, buildConfig);
        process.chdir("..");
        _watch(grunt);
      })
      .catch(function(err)
      {
        grunt.log.error(["Error invoking grunt serve", err]);
      });

  });

};

function _cordovaServe(grunt, cmd, args)
{
  grunt.log.writeln("Invoking cordova serve");

  args = args.concat(["serve", grunt.config("oraclejet.ports.server")]);
  return _spawnCommandStdOut(grunt, cmd, args, "Static file server running on");
}

function _cordovaRun(grunt, cmd, args, destination, buildConfig)
{
  grunt.log.writeln("Invoking cordova run");

  args.push("run");
  args.push(destination);
  args.push(grunt.config("platform"));
  args.push(grunt.config("buildType"));

  if (buildConfig)
  {
    args.push(buildConfig);
  }

  return _spawnCommandStdOut(grunt, cmd, args, "");
}

function _watch(grunt)
{
  grunt.log.writeln("Starting watch ");

  // so need to spawn it out to invoke it asynchronously. however unfortunately 
  // the pulling of the parameter such as <%= oraclejet.ports.livereload %>' 
  // inside grunt/config/watch.js is applicable for only config 
  // and not of grunt.option.  As such need to pass it as an option and 
  // set it as config in grunt/config/watch.js
  var livereloadPort = "--oraclejet.ports.livereload=" + grunt.config("oraclejet.ports.livereload");
  _spawnCommandStdOut(grunt, "grunt", ["watch", livereloadPort], "");
}

function _spawnCommandStdOut(grunt, cmd, args, outputString)
{
  return new Promise(function(resolve, reject)
  {
    var decoder = new StringDecoder("utf8");
    var spawn = grunt.util.spawn({cmd: cmd, args: args}, function(){});

    spawn.stdout.on("data", function(data) 
    {
      var search = decoder.write(data);
      grunt.log.write(search);

      if (outputString && search.indexOf(outputString) !== -1)
      {
        resolve(search);
      }
    });
  });
}

function _updateGruntConfig(grunt, platform, web, target)
{
  ports.configurePort(grunt, "server");
  ports.configurePort(grunt, "livereload");

  var destination = grunt.option("destination");

  // disable livereload based on config or if release mode
  var disableLiveReload = !!grunt.option("disableLiveReload") || target !== "dev" 
                            || destination === "device";
  disableLiveReload && grunt.config.set("oraclejet.ports.livereload", false);
  
  grunt.config.set("web", web);
  grunt.config.set("platform", platform);
  grunt.config.set("target", target);
  grunt.config.set("buildType", util.getCordovaBuildType(target));
  grunt.config.set("buildConfig", util.getCordovaBuildConfig(grunt));

  var deployTypeArg = _getDeployTypeArg(destination);
  grunt.config.set("destination", deployTypeArg);

  return disableLiveReload;
}

function _getDeployTypeArg(destination)
{
  return (!destination) ?
    "--emulator" :
    (destination === "device") ?
      "--device" :
      "--target=" + destination;
}

function _updateProcessEnv(grunt, platform, target, disableLiveReload)
{
  // update for cordova hooks
  process.env[constants.PLATFORM_ENV_KEY] = platform;
  process.env[constants.TARGET_ENV_KEY] = target;
  process.env[constants.LIVERELOAD_ENABLED_ENV_KEY] = !disableLiveReload;
  process.env[constants.LIVERELOAD_PORT_ENV_KEY] = grunt.config("oraclejet.ports.livereload");
  process.env[constants.SERVER_PORT_ENV_KEY] = grunt.config("oraclejet.ports.server");
}

function _runTasks(grunt, disableLiveReload, web, target)
{
  var tasks = _getTasks(grunt, disableLiveReload, web, target);
  grunt.task.run(tasks);
}

function _getTasks(grunt, disableLiveReload, web, target)
{
  var tasks;

  if (web) 
  {
    
    tasks = [
      "connect:" + target + "Server" + (disableLiveReload? ":keepalive" : "")
    ];

    !disableLiveReload && (tasks = tasks.concat(["watch"]));
  }
  else 
  {
    tasks = [];

    if (!disableLiveReload)
    {
      tasks.push("customServe");
    }
    else
    {
      tasks.push("shell:cordovaRun");
    }
  }

  return tasks;
}
