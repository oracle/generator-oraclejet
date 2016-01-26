/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * dialog_core.js
 */

(function($) {

  module("test2: dialog");

  //
  // verify dialog create event is fired
  //
  test("create event", function() {

    expect(2);

    var element = $("<div>").appendTo("#qunit-fixture");

    var actualEvents = [];
    function eventCaptureCb(event) {
      actualEvents.push(event.type);
    };

    element.on("ojcreate", eventCaptureCb);
    element.ojDialog({initialVisibility: 'show'});

    strictEqual(actualEvents.length, 1, "create event count");
    strictEqual(actualEvents[0], "ojcreate", "create event");

    element.off("ojcreate", eventCaptureCb);
    element.ojDialog("destroy");
    element.remove();
  });

  //
  // Focus testing of two dialogs.
  //
  test("focus", function() {

    expect(2);

    var element = $("<div>").appendTo("#qunit-fixture")
                            .ojDialog({initialVisibility: 'hide'});
    var other = $("<div>").appendTo("#qunit-fixture")
                          .ojDialog({initialVisibility: 'hide'});

    element.one("ojfocus", function() {
      ok(true, "focus on open");
    });

    element.ojDialog("open");

    other.one("ojfocus", function() {
      ok(true, "other has focus");
    });

    other.ojDialog("open");
    other.ojDialog("destroy");
    other.remove();

    element.ojDialog("destroy");
    element.remove();
  });




})(jQuery);























