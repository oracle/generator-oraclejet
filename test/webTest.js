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
	execOptions = 
	{
		cwd:path.resolve('built/test/generator/')
	};

describe("Web Test", function()
{
	var filelist;
	var testDir = path.resolve('built/test/generator','webTest');
	fs.ensureDirSync(testDir);

	it("Generate web in 300 seconds", function(done) 
	{		
		this.timeout(300000);	
		exec('yo oraclejet webTest', execOptions, function(error, stdout)
		{
			done();
			filelist = fs.readdirSync(testDir);
			assert.equal(util.isSuccess(stdout),true, error);	   		
		});
  	});

  	describe("Check essential files", function()
  	{
 		
  		it("package.json exists", function(){
  			var inlist = filelist.indexOf("package.json") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'package.json') + " missing");
  		});

  		it("oraclejetconfig exists", function(){
  			var inlist = filelist.indexOf("oraclejetconfig.json") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'oraclejetconfig.json') + " missing");
  		});

  		it(".gitignore exists", function(){
  			var inlist = filelist.indexOf(".gitignore") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'.gitignore') + " missing");
  		});

  	});


    describe("validate templates", function()
    {
    
      it("navBar is invalid template", function(done){
        this.timeout(15000);
        exec('yo oraclejet testWebTemplate --template=navBar', execOptions, function(error, stdout)
        {          
          var errLogCorrect = /navBar is invalid for web/.test(error.message);
          assert.equal(errLogCorrect,true, error);
          done();
        });       
      });

      it("navDrawer is invalid template", function(done){
        this.timeout(15000);
        exec('yo oraclejet testWebTemplate --template=navDrawer', execOptions, function(error, stdout)
        {          
          var errLogCorrect = /navDrawer is invalid for web/.test(error.message);
          assert.equal(errLogCorrect,true, error);
          done();
        });       
      });
      //TODO
      it("quickStart is valid template", function(){
        this.timeout(300000);
        exec('yo oraclejet testWebQuickStart --template=quickStart --norestore=true', execOptions, function(error, stdout)
        {          
          assert.equal(util.isSuccess(stdout),true, error);
          done();
        }); 
      });

    });

	describe("Check JET version", function()
  	{ 
  		it("JET Version Match", function()
  		{
  			var packageJSON = fs.readJSONSync(path.resolve(testDir,'oraclejetconfig.json'));
  			var jetVersion = util.getJetVersion(testDir, 'js/libs/oj');
  			assert.equal( jetVersion[0], packageJSON.version, "File version does not match in oraclejetconfig.json");
  		});  		
  	});
});
