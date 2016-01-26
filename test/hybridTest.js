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

describe("Hybrid Test", function()
{
	var filelist;
	var testDir = path.resolve('built/test/generator/hybridTest');
	var platform = util.getPlatform(env.OS);
	fs.ensureDirSync(testDir);

	it("Generate android/ios app in 300 seconds", function(done) 
	{		
		this.timeout(300000);
		exec('yo oraclejet:hybrid hybridTest --template=navBar --platforms=' + platform, execOptions, function(error, stdout)
		{
			
			filelist = fs.readdirSync(testDir);
			assert.equal(util.isSuccess(stdout),true, error);  
			done();
		});
  	});

  	describe("Invalid arugments & Check error messages", function(){

  		it("complain generating app to non-empty appDir", function(done) 
		{		
			this.timeout(300000);
			exec('yo oraclejet:hybrid hybridTest --platforms=' + platform, execOptions, function(error, stdout)
			{
				
				var errLogCorrect = /Path already exists and is not empty/.test(error.message);
				assert.equal(errLogCorrect,true, error);
				done();
			});
	  	});

	  	it("complain about unsupported platform android1", function(done) 
		{
			this.timeout(150000);
			exec('grunt build --platform=' + 'android1', {cwd: testDir}, function(error, stdout)
			{
			
				var errLogCorrect = /Invalid platform value 'android1'/.test(stdout);
				assert.equal(errLogCorrect,true, stdout);
				done();
			});
	  	});

	  	it("complain about unsupported server port", function(done) 
		{
			this.timeout(150000);
			exec('grunt serve --platform=' + platform + ' --serverPort=' + '12we', {cwd: testDir}, function(error, stdout)
			{
				
				var errLogCorrect = /Invalid value '12we' for server/.test(stdout);
				assert.equal(errLogCorrect,true, stdout);
				done();
			});
	  	});

	  	it("complain about unsupported build argument", function(done) 
		{
			this.timeout(150000);
			exec('grunt build:xyz --platform=' + platform, {cwd: testDir}, function(error, stdout)
			{
				
				var errLogCorrect = /Invalid argument, try build:dev or build:release/.test(stdout);
				assert.equal(errLogCorrect,true, stdout);
				done();
			});
	  	});
  	});  	

	describe("Build release", function()
  	{
  		it("Grunt build android/ios", function(done) 
		{
			this.timeout(150000);
			exec('grunt build:release --platform=' + platform, {cwd: testDir}, function(error, stdout)
			{
				
				assert.equal(util.isSuccess(stdout),true, error);
				done();
			});
	  	});
	}); 

  	describe("Check essential files", function()
  	{  
  		it("config.xml exists", function()
  		{
  			var inlist = filelist.indexOf("config.xml") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'config.xml') + " missing");
  		});

  		it("package.json exists", function()
  		{
  			var inlist = filelist.indexOf("package.json") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'package.json') + " missing");
  		});

  		it("oraclejetconfig exists", function()
  		{
  			var inlist = filelist.indexOf("oraclejetconfig.json") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'oraclejetconfig.json') + " missing");
  		});

  		it(".gitignore exists", function()
  		{
  			var inlist = filelist.indexOf(".gitignore") > -1;
  			assert.equal(inlist, true, path.resolve(testDir,'.gitignore') + " missing");
  		});

  		if (platform == 'android')
  		{
  			it(".apk exists", function()
  			{	
  				var apkList = fs.readdirSync(path.resolve(testDir,'platforms/android/build/outputs/apk'));
  				var inlist = false;
  				apkList.forEach(function(value)
  				{
  					inlist = inlist || /.apk/.test(value);
  				});
	  			assert.equal(inlist, true, path.resolve(testDir,'platforms/android/build/outputs/apk','android.apk') + " missing");
  			});
  		} 		

  	});


  	describe("Check JET version", function()
  	{ 
  		it("JET Version Match", function(){
  			var packageJSON = fs.readJSONSync(path.resolve(testDir,'oraclejetconfig.json'));
  			var jetVersion = util.getJetVersion(testDir, 'www/js/libs/oj');
  			assert.equal( jetVersion[0], packageJSON.version, "File version does not match in oraclejetconfig.json");
  		});  		
  	});



  	describe("Clean hybridTest", function(){  	
  		
  		it("Kill adb process to release", function(done){
  			var killAdbCommand = util.isWindows(env.OS) ? "taskkill /IM adb.exe /T /F" : "killall adb.exe";
  			this.timeout(500);
			exec(killAdbCommand, execOptions, function(error, stdout)
			{
				done(); 
			});
  		});

  		it("Clean cordova platform", function(done){
  			this.timeout(40000);
			exec("cordova platform remove " + platform, {cwd: testDir}, function(error, stdout)
			{
				done(); 
				var success = error ? false : true;
				//assert.equal(success,true, error); 
			});
  		});

  		it("Clean cordova platform try #2", function(done){
  			this.timeout(40000);
			exec("cordova platform remove " + platform, {cwd: testDir}, function(error, stdout)
			{
				done(); 
				var success = error ? false : true;
				//assert.equal(success,true, error); 
			});
  		});

  		it("Clean cordova ", function(done){
  			this.timeout(40000);
			exec("cordova clean", {cwd: testDir}, function(error, stdout)
			{
				done(); 
				var success = error ? false : true;
				//assert.equal(success,true, error); 
			});
  		});		

  		it("Clean cordova try #2", function(done){
  			this.timeout(40000);
			exec("cordova clean", {cwd: testDir}, function(error, stdout)
			{
				done(); 
				var success = error ? false : true;
				//assert.equal(success,true, error); 
			});
  		});	
  	});
});