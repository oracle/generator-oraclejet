/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";
var constants = require("../util/constants");
var fs = require("fs-extra");
var path = require("path");
var bowerCopyConfig = require("./bowerCopyConfig");
var commonMessages = require("./messages");
var cordovaDirectory = 'hybrid';
var appSrcDirectory = 'src';

module.exports =
{

  bowerCopy: function _bowerCopy(context)
  { 

    var generator = context.generator;
    generator.log(commonMessages.appendJETPrefix("Copying library scripts to src..."));
    var versions = _getVersions(generator);
    var config = bowerCopyConfig.getConfig(versions, cordovaDirectory, appSrcDirectory);
    var copyPromises = [];

    copyPromises.push(_copyJetCommonCss(generator, config));
    copyPromises.push(_copyJetJs(generator, config));
    copyPromises.push( _copyJetDnDPolyFill(generator, config));
    copyPromises.push( _copyRequireJs(generator, config));
    copyPromises.concat(_copyThridParty(generator, config));
   

    copyPromises.push(_copyJetPlatformCss(generator, 'android', config));
    copyPromises.push(_copyJetPlatformCss(generator, 'ios', config));
    copyPromises.push(_copyJetPlatformCss(generator, 'windows', config));
    copyPromises.push(_copyJetWebCss(generator, config));

    return new Promise((resolve, reject) => {
      Promise.all(copyPromises)
      .then(function()
      {
        resolve(context);
      })
      .catch(err => 
      {
        reject(err);
      });
    });  
	}
};


function _copyJetPlatformCss (generator, platform, bowerCopyConfig)
{ 
  var platformPath = _getCssPlatformPath(platform);
  var src = generator.destinationPath(path.join(bowerCopyConfig.ojSrcPrefix, 'css', platformPath));
  var dest = generator.destinationPath(path.join(bowerCopyConfig.cssDestPrefix, platform, bowerCopyConfig.cssDestPostfix));
  return _promiseCopyTask(src, dest);
}

function _copyJetWebCss (generator, bowerCopyConfig)
{ 
  var src = generator.destinationPath(path.join(bowerCopyConfig.ojSrcPrefix, 'css', 'alta'));
  var dest = generator.destinationPath(path.join(bowerCopyConfig.cssDestPrefix, 'web', bowerCopyConfig.cssDestPostfix));
  return _promiseCopyTask(src, dest);
}

function _copyJetCommonCss (generator, bowerCopyConfig)
{ 
  var src = path.join(bowerCopyConfig.ojSrcPrefix, 'css', 'common');
  src = generator.destinationPath(src);
  var dest = path.join(appSrcDirectory, bowerCopyConfig.commonCssDestPostfix);
  dest = generator.destinationPath(dest);
  return _promiseCopyTask(src, dest);
}


function _copyJetJs (generator, bowerCopyConfig)
{ 

  var src = path.join(bowerCopyConfig.ojSrcPrefix, bowerCopyConfig.jsSrcPrefix);
  src = generator.destinationPath(src);
  var dest = path.join(bowerCopyConfig.dest, bowerCopyConfig.jsDest);
  dest = generator.destinationPath(dest);

  return _promiseCopyTask(src, dest);
}

function _copyRequireJs (generator, bowerCopyConfig)
{ 

  var src = path.join(bowerCopyConfig.bowerDir, bowerCopyConfig.requireJsSrc);
  src = generator.destinationPath(src);
  var dest = path.join(bowerCopyConfig.dest, bowerCopyConfig.requireJsDest);
  dest = generator.destinationPath(dest);

  return _promiseCopyTask(src, dest);
}

function _copyJetDnDPolyFill (generator, bowerCopyConfig)
{ 
  var src = generator.destinationPath(bowerCopyConfig.ojSrcPrefix, bowerCopyConfig.dndPolySrcPrefix);
  var dest = generator.destinationPath(bowerCopyConfig.dest, bowerCopyConfig.dndPolyFillDest);
  return _promiseCopyTask(src, dest);
}

function _copyThridParty (generator, bowerCopyConfig)
{ 
  var libConfigJSON = fs.readJsonSync(generator.destinationPath(bowerCopyConfig.dest, '..', bowerCopyConfig.pathConfig));
  var libConfig = libConfigJSON.libs; 
  var src, dest;
  var promiseArray = [];

  for (var prop in libConfig)
  {
    var jsLib = libConfig[prop];
    if (jsLib.bower)
    {  
      if(jsLib.devFiles || jsLib.releaseFiles)
      {
        promiseArray.concat(_promiseArrayFileList(generator, jsLib.devFiles, jsLib.devPath, bowerCopyConfig));
        promiseArray.concat(_promiseArrayFileList(generator, jsLib.releaseFiles, jsLib.releasePath, bowerCopyConfig));
      }
      else
      {  
        var libName = _getLibNameFromDir(generator, jsLib.devPath, prop);
        src = _getBowerLibPath(generator, libName);   
        dest = jsLib.devPath;
        dest = generator.destinationPath(bowerCopyConfig.dest, dest.split(path.posix.sep)[0]);
        fs.ensureDirSync(dest); 

        var srcFileNames = _getLibFileNames(generator, src);
        var destFileNames = _getDestFileNames(jsLib);
        if(!srcFileNames){
          srcFileNames = destFileNames;
        }
        promiseArray.push(_promiseCopyTask(path.join(src, srcFileNames.dev), path.join(dest, destFileNames.dev)));
        promiseArray.push(_promiseCopyTask(path.join(src, srcFileNames.release), path.join(dest, destFileNames.release)));
      }     
    }
  }

  return promiseArray;
}

function _getVersions(generator) 
{
  var versions =
  {
    jetVersion : _getVersionFromBower(generator, "oraclejet"),
    jqueryVersion : _getVersionFromBower(generator, "jquery"),
    jqueryUIVersion : _getVersionFromBower(generator, "jquery-ui"),
    es6PromiseVersion : _getVersionFromBower(generator, "es6-promise"),
    hammerVersion : _getVersionFromBower(generator, "hammerjs"),
    knockoutVersion : _getVersionFromBower(generator, "knockout")
  }; 

  return versions;
}


function _getVersionFromBower(generator, libName)
{
  return _getBowerJSON(generator, libName).version;
}

function _getCssPlatformPath(platform)
{
  if(platform)
  {
    return 'alta-' + platform;
  }
  else
  {
    return 'alta';
  }
}

function _promiseCopyTask(src, dest)
{
  return new Promise((resolve, reject) => 
  {
    fs.copy(src, dest, {clobber:true}, (err)=>
    {
      if(err) reject(err);
      resolve();
    });
  });
}

function _getLibNameFromDir(generator, dir, prop)
{
  var libName = dir.split(path.posix.sep)[0];
  var bowerPath = generator.destinationPath("bower_components/" + libName + "/bower.json");
  var bowerPathDot = generator.destinationPath("bower_components/" + libName + "/.bower.json");
  if(fs.existsSync(bowerPath) || fs.existsSync(bowerPathDot))
  {
    return libName;
  }
  else
  {
    libName = prop;
    var bowerPath = generator.destinationPath("bower_components/" + libName + "/bower.json");
    var bowerPathDot = generator.destinationPath("bower_components/" + libName + "/.bower.json");
    if(fs.existsSync(bowerPath) || fs.existsSync(bowerPathDot))
    {
      return libName;
    }
    else
    {
      return generator.env.error(new Error("Path name for " + prop + " incorrect please check your json config file"));
    }
  }  
}

function _getBowerLibPath(generator, libName)
{
  var bowerJSON = _getBowerJSON(generator, libName);
  var libPath = generator.destinationPath("bower_components" ,libName);
  if(bowerJSON.main)
  {
    var mainPath =  Array.isArray(bowerJSON.main) ? bowerJSON.main[0] : bowerJSON.main;
    return path.join(libPath, mainPath, '../');
  }
  else if(fs.existsSync(path.join(libPath, 'dist')))
  {
    return path.join(libPath, 'dist');
  }
  else if(fs.existsSync(path.join(libPath)))
  {
    return libPath;
  }
  else
  {
    generator.env.error(new Error("Bower component name missing: " + libName));
  }
}

