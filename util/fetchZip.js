/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var admzip = require('adm-zip');
var request = require('request');

module.exports = function(url) 
{
  // fetches the zip file

  return new Promise(function(resolve, reject) 
  {
    request.get({url: url, encoding: null}, function(err, resp, body)
      {
        if (err) {
            reject(err);
        }
          
        var zip = null;

        try 
        {
          zip = new admzip(body);
        }
        catch (e)
        {
          reject(e);
          return;
        }
        
        resolve(zip);
      });      
  });
};
