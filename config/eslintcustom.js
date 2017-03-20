/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
//
// Custom eslint rules file, used to deal with linbreak-style
//
module.exports = {
    "installedESLint": true,
    "extends": "airbnb-base",
    "plugins": [
    ],
    "rules": {
        "comma-dangle": "off",
        "no-underscore-dangle": "off",
        "vars-on-top": "off",
        "func-names": "off",
//        "linebreak-style": ["warn", "unix"], // currently evaluating this rule in the oraclejet-tooling repos.
        "linebreak-style": ["error", "unix"], // currently evaluating this rule in the oraclejet-tooling repos.
        "no-console" : "off",
        "strict" : "off",
        "import/no-unresolved" : [2, {ignore: ['oraclejet-tooling']}], // since oraclejet-tooling is defined as a url, we need it in the ignore list.
        "no-use-before-define" : ["error", {"functions" : false, "classes" : true}],
        "no-plusplus": ["off", {"allowForLoopAfterthoughts": true }] // allow ++ in loops
    }
};
