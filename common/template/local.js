/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const Admzip = require('adm-zip');

module.exports = {

  handle: function _handle(yoGenerator, templatePath, destination) {
    return new Promise((resolve, reject) => {
      _copyLocalTemplate(yoGenerator, templatePath, destination)
        .then(() => {
          resolve(yoGenerator);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

function _copyLocalTemplate(yoGenerator, templatePath, destination) {
  return new Promise((resolve, reject) => {
    try {
      if (fs.statSync(templatePath).isDirectory()) {
        fs.copySync(templatePath, destination);
      } else if (path.extname(templatePath) === '.zip') {
        const zip = new Admzip(templatePath);
        zip.extractAllTo(destination, true);
      } else {
        throw new Error(`template path ${templatePath} is not valid`);
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
