/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
var env = process.env,
        assert = require('assert'),
        fs = require('fs-extra'),
        path = require('path'),
        hybridDirectory = "hybrid",
        exec = require('child_process').exec,
        util = require('./util'),
        execOptions =
        {
          cwd: path.resolve('built/test/generator/test')
        };

  var filelist;
  var hybridFileList;
  var testDir = path.resolve('built/test/generator/test/hybridTest');
  var hybridTestDir = path.resolve('built/test/generator/test/hybridTest/' + hybridDirectory);
  var utilDir = path.resolve('built/test/generator/util/hybrid');
  var platform = util.getPlatform(env.OS);

describe("Hybrid Test", function ()
{

  before(function(){
    fs.ensureDirSync(testDir);
    fs.emptyDirSync(testDir);    
  });  

  describe("Scaffold with norestore flag", function(){
   
    it("Generate android/ios app", function (done)
    {
      this.timeout(120000);
      exec('yo oraclejet:hybrid hybridTest --template=navBar --norestore=true --platforms=' + platform, execOptions, function (error, stdout)
      {
        filelist = fs.readdirSync(testDir);
        hybridFileList = fs.readdirSync(hybridTestDir);
        assert.equal(util.norestoreSuccess(stdout), true, error);
        done();
      });
    });
  });
  
  describe("Run Tests", function(){

    it("Copy npm and bower modules", function(done){
      this.timeout(200000);
      //copy Npm and bower modules     
      fs.copy(utilDir, testDir, function(err){
        done();
      });
    });

    it("Run bowercopy task", function(done){
      this.timeout(60000);
      exec('grunt bowercopy', {cwd: testDir}, function(err, stdout){
        done();
        assert.equal(util.isSuccess(stdout), true, err);      
      });
    });

    describe("Invalid arugments & Check error messages", function () {

      it("complain generating app to non-empty appDir", function (done)
      {
        this.timeout(300000);
        exec('yo oraclejet:hybrid hybridTest --platforms=' + platform, execOptions, function (error, stdout)
        {

          var errLogCorrect = /path already exists and is not empty/.test(error.message);
          assert.equal(errLogCorrect, true, error);
          done();
        });
      });

      it("complain about unsupported platform android1", function (done)
      {
        this.timeout(150000);
        exec('grunt build --platform=' + 'android1', {cwd: testDir}, function (error, stdout)
        {

          var errLogCorrect = /Invalid platform value 'android1'/.test(stdout);
          assert.equal(errLogCorrect, true, stdout);
          done();
        });
      });

      it("complain about unsupported server port", function (done)
      {
        this.timeout(150000);
        exec('grunt serve --platform=' + platform + ' --serverPort=' + '12we', {cwd: testDir}, function (error, stdout)
        {

          var errLogCorrect = /Invalid value '12we' for server/.test(stdout);
          assert.equal(errLogCorrect, true, stdout);
          done();
        });
      });

      it("complain about unsupported build argument", function (done)
      {
        this.timeout(150000);
        exec('grunt build:xyz --platform=' + platform, {cwd: testDir}, function (error, stdout)
        {

          var errLogCorrect = /Invalid argument, try build:dev or build:release/.test(stdout);
          assert.equal(errLogCorrect, true, stdout);
          done();
        });
      });
    });

    describe("Build release", function ()
    {
      it("Grunt build android/ios", function (done)
      {
        this.timeout(2400000);
        exec('grunt build:release --platform=' + platform, {cwd: testDir, maxBuffer: 1024 * 20000 }, function (error, stdout)
        {
          assert.equal(util.isSuccess(stdout), true, error);
          done();
        });
      });
    });

    describe("Check essential files", function ()
    {
      it("config.xml exists", function ()
      {
        var inlist = hybridFileList.indexOf("config.xml") > -1;
        assert.equal(inlist, true, path.resolve(hybridTestDir, 'config.xml') + " missing");
      });

      it("package.json exists", function ()
      {
        var inlist = filelist.indexOf("package.json") > -1;
        assert.equal(inlist, true, path.resolve(testDir, 'package.json') + " missing");
      });

      it(".gitignore exists", function ()
      {
        var inlist = filelist.indexOf(".gitignore") > -1;
        assert.equal(inlist, true, path.resolve(testDir, '.gitignore') + " missing");
      });

      if (platform == 'android')
      {
        it(".apk exists", function ()
        {
          var apkList = fs.readdirSync(path.resolve(testDir, hybridDirectory, 'platforms/android/build/outputs/apk'));
          var inlist = false;
          apkList.forEach(function (value)
          {
            inlist = inlist || /.apk/.test(value);
          });
          assert.equal(inlist, true, path.resolve(testDir, hybridDirectory, 'platforms/android/build/outputs/apk', 'android.apk') + " missing");
        });
      }

    });
  });
  

  describe("Clean hybridTest", function () {

    it("Kill adb process to release", function (done) {
      var killAdbCommand = util.isWindows(env.OS) ? "taskkill /IM adb.exe /T /F" : "killall adb.exe";
      this.timeout(500);
      exec(killAdbCommand, execOptions, function (error, stdout)
      {
        done();
      });
    });

    it("Clean cordova platform", function (done) {
      this.timeout(40000);
      exec("cordova platform remove " + platform, {cwd: hybridTestDir}, function (error, stdout)
      {
        done();
        var success = error ? false : true;
        //assert.equal(success,true, error); 
      });
    });

    it("Clean cordova platform try #2", function (done) {
      this.timeout(40000);
      exec("cordova platform remove " + platform, {cwd: hybridTestDir}, function (error, stdout)
      {
        done();
        var success = error ? false : true;
        //assert.equal(success,true, error); 
      });
    });

    it("Clean cordova ", function (done) {
      this.timeout(40000);
      exec("cordova clean", {cwd: hybridTestDir}, function (error, stdout)
      {
        done();
        var success = error ? false : true;
        //assert.equal(success,true, error); 
      });
    });

    it("Clean cordova try #2", function (done) {
      this.timeout(40000);
      exec("cordova clean", {cwd: hybridTestDir}, function (error, stdout)
      {
        done();
        var success = error ? false : true;
        //assert.equal(success,true, error); 
      });
    });
  });
});