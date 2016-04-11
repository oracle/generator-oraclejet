/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
var env = process.env,
        assert = require('assert'),
        fs = require('fs-extra'),
        path = require('path'),
        exec = require('child_process').exec,
        util = require('./util'),
        helpers = require('yeoman-test'),
        yoAssert = require('yeoman-assert'),
        execOptions =
        {
          cwd: path.resolve('built/test/generator/test/')
        };

var filelist;
var testDir = path.resolve('built/test/generator/test', 'webTest');
var utilDir = path.resolve('built/test/generator/util/web');

describe("Web Test", function ()
{
  before(function(){
    fs.ensureDirSync(testDir);
    fs.emptyDirSync(testDir);    
  });  

  describe("Scaffold with norestore flag", function(){
    
    it("Generate web app", function (done)
    {
      this.timeout(120000);
      exec('yo oraclejet webTest --norestore=true', execOptions, function (error, stdout)
      {
        done();
        assert.equal(util.norestoreSuccess(stdout), true, error);
        filelist = fs.readdirSync(testDir);
      });
    });
  })

  describe("Run Tests", function(){

    it("Copy npm and bower modules", function(done){
      this.timeout(200000);
      //copy Npm and bower modules     
      fs.copy(utilDir, testDir, function(err){
        done();
      });
    });

    describe("Check essential files", function (){

      it("package.json exists", function () {
        var inlist = filelist.indexOf("package.json") > -1;
        assert.equal(inlist, true, path.resolve(testDir, 'package.json') + " missing");
      });

      it("Gruntfile.js exists", function () {
        var inlist = filelist.indexOf("Gruntfile.js") > -1;
        assert.equal(inlist, true, path.resolve(testDir, 'Gruntfile.js') + " missing");
      });

      it(".gitignore exists", function ()
      {
        var inlist = filelist.indexOf(".gitignore") > -1;
        assert.equal(inlist, true, path.resolve(testDir, '.gitignore') + " missing");
      });

    });

    it("Run bowercopy task", function(done){
      this.timeout(60000);
      exec('grunt bowercopy', {cwd: testDir}, function(err, stdout){
        done();
        assert.equal(util.isSuccess(stdout), true, err);      
      });
    });

    describe("validate templates", function (){   

      it("navBar is invalid template", function (done) {
        this.timeout(15000);
        exec('yo oraclejet testWebTemplate --template=navBar', execOptions, function (error, stdout)
        {
          var errLogCorrect = /Invalid template name or URL for web: navBar/.test(error.message);
          assert.equal(errLogCorrect, true, error);
          done();
        });
      });

      it("navDrawer is invalid template", function (done) {
        this.timeout(15000);
        exec('yo oraclejet testWebTemplate --template=navDrawer', execOptions, function (error, stdout)
        {
          var errLogCorrect = /Invalid template name or URL for web: navDrawer/.test(error.message);
          assert.equal(errLogCorrect, true, error);
          done();
        });
      });
      //TODO
      it("basic is valid template", function (done) {
        this.timeout(300000);
        exec('yo oraclejet testWebBasic --template=basic --norestore=true', execOptions, function (error, stdout)
        {          
          done();
          assert.equal(util.norestoreSuccess(stdout), true, error);          
        });
      });
    });
  });
});
