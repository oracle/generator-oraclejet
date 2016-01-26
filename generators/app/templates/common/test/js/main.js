/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

define('knockout.global', ['knockout'], function(kno)
{
    window.ko = kno; // Initialize a global 'ko' variable
    return kno;
});

requirejs.config(
{

  paths: {
    'knockout': '../../js/libs/knockout/knockout-3.4.0.debug',
    'jquery': '../../js/libs/jquery/jquery-2.1.3',
    'signals': '../../js/libs/js-signals/dist/signals',
    'text': '../../js/libs/text/text',
    'promise': '../../js/libs/es6-promise/promise',
    'hammerjs': '../../js/libs/hammer/hammer-2.0.4',
    'jqueryui-amd': '../../js/libs/jquery/jqueryui-amd-1.11.4',
    'ojs': '../../js/libs/oj/v2.0.0/debug',
    'ojL10n': '../../js/libs/oj/v2.0.0/ojL10n',
    'ojtranslations': '../../js/libs/oj/v2.0.0/resources',
    'test1':'../test1',
    'test2':'../test2'
  },
    // Shim configurations for modules that do not expose AMD
  shim: {
        'jquery': {
            exports: ['jQuery', '$']
        },
        'knockout': {
            deps: ['jquery' ]
        },
        'test1': {
            deps: ['jquery' , 'knockout', 'ojs/ojcore', 'ojs/ojknockout','ojs/ojinputtext']
        },
        'test2': {
            deps: ['jquery' , 'knockout', 'ojs/ojcore', 'ojs/ojknockout','ojs/ojdialog','ojs/ojbutton']
        }
        
    }    ,
    map: {
        '*': {'knockout': 'knockout.global'}, // All modules referencing 'knockout' will be loading 'knockout.global'
        'knockout.global': {'knockout': 'knockout'} // 'knockout.global' itself will be referencing the original 'knockout'
    }
});

/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout','test1','test2'],
        function(oj, ko, app, $) // this callback gets executed when all required modules are loaded
        {
            QUnit.load();
            QUnit.start();
        }
);