function _getBowerJSON(generator, libName)
{
  var bowerPath = generator.destinationPath(path.join("bower_components", libName, "bower.json"));
  var bowerPathDot = generator.destinationPath(path.join("bower_components", libName, ".bower.json"));
  if(fs.existsSync(bowerPath))
  {
    //do nothing
  }
  else if(fs.existsSync(bowerPathDot))
  {
    bowerPath = bowerPathDot;
  }
  else
  {
    generator.env.error(new Error("bower.json file missing for " + libName));
  }

  var bowerJSON = fs.readJsonSync(bowerPath);
  if (bowerJSON.version)
  {
    return bowerJSON;
  }
  else
  {
    // In case some packages do not have a version string, use .bower.json which  is created by bower

    bowerJSON = fs.readJsonSync(bowerPathDot);
    if(bowerJSON.version) 
    {

      return bowerJSON;
    }
    else
    {
      generator.env.error(new Error("bower.json file for " + libName + " doen't have version property"));
    }
  }
  
}

function _getDestFileNames(jsLib)
{
  var dev = _getFormattedFileName(jsLib.devPath);
  var release = _getFormattedFileName(jsLib.releasePath);
  return {dev: dev, release: release};
}

function _getFormattedFileName(name)
{
  name = name.split(path.posix.sep);
  name = name[name.length -1];
  return _addJsExtension(name);
}

function _addJsExtension(name)
{
  return (path.extname(name) === '.js') ? name: name + '.js';
}

function _getLibFileNames(generator, dir)
{
  var devResult = [];
  var releaseResult = [];
  var undecided = [];
  var fileNames = fs.readdirSync(generator.destinationPath(dir));

  var jsFileCount = 0;

  for (var file of fileNames)
  {
    if(path.extname(file) === '.js')
    {
      if(_isDevFileName(file))
      {
        devResult.push(file);
      }  
      else if(_isReleaseFileName(file))
      {
        releaseResult.push(file);
      }
      else
      {
        undecided.push(file);
      }
    } 
  }

  if(devResult.length === 1 && releaseResult.length === 1)
  {
    return {dev: devResult[0], release:releaseResult[0]};
  }
  else if (devResult.length === 1 && releaseResult.length === 0 && undecided.length === 1)
  {
    return {dev: devResult[0], release:undecided[0]};
  }
  else if (devResult.length === 0 && releaseResult.length === 1 && undecided.length === 1)
  {
    return {dev: undecided[0], release:releaseResult[0]};
  }
  else if(devResult.length === 0 && releaseResult.length === 0 && undecided.length === 1)
  {
    return {dev: undecided[0], release:undecided[0]};
  }
  else
  {
    return undefined;
  }
}

function _isReleaseFileName(file)
{
  return /\.min\.|\.minified\.|release|\.min|min\./.test(file);
}

function _isDevFileName(file)
{
  return /debug/.test(file);
}

function _promiseArrayFileList (generator, fileList, destPath, bowerCopyConfig)
{
  var copyTasks = [];
  for(var file of fileList)
  {
    var src, dest;

    if(_isObject(file)){
      src = generator.destinationPath(bowerCopyConfig.bowerDir, file.src);
      src = _addJsExtension(src);
      dest = generator.destinationPath(bowerCopyConfig.dest, destPath, _getFormattedFileName(file.newName));
    }
    else{
      src = generator.destinationPath(bowerCopyConfig.bowerDir, file);
      src = _addJsExtension(src);
      dest = generator.destinationPath(bowerCopyConfig.dest, destPath, _getFormattedFileName(file));
    }

    copyTasks.push(_promiseCopyTask(src, dest));
  }
  return copyTasks;
}

function _isObject(obj) {
  return obj === Object(obj);
}