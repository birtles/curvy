define(['stroke-parser'], function(StrokeParser) {
  "use strict";

  QUnit.module('Parsing');

  // stroke-widths-values

  test('stroke-widths-values: parse values', function() {
    var result =
      StrokeParser.parseStrokeWidthsValues("1px, 30em , 50% ,2.3mm,0, 5ex");
    var isArray = Array.isArray(result);
    ok(isArray, "parses width values list");
    if (!isArray)
      return;
    equal(result.length, 6, "gets correct number of widths");
    deepEqual(result[0], { left: { value: 1, unit: "px" }, right: null },
              "parses pixel lengths");
    deepEqual(result[1], { left: { value: 30, unit: "em" }, right: null },
              "parses em lengths");
    deepEqual(result[2], { left: { value: 50, unit: "%" }, right: null },
              "parses percentages");
    deepEqual(result[3], { left: { value: 2.3, unit: "mm" }, right: null },
              "parses seg lengths");
    deepEqual(result[4], { left: { value: 0, unit: "" }, right: null },
              "parses 0 values");
    deepEqual(result[5], { left: { value: 5, unit: "ex" }, right: null },
              "parses ex lengths");
  });

  test('stroke-widths-values: parse asymmetric values', function() {
    var result =
      StrokeParser.parseStrokeWidthsValues(
        "1px/30em , 50%  /  2.3mm,0,1cm/ 0");
    var isArray = Array.isArray(result);
    ok(isArray, "parses width values list");
    if (!isArray)
      return;
    equal(result.length, 4, "gets correct number of widths");
    deepEqual(result[0],
              { left: { value: 1, unit: "px" },
                right: { value: 30, unit: "em" } },
              "parses asymmetric values");
    deepEqual(result[1],
              { left: { value: 50, unit: "%" },
                right: { value: 2.3, unit: "mm" } },
              "parses asymmetric values with spaces");
    deepEqual(result[2], { left: { value: 0, unit: "" }, right: null },
              "parses symmetric values amidst asymmetric values");
    deepEqual(result[3],
              { left: { value: 1, unit: "cm" },
                right: { value: 0, unit: "" } },
              "parses zero in asymmetric value");
  });

  test('stroke-widths-values: reject bad asymmetric values', function() {
    strictEqual(StrokeParser.parseStrokeWidthsValues("1px/"),
                null, "rejects stray trailing slash");
    strictEqual(StrokeParser.parseStrokeWidthsValues("/1px"),
                null, "rejects stray leading slash");
    strictEqual(StrokeParser.parseStrokeWidthsValues("/1px/"),
                null, "rejects stray leading and trailing slash");
    strictEqual(StrokeParser.parseStrokeWidthsValues("/"),
                null, "rejects lonely slash");
    strictEqual(StrokeParser.parseStrokeWidthsValues("1px/1px/1px"),
                null, "rejects too many widths");
  });

  test('stroke-widths-values: require commas', function() {
    strictEqual(StrokeParser.parseStrokeWidthsValues("1px 30em"),
                null, "rejects list without commas - 2 elements");
    strictEqual(StrokeParser.parseStrokeWidthsValues("1px 30em 5px"),
                null, "rejects list without commas - 3 elements");
  });

  test('stroke-widths-values: require lengths', function() {
    strictEqual(StrokeParser.parseStrokeWidthsValues("abc"),
                null, "rejects string");
    strictEqual(StrokeParser.parseStrokeWidthsValues("12px, abc"),
                null, "rejects string in list");
    strictEqual(StrokeParser.parseStrokeWidthsValues("12"),
                null, "rejects non-zero plain numbers");
    strictEqual(StrokeParser.parseStrokeWidthsValues("4em, 12"),
                null, "rejects non-zero plain numbers in list");
  });

  test('stroke-widths-values: require valid units', function() {
    strictEqual(StrokeParser.parseStrokeWidthsValues("12km"),
                null, "rejects bad units");
  });

  test('stroke-widths-values: reject seg units', function() {
    strictEqual(StrokeParser.parseStrokeWidthsValues("12seg"),
                null, "rejects seg units");
  });

  test('stroke-widths-values: reject bad syntax', function() {
    strictEqual(StrokeParser.parseStrokeWidthsValues("1!"),
                null, "rejects bad syntax");
  });

  test('stroke-widths-values: accept empty string', function() {
    var result = StrokeParser.parseStrokeWidthsValues("");
    ok(Array.isArray(result) && result.length === 0, "parses empty string");
    result = StrokeParser.parseStrokeWidthsValues("   ");
    ok(Array.isArray(result) && result.length === 0,
       "parses whitespace only string");
  });

  // stroke-widths-positions

  test('stroke-widths-positions: parse values', function() {
    // This is most the same code as for stroke-widths-values and is tested
    // above. The only really difference is seg units are allowed here
    var result =
      StrokeParser.parseStrokeWidthsPositions("0,10% , 1.2seg");
    var isArray = Array.isArray(result);
    ok(isArray, "parses width positions list");
    if (!isArray)
      return;
    equal(result.length, 3, "gets correct number of width positions");
    deepEqual(result[0], { value: 0, unit: "" }, "parses 0 values");
    deepEqual(result[1], { value: 10, unit: "%" }, "parses em lengths");
    deepEqual(result[2], { value: 1.2, unit: "seg" }, "parses seg lengths");
  });

  // stroke-widths-repeat

  test('stroke-widths-repeat: parse values', function() {
    strictEqual(StrokeParser.parseStrokeWidthsRepeat("repeat"),
                StrokeParser.RepeatMode.Repeat,
                "parses stroke-widths-repeat: repeat");
    strictEqual(StrokeParser.parseStrokeWidthsRepeat("no-repeat"),
                StrokeParser.RepeatMode.NoRepeat,
                "parses stroke-widths-repeat: no-repeat");
    strictEqual(StrokeParser.parseStrokeWidthsRepeat(""),
                null, "rejects stroke-widths-repeat: (empty string)");
    strictEqual(StrokeParser.parseStrokeWidthsRepeat("repat"),
                null, "rejects stroke-widths-repeat: repat");
    // We deliberately don't test for whitespace stripping since I'm not sure
    // what we should do there. Last time the SVGWG looked into it, I think HTML
    // rejects enum values with leading/trailing whitespace.
  });

  // stroke-widths

  test('stroke-widths: parse values', function() {
    var result = StrokeParser.parseStrokeWidths(
      "1px 50%, 50% 2.3seg ,2.3mm,0 repeat");
    var isObject = typeof result === "object" && result !== null;
    ok(isObject, "parses widths shorthand");
    if (!isObject)
      return;
    equal(result.widths.length, 4, "gets correct number of widths");
    var widths = result.widths;
    deepEqual(widths[0], { left: { value: 1, unit: "px" },
                           right: null,
                           position: { value: 50, unit: "%" } },
              "parses width and position pair");
    deepEqual(widths[1], { left: { value: 50, unit: "%" },
                           right: null,
                           position: { value: 2.3, unit: "seg" } },
              "parses width and position pair with seg unit");
    deepEqual(widths[2], { left: { value: 2.3, unit: "mm" },
                           right: null,
                           position: null },
              "parses width only");
    deepEqual(widths[3], { left: { value: 0, unit: "" },
                           right: null,
                           position: null },
              "parses width only with zero value");
    equal(result.repeatMode, StrokeParser.RepeatMode.Repeat,
          "gets repeat mode");
  });

  test('stroke-widths: parse asymmetric values', function() {
    var result = StrokeParser.parseStrokeWidths(
      "1px/50%, 50%/20px 2.3seg ,0 / 2.3mm  12px repeat");
    var isObject = typeof result === "object" && result !== null;
    ok(isObject, "parses widths shorthand");
    if (!isObject)
      return;
    equal(result.widths.length, 3, "gets correct number of widths");
    var widths = result.widths;
    deepEqual(widths[0], { left: { value: 1, unit: "px" },
                           right: { value: 50, unit: "%" },
                           position: null },
              "parses asymmetric width");
    deepEqual(widths[1], { left: { value: 50, unit: "%" },
                           right: { value: 20, unit: "px" },
                           position: { value: 2.3, unit: "seg" } },
              "parses asymmetric width with position with seg unit");
    deepEqual(widths[2], { left: { value: 0, unit: "" },
                           right: { value: 2.3, unit: "mm" },
                           position: { value: 12, unit: "px" } },
              "parses asymmetric width with spaces and no unit");
    equal(result.repeatMode, StrokeParser.RepeatMode.Repeat,
          "gets repeat mode");
  });

  test('stroke-widths: single value', function() {
    deepEqual(StrokeParser.parseStrokeWidths("1px 30em no-repeat"),
              { repeatMode: StrokeParser.RepeatMode.NoRepeat,
                widths: [ { left: { value: 1, unit: "px" },
                            right: null,
                            position: { value: 30, unit: "em" } } ] },
              "parses list with single width-position pair and repeat mode");
    deepEqual(StrokeParser.parseStrokeWidths("1px 30em"),
              { repeatMode: null,
                widths: [ { left: { value: 1, unit: "px" },
                            right: null,
                            position: { value: 30, unit: "em" } } ] },
              "parses list with single width-position pair");
    deepEqual(StrokeParser.parseStrokeWidths("7px"),
              { repeatMode: null,
                widths: [ { left: { value: 7, unit: "px" },
                            right: null,
                            position: null } ] },
              "parses list with single width");
    deepEqual(StrokeParser.parseStrokeWidths("0"),
              { repeatMode: null,
                widths: [ { left: { value: 0, unit: "" },
                            right: null,
                            position: null } ] },
              "parses list with single 0 width");
    deepEqual(StrokeParser.parseStrokeWidths("repeat"),
              { repeatMode: StrokeParser.RepeatMode.Repeat,
                widths: [ ] },
              "parses list with single repeat value");
    deepEqual(StrokeParser.parseStrokeWidths("7px  no-repeat"),
              { repeatMode: StrokeParser.RepeatMode.NoRepeat,
                widths: [ { left: { value: 7, unit: "px" },
                            right: null,
                            position: null } ] },
              "parses list with single width and repeat mode");
    deepEqual(StrokeParser.parseStrokeWidths("7px /1px  repeat"),
              { repeatMode: StrokeParser.RepeatMode.Repeat,
                widths: [ { left: { value: 7, unit: "px" },
                            right: { value: 1, unit: "px" },
                            position: null } ] },
              "parses list with single asymmetric width and repeat mode");
    deepEqual(StrokeParser.parseStrokeWidths("7px /1px"),
              { repeatMode: null,
                widths: [ { left: { value: 7, unit: "px" },
                            right: { value: 1, unit: "px" },
                            position: null } ] },
              "parses list with single asymmetric width and no repeat mode");
  });

  test('stroke-widths: empty string', function() {
    deepEqual(StrokeParser.parseStrokeWidths(""),
              { repeatMode: null, widths: [ ] },
              "parses empty string");
    deepEqual(StrokeParser.parseStrokeWidths("   "),
              { repeatMode: null, widths: [ ] },
              "parses whitespace string");
  });

  test('stroke-widths: require commas', function() {
    strictEqual(StrokeParser.parseStrokeWidths("1px 30em 2px"),
                null, "rejects list without commas");
    strictEqual(StrokeParser.parseStrokeWidths("1px 30em 2px repeat"),
                null, "rejects list without commas");
  });

  test('stroke-widths: double space in pair', function() {
    deepEqual(StrokeParser.parseStrokeWidths("1cm  30seg  no-repeat"),
              { repeatMode: StrokeParser.RepeatMode.NoRepeat,
                widths: [ { left: { value: 1, unit: "cm" },
                            right: null,
                            position: { value: 30, unit: "seg" } } ] },
              "parses width-position pair with double space");
  });

  test('stroke-widths: seg value alone', function() {
    strictEqual(StrokeParser.parseStrokeWidths("2seg"),
                null, "rejects seg value alone");
    strictEqual(StrokeParser.parseStrokeWidths("1px/2seg"),
                null, "rejects seg value in asymmetric pair");
    strictEqual(StrokeParser.parseStrokeWidths("1seg/2px"),
                null, "rejects seg value in start of asymmetric pair");
  });

  test('stroke-widths: bad syntax', function() {
    strictEqual(StrokeParser.parseStrokeWidths("1cm 3px, 4cm 5!"),
                null, "rejects bad syntax");
  });
});
