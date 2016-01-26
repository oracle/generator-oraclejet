/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var constants = require("../../../util/constants");

var SUPPORTED_PLATFORMS_PROMP_CHOICES = 
[
  {
    name: "Android",
    value: "android"
  },
  {
    name: "iOS",
    value: "ios"
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
  }
];

module.exports = {

  filterPromptingPlatforms: function _filterPromptingPlatforms(promptPlatforms) 
  {
    //simple function to return prompt choices based on supported platforms

    return SUPPORTED_PLATFORMS_PROMP_CHOICES.filter(function(type)
    {
      return promptPlatforms.indexOf(type.value) !== -1;
    });
  },

  testPlatforms: function _testPlatforms(generator, platforms)
  {
    //will return the possible cordova add platform for user's environment
    //by testing which commands succeed or not

    var filteredTestCommands = _getFilteredTestCommands(platforms);
    var platformTests = _getPlatformTests(generator, filteredTestCommands);

    //note there exists no reject since want to test all the filteredTestCommands 
    //and when there are errors (i.e. test command fails) it will resolve w/o that platform
    return new Promise(function(resolve, reject)
    {
      
      Promise.all(platformTests)
        .then(function(platformResults) 
        {
          //note platformResults is an array with those that passed to be populated
          //and those not passed to be undefined (with resolve())
          //as mentioned since one needs to test for every platform passed in the 
          //user's environment need the tests to go through w/ resolve and not 
          //reject

          resolve(platformResults.filter(function(entry)
          {
            //return only entries that resulted in success
            return !!entry;
          }));

        });

    });
  }

};

function _getFilteredTestCommands(platforms)
{
  //need to use filter and not map since the passed in content can 
  //be a subset of TEST_COMMAND
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

    generator.spawnCommand(info.testCommand, info.testCommandArgs)
      .on("exit", function(err) 
      {
        if (err) 
        {
          //note as mentioned just resolve
          generator.log(_getErrorMessage(info, err));
          return resolve();
        }

        return resolve(info.platform);
      })
      .on("error", function(err) 
      {
        //intentionally resolve it since these are tests and want to proceed through 
        //all the promises
        generator.log(_getErrorMessage(info, err));

        return resolve();
      });

  });
}

function _getErrorMessage(info, err) 
{
  return "WARN: Skipping following platform as the test command returned an error - " +
    info.platform + " => " + info.testCommand + " " + info.testCommandArgs.join(" ") + " with " + err;
}