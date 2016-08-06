/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
/*var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').exec;
var util = require('./util');

var testDir = 'built/test/generator/deviceDemoTest/';
var appDir = '';
var pluginsDir = '';

describe('Jet Device Demo Test', function()
{
  fs.ensureDirSync(testDir);

  it('Check out app (max 300 seconds allowed)', function(done)
  {
    this.timeout(300000);
    exec('svn checkout https://ojet-scm.us.oracle.com/svn/ADFjs/trunk/sandbox/jara/JetDeviceDemo2/', {cwd: path.resolve(testDir)}, function(error, stdout) {
      appDir = testDir + fs.readdirSync(testDir)[0];

      done();
      assert.equal(util.isCheckedOut(stdout), true, error);
    });
  });

  it('Restore app (max 300 seconds allowed)', function(done) {
    this.timeout(300000);
    exec('yo oraclejet:restore', {cwd: path.resolve(appDir)}, function(error, stdout) {
      done();
      assert.equal(util.isSuccess(stdout),true, error);
    });
  });

  it('Add Android platform and plugins (max 300 seconds allowed)', function(done)
  {
    this.timeout(300000);
    exec('cordova platform add android', {cwd: path.resolve(appDir)}, function(error, stdout)
    {
      pluginsDir = appDir + '/plugins/';

      var file = 'android';
      var files = fs.readdirSync(appDir + '/platforms/');
      var platform = 'platforms/' + file;
      done();
      assert.equal(util.matchInArray(file, files), true, path.resolve(appDir, platform) + ' missing, platform not found');
    });
  });

  describe("Check for the presence of restored folders/files", function()
  {
    function createMsg(dir, file)
    {
      return path.resolve(dir, file) + ' missing, not restored'
    }

    it('bower_components', function()
    {
      var file = 'bower_components';
      var files = fs.readdirSync(appDir);
      var inlist = files.indexOf(file) > -1;

      assert.equal(inlist, true, createMsg(testDir, file));
    });

    it('merges', function()
    {
      var file = 'merges';
      var files = fs.readdirSync(appDir);
      var inlist = files.indexOf(file) > -1;
      assert.equal(inlist, true, createMsg(testDir, file));
    });

    it('node_modules', function()
    {
      var file = 'node_modules';
      var files = fs.readdirSync(appDir);
      var inlist = files.indexOf(file) > -1;
      assert.equal(inlist, true, createMsg(testDir, file));
    });

    it('Library: dnd-polyfill', function()
    {
      var file = 'dnd-polyfill';
      var files = fs.readdirSync(appDir + '/www/js/libs/dnd-polyfill/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: es6-promise', function()
    {
      var file = 'promise';
      var files = fs.readdirSync(appDir + '/www/js/libs/es6-promise/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: hammer', function()
    {
      var file = 'hammer';
      var files = fs.readdirSync(appDir + '/www/js/libs/hammer/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: jquery', function()
    {
      var file = 'jquery';
      var files = fs.readdirSync(appDir + '/www/js/libs/jquery/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: js-signals', function()
    {
      var file = 'signals';
      var files = fs.readdirSync(appDir + '/www/js/libs/js-signals/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: knockout', function()
    {
      var file = 'knockout';
      var files = fs.readdirSync(appDir + '/www/js/libs/knockout/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: oj', function()
    {
      var file = 'oj';
      var version = fs.readdirSync(appDir + '/www/js/libs/oj/');
      var files = fs.readdirSync(appDir + '/www/js/libs/oj/' + version[0] + '/min/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });

    it('Library: require', function()
    {
      var file = 'require';
      var files = fs.readdirSync(appDir + '/www/js/libs/require/');
      assert.equal(util.matchInArray(file, files), true, createMsg(testDir, file));
    });
  });

  describe("Check for the presence of Cordova plugins", function()
  {
    function createMsg(dir, file)
    {
      return path.resolve(dir, file) + ' missing, plugin not present'
    }

    it('Plugin: camera', function()
    {
      var file = 'cordova-plugin-camera';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });

    it('Plugin: contacts', function()
    {
      var file = 'cordova-plugin-contacts';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });

    it('Plugin: camera', function()
    {
      var file = 'cordova-plugin-camera';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });

    it('Plugin: device', function()
    {
      var file = 'cordova-plugin-device';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });

    it('Plugin: geolocation', function()
    {
      var file = 'cordova-plugin-geolocation';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });

    it('Plugin: globalization', function()
    {
      var file = 'cordova-plugin-globalization';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });

    it('Plugin: network', function()
    {
      var file = 'cordova-plugin-network-information';
      var files = fs.readdirSync(pluginsDir);
      assert.equal(util.matchInArray(file, files), true, createMsg(pluginsDir, file));
    });
  });

  describe("Clean", function()
  {
    it("clean testing data", function(done)
    {
      this.timeout(5000);
      fs.remove(testDir, function(err)
      {
        done();
        var success = err ? false : true;
        assert(success, 'Clean failed');
      });
    });
  });
});
*/