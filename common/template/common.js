/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const graphics = require('../../hybrid/graphics');

module.exports =
{
  handle: function _handle(baseTemplateHandler) {
    return new Promise((resolve, reject) => {
      baseTemplateHandler
        .then((generator) => {
          const common = generator.templatePath('common');
          const commonDest = generator.destinationPath(`${generator.appDir}/`);

          fs.copySync(common, commonDest, { filter(file) {
            return (file.indexOf(`${graphics.PATH + path.sep}screen`) === -1) &&
                                       (file.indexOf(`${graphics.PATH + path.sep}icon`) === -1);
          } });
          // copySync filter doesn't handle directories
          fs.removeSync(commonDest + graphics.PATH);

          resolve(generator);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
