/**
  Copyright (c) 2015, 2016, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

var admzip = require('adm-zip');
var request = require('request');

module.exports = function(url) 
{
  // fetches the zip file
  return new Promise(function(resolve, reject) 
  {
    var data = [];
    var dataLen = 0;
      
    request.get({url: url, encoding: null}).on('error', function(err)
    {
        reject(err);
    }).on('data', function(block)
    {
        data.push(block);
        dataLen += block.length;
    }).on('end', function(err, resp, body)
    {
        if (err) {
            reject(err);
        }          
        var buf = new Buffer(dataLen);

        for (var i=0, len = data.length, pos = 0; i < len; i++) 
        { 
            data[i].copy(buf, pos); 
            pos += data[i].length; 
        } 

        try 
        {
          var zip = new admzip(buf);
          resolve(zip);
        }
        catch (e)
        {
          reject(e);
          return;
        }
    });
  });
};
