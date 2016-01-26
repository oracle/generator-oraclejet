/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
(function( $ ) {

module("test1: text", {
    teardown : function () {
    }
});

test( "base ojInputText", function() {
  expect( 5 );
  var input = $("#textId").ojInputText();
  
  equal(input.attr("type"), "text", "type is text", "ojInputText has type=text");
  ok(input.ojInputText("widget").hasClass("oj-inputtext"), "ojInputText has class oj-text");
  ok(!input.ojInputText("widget").hasClass("oj-disabled"), "ojInputText does not have class oj-disabled");
  
  input.ojInputText("destroy");
  
  input = $("<input type='password'>").ojInputText();
  equal(input.attr("type"), "text", "type is text when set to password", "ojInputText has type=text");
  input.ojInputText("destroy");
  
  input = $("<input type='text' readonly>").ojInputText();
  ok(input.ojInputText("widget").hasClass("oj-read-only"), "ojInputText has class oj-read-only");
  input.ojInputText("destroy");
  
});



})( jQuery );