/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

var http = require('http');
var https = require('https');
var admzip = require('adm-zip');

module.exports = function (url) 
{
  //fetches the zip file

  return new Promise(function (resolve, reject) 
  {
    var httpHandle = /^https.*/.test(url) ? https : http;

    httpHandle.get(url, function (response) 
    {
      var data = [];
      var dataLen = 0;

      response
        .on('data', function (chunk) 
        {

          data.push(chunk);
          dataLen += chunk.length;

        })
        .on('end', function () 
        {

          var buf = new Buffer(dataLen);
          var zip;

          for (var i=0, len = data.length, pos = 0; i < len; i++) 
          { 
            data[i].copy(buf, pos); 
            pos += data[i].length; 
          } 

          try 
          {
            zip = new admzip(buf);
          }
          catch(err)
          {
            return reject(err);
          }

          return resolve(zip);

        });

    });

  });
};
