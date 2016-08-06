/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

module.exports = 
{
 	getConfig: function _getConfig(versions, cordovaDirectory, appSrcDirectory)
 	{
	 	var bowerCopyConfig = 
	 	{
		  src: 'bower_components',
		  dest: appSrcDirectory + '/js/libs',
		  ojSrcPrefix : 'bower_components/oraclejet/dist/',
		  cssDestPrefix : 'themes/alta',
		  cssDestPostfix : '',
		  commonCssDestPostfix : 'css/libs/alta/v' + versions.jetVersion + '/common',
		  jsSrcPrefix: 'js/libs/oj',
		  jsDest: '/oj/v' + versions.jetVersion,
		  dndPolySrcPrefix: '/js/libs/dnd-polyfill', 
		  dndPolyFillDest: '/dnd-polyfill', 
		  pathConfig:'main-release-paths.json',
		  bowerDir : 'bower_components',
		  requireJsSrc : 'requirejs/require.js',
		  requireJsDest : 'require/require.js'
		};

		return bowerCopyConfig;
 	}
}