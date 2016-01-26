/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var fs = require('fs-extra');
var fetchZip = require("../../util/fetchZip");

module.exports = {

  URL_TEMPLATE: {
    "navBar": "http://den00pwq.us.oracle.com:8080/hudson/job/OJET_Build/lastSuccessfulBuild/artifact/apps/components/public_html/public_samples/nojet/OracleJET_QuickStartHybridNavBar.zip",
    "navDrawer": "http://den00pwq.us.oracle.com:8080/hudson/job/OJET_Build/lastSuccessfulBuild/artifact/apps/components/public_html/public_samples/nojet/OracleJET_QuickStartHybridNavDrawer.zip",
    "quickStart": "http://den00pwq.us.oracle.com:8080/hudson/job/OJET_Build/lastSuccessfulBuild/artifact/apps/components/public_html/public_samples/nojet/OracleJET_QuickStartBasic.zip"
  },
  
  handle: function _handle(generator, template, destination) 
  {
    var temp = generator.destinationPath(generator.appDir + "/temp");

    return new Promise(function(resolve, reject) 
    {

      fetchZip(template)
        .then(function (values) 
        {
          _processFetchedTemplateZip(values, temp, destination);
          return resolve(generator);
        })
        .catch(function(err) 
        {
          return reject(err);
        });

    });
  }

};

function _processFetchedTemplateZip(values, temp, destination)
{
  fs.mkdirsSync(temp);

  values.extractAllTo(temp);
  fs.copySync(temp, destination);
  fs.removeSync(temp);
}