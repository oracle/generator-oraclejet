/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

requirejs.config(
{
  // Path mappings for the logical module names
  paths:
  //injector:mainReleasePaths
  {
    "knockout": "libs/knockout/knockout-3.4.0.debug",
    "jquery": "libs/jquery/jquery-2.1.3",
    "jqueryui-amd": "libs/jquery/jqueryui-amd-1.11.4",
    "promise": "libs/es6-promise/promise-1.0.0",
    "hammerjs": "libs/hammer/hammer-2.0.4",
    "ojdnd": "libs/dnd-polyfill/dnd-polyfill-1.0.0",
    "ojs": "libs/oj/v2.0.2/debug",
    "ojL10n": "libs/oj/v2.0.2/ojL10n",
    "ojtranslations": "libs/oj/v2.0.2/resources",
    "knockout-amd-helpers": "libs/knockout/knockout-amd-helpers",
    "text": "libs/require/text",
    "signals": "libs/js-signals/signals"
  }
  //endinjector
  ,
  // Shim configurations for modules that do not expose AMD
  shim:
  {
    "jquery":
    {
      exports: ["jQuery", "$"]
    }
  }
}
);

require(["ojs/ojcore", "knockout", "jquery", "ojs/ojknockout"],
  function(oj, ko, $)
  {
    function MainViewModel()
    {
      var self = this;
      self.titleLabel = ko.observable("JET Blank Template");
      self.copyright = ko.observable("Company Name © 2015");
    };

    $(document).ready(function()
    {
      ko.applyBindings(new MainViewModel(), document.getElementById("mainContent"));
    });
  }
);
