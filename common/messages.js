/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";

var fs = require("fs-extra");
var path = require("path");

module.exports =
{
  error: function _error(error, task)
  { 
    return _getError(error, task);
  },

  prefixError: function _prefixError(error)
  { 
    return _getPrefixError(error);
  },

  scaffoldComplete: function _scaffoldComplete()
  { 
    return _getScaffoldComplete();
  },

  restoreComplete: function _restoreComplete(invokedByRestore)
  { 
    return _getRestoreComplete(invokedByRestore);
  }, 

  appendJETPrefix: function _appendJETPrefix()
  {
    return _appendSuccessPrefix("");
  }
};

function _getScaffoldComplete()
{
  return _appendSuccessPrefix("Your app structure is generated. Continuing with library install...");
}

function _getRestoreComplete(invokedByRestore)
{
  if (invokedByRestore)
  {
    return _appendSuccessPrefix("Your app restore finished successfully...");
  }
  else
  {
    return _appendSuccessPrefix("Your app is ready! Change to your new app directory and try grunt build and serve...");
  }
}  

function _getPrefixError(error)
{
  if (error !== null && typeof error === "object")
  {
    error.message = _appendErrorPrefix(error.message);
    return error;
  }

  return _appendErrorPrefix(error);
}

function _getError(error, task)
{
  var taskName = task ? "(during " + task +") ":"";
  if (error !== null && typeof error === "object")
  {
    error.message = taskName + error.message;
    return error;
  }

  return taskName + error
}

function _appendSuccessPrefix(message)
{
  return "Oracle JET: " + message;
}

function _appendErrorPrefix(message)
{
  return "Oracle JET Error: " + message;
}
