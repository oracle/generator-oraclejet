/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
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
      exec('yo oraclejet:hybrid hybridTest --template=navbar --appid=my.id --appName=testcase --norestore=true --platforms=' + platform, execOptions, function (error, stdout)
      {
        assert.equal(error, undefined, error);
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

    it("bowercopy", function (done)
      {
        this.timeout(300000);
        exec('grunt bowercopy', {cwd: testDir}, function (error, stdout)
        {
          assert.equal(util.bowerCopySuccess(stdout), true, error);
          done();
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

          var errLogCorrect = /Invalid platform/i.test(stdout);
          assert.equal(errLogCorrect, true, stdout);
          done();
        });
      });

      it("complain about unsupported server port", function (done)
      {
        this.timeout(20000);
        exec('grunt serve --platform=' + platform + ' --serverPort=' + '12we', {cwd: testDir,}, function (error, stdout)
        {

          var errLogCorrect = /deprecated/.test(stdout);
          assert.equal(errLogCorrect, true, stdout);
          done();
        });
      });

      it("complain about unsupported build argument", function (done)
      {
        this.timeout(150000);
        exec('grunt build:xyz --platform=' + platform, {cwd: testDir}, function (error, stdout)
        {

          var errLogCorrect = /buildType xyz is invalid/.test(stdout);
          assert.equal(errLogCorrect, true, stdout);
          done();
        });
      });
    });

    describe("Build", function ()
    {
      it("Grunt build android/ios", function (done)
      {
        this.timeout(2400000);
        exec('grunt build --platform=' + platform, {cwd: testDir, maxBuffer: 1024 * 20000 }, function (error, stdout)
        {
          assert.equal(util.buildSuccess(stdout), true, error);
          done();
        });
      });

      it("Grunt build android/ios for device", function (done)
      {
        this.timeout(2400000);
        exec(`grunt build --platform=${platform} --destination=device`, {cwd: testDir, maxBuffer: 1024 * 20000 }, function (error, stdout)
        {
          assert.equal(util.buildSuccess(stdout), true, error);
          done();
        });
      });
    });

    describe("Check essential files", function ()
    {
      it("config.xml exists and is correct", function ()
      {
        var inlist = hybridFileList.indexOf("config.xml") > -1;
        assert.equal(inlist, true, path.resolve(hybridTestDir, 'config.xml') + " missing");
        if (inlist) {
            // Check contents of config.xml
            var configRead = fs.readFileSync(path.resolve(hybridTestDir, 'config.xml'), "utf-8");
            assert.equal(configRead.indexOf("<name>testcase</name>") > -1, true, "config.xml missing <name>");
            assert.equal(configRead.indexOf('id="my.id"') > -1, true, "config.xml missing correct id value");
        }
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

  describe("serve", () => {
    it("Grunt serve android/ios without platform", function (done)
    {
      this.timeout(2400000);
      exec(`grunt serve`, {cwd: testDir, maxBuffer: 1024 * 20000, timeout:100000, killSignal:'SIGTERM' }, function (error, stdout)
      {
        assert.equal((util.noError(stdout) || /watch:srouceFiles/.test(stdout)), true, error);
        done();
      });
    });
  });

  describe("add-sass", () => {
    it("add sass generator", function (done)
    {
      this.timeout(2400000);
      exec(`yo oraclejet:add-sass`, {cwd: testDir, maxBuffer: 1024 * 20000, timeout:100000, killSignal:'SIGTERM' }, function (error, stdout)
      {
        assert.equal(/add-sass finished/.test(stdout) || /add-sass finished/.test(error), true, error);
        done();
      });
    });
  });

  describe("add-theme", () => {
    it("add add-theme generator", function (done)
    {
      this.timeout(2400000);
      exec(`yo oraclejet:add-theme green`, {cwd: testDir, maxBuffer: 1024 * 20000, timeout:50000, killSignal:'SIGTERM' }, function (error, stdout)
      {
        assert.equal(util.noError(stdout), true, error);
        done();
      });
    });
  });

  describe("compile sass", () => {
    it("compile sass", function (done)
    {
      this.timeout(2400000);
      exec(`grunt build --theme=green`, {cwd: testDir, maxBuffer: 1024 * 20000, timeout:100000, killSignal:'SIGTERM' }, function (error, stdout)
      {
        assert.equal(util.noError(stdout), true, stdout);
        done();
      });
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