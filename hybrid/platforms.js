/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var path = require("path");
var constants = require("../util/constants");
var util = require("../util");
var paths = require("../util/paths");
var common = require("../common");
var commonMessages = require("../common/messages");

var SUPPORTED_PLATFORMS_PROMP_CHOICES = 
[
  {
    name: "Android",
    value: "android"
  },
  {
    name: "iOS",
    value: "ios"
  },
  {
    name: "Windows",
    value: "windows"
  }
];

var TEST_COMMAND =
[
  {
    platform: "android",
    testCommand: "adb",
    testCommandArgs: ["devices"]
  },
  {
    platform: "ios",
    testCommand: "xcrun",
    testCommandArgs: ["simctl", "help", "create"]
  },
  {
    platform: "windows",
    testCommand: 'reg.exe',
    testCommandArgs: [ 'query', 
        'HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\ Kits\\Installed\ Roots',
        '/v', 'KitsRoot10']
  }
];

var platformsHelper = module.exports =
{
  getPlatforms: function _getPlatforms(generator)
  {
    var platforms;
    
    if (generator.options.platforms || generator.options.platform)
    {
      platforms = generator.options.platforms || generator.options.platform;
      
      return new Promise(function (resolve, reject)
      {
        _validatePlatforms(generator, platforms)
          .then(function (processedPlatforms)
          {
            generator._platformsToInstall = processedPlatforms;
            resolve(generator);
          });
      }); 
    }
    
    return new Promise(function(resolve, reject)
    {
      // if platforms option is not provided do prompt

      _testPlatforms(generator, constants.SUPPORTED_HYBRID_PLATFORMS)
        .then(function(possiblePlatforms) 
        {
          if (!possiblePlatforms.length)
          {
            resolve(generator);
            return;
          }

          generator.prompt([
          {
            type: "checkbox",
            name: "platforms",
            choices: _filterPromptingPlatforms(possiblePlatforms),
            message: "Please choose the platforms you want to install"
          }]).then(function(answers) 
          {
            // preserve the values for the corodva add part
            generator._platformsToInstall = answers.platforms;
            resolve(generator);

          }.bind(generator));
        }.bind(generator))
        .catch(function(err)
        {
          reject(commonMessages.error(err, "testPlatforms"));
        });

    });
  },

  addPlatforms: function _addPlatforms(generator) 
  {
    var platforms = generator._platformsToInstall;
    var context = { generator: generator };
    
    // always add the browser platform
    platforms.push('browser');
    const cordovaDir = paths.getConfiguredPaths(generator.destinationPath()).stagingHybrid;
    const appRoot = generator.destinationPath();

    generator.destinationRoot(generator.destinationPath(cordovaDir));

    return new Promise(function(resolve, reject)
    {
      var p = Promise.resolve();
      platforms.forEach(function(value)
      {
        p = p.then(function() 
        {
          return common.gruntSpawnCommandPromise(context, "cordova", 
              ["platform", "add", value, "--save"], "Adding platform : " + value);
        });
      });

      p.then(function()
      {
        generator.destinationRoot(appRoot);
        resolve(generator);
      })
      .catch(function(err)
      {
        reject(commonMessages.error(err, "addPlatforms"));
      });      
    });
  }  
};

/**
 * Returns an array of platforms to be installed.
 * An error is thrown when an invalid platform is requested. 
 * A warning is displayed for valid platforms that do not appear 
 * to be supported in the environment.
 * 
 * @param {type} generator
 * @return {Promise}
 */
function _validatePlatforms(generator)
{
  var platformOptions = generator.options.platforms || generator.options.platform;
  var platforms = _processPlatformOptions(generator, platformOptions);

  return new Promise(function(resolve, reject) 
  {
    _testPlatforms(generator, platforms)
      .then(function(availablePlatforms)
        {  
          var failedPlatforms = [];
          platforms.forEach(function(entry)
          {
            if (availablePlatforms.indexOf(entry) < 0)
            {
              failedPlatforms.push(entry);
            }
          });

          if (failedPlatforms.length > 0)
          {
            var msg = 'WARNING: Could not detect support for the following platform(s):';
            failedPlatforms.forEach(function(entry)
            {
              msg += '\n  ' + entry;
            });
            msg += '\nThe platform(s) will be installed, but may not work properly.';
            generator.log(commonMessages.appendJETPrefix() + msg);
          }
          resolve(platforms);
        }
     );
  });
}

/**
 * Tests if the requested platforms are supported in the current environment.
 * Returns an array of detected valid platforms.
 * 
 * @param {Object} generator
 * @param {Array} platforms array of requested platforms
 * @return {Promise} a promise object
 */
function _testPlatforms(generator, platforms)
{
  var filteredTestCommands = _getFilteredTestCommands(platforms);
  var platformTests = _getPlatformTests(generator, filteredTestCommands);

  // note there exists no reject since want to test all the filteredTestCommands 
  // and when there are errors (i.e. test command fails) it will resolve w/o that platform
  return new Promise(function(resolve, reject)
  {
    Promise.all(platformTests)
      .then(function(platformResults) 
      {
        // note platformResults is an array with those that passed to be populated
        // and those not passed to be undefined (with resolve())
        // as mentioned since one needs to test for every platform passed in the 
        // user's environment need the tests to go through w/ resolve and not 
        // reject
        resolve(platformResults.filter(function(entry)
        {
          // return only entries that resulted in success
          return !!entry;
        }));
      });
  });
}

function _filterPromptingPlatforms(promptPlatforms) 
{
  // simple function to return prompt choices based on supported platforms
  return SUPPORTED_PLATFORMS_PROMP_CHOICES.filter(function(type)
  {
    return promptPlatforms.indexOf(type.value) !== -1;
  });
}

function _processPlatformOptions(generator, platforms)
{
  if (!platforms)
  {
    return [];
  }

  var splitted = platforms.split(",");
  var trimmed = splitted.map(function(val)
  {
    return val.trim();
  });

  // now filter the content to only supported ones
  return trimmed.filter(function(val) 
  {
    var supportedValue = constants.SUPPORTED_HYBRID_PLATFORMS.indexOf(val);
    if (supportedValue === -1) 
    {
      generator.env.error("ERROR: Passed in unsupported platform - " + val);
    }

    return supportedValue !== -1;
  });
}



function _getFilteredTestCommands(platforms)
{
  // need to use filter and not map since the passed in content can 
  // be a subset of TEST_COMMAND
  return TEST_COMMAND.filter(function(type)
  {
    return platforms.indexOf(type.platform) !== -1;
  });
}

function _getPlatformTests(generator, platforms)
{
  var platformTests = [];
  
  platforms.forEach(function(info) 
  {
    platformTests.push(_createPlatformTest(generator, info));
  });

  return platformTests;
}

function _createPlatformTest(generator, info) 
{
  return new Promise(function(resolve, reject)
  {
    generator.spawnCommand(info.testCommand, info.testCommandArgs, {stdio: ['pipe', 'ignore', 'pipe']})
      .on("exit", function(err) 
      {
        if (err) 
        {
          // note as mentioned just resolve
          resolve();
        }

        resolve(info.platform);
      })
      .on("error", function(err) 
      {
        // intentionally resolve it since these are tests and want to proceed through 
        // all the promises
        resolve();
      });

  });  
}
