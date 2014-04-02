define(['stroke-parser'], function(StrokeParser) {
  "use strict";

  // stroke-widths-values

  test('stroke-widths-values: parse values', function() {
    var result =
      StrokeParser.parseStrokeWidthsValues("1px, 30em , 50% ,2.3mm,0, 5rem");
    var isArray = Array.isArray(result);
    ok(isArray, "parses width values list");
    if (!isArray)
      return;
    equal(result.length, 6, "gets correct number of widths");
    deepEqual(result[0], { value: 1, unit: "px" }, "parses pixel lengths");
    deepEqual(result[1], { value: 30, unit: "em" }, "parses em lengths");
    deepEqual(result[2], { value: 50, unit: "%" }, "parses percentages");
    deepEqual(result[3], { value: 2.3, unit: "mm" }, "parses seg lengths");
    deepEqual(result[4], { value: 0, unit: "" }, "parses 0 values");
    deepEqual(result[5], { value: 5, unit: "rem" }, "parses rem lengths");
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

  // stroke-widths-repeat

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
    deepEqual(widths[0], { width: { value: 1, unit: "px" },
                           position: { value: 50, unit: "%" } },
              "parses width and position pair");
    deepEqual(widths[1], { width: { value: 50, unit: "%" },
                           position: { value: 2.3, unit: "seg" } },
              "parses width and position pair with seg unit");
    deepEqual(widths[2], { width: { value: 2.3, unit: "mm" }, position: null },
              "parses width only");
    deepEqual(widths[3], { width: { value: 0, unit: "" }, position: null },
              "parses width only with zero value");
    equal(result.repeatMode, StrokeParser.RepeatMode.Repeat,
          "gets repeat mode");
  });

  test('stroke-widths: single value', function() {
    deepEqual(StrokeParser.parseStrokeWidths("1px 30em no-repeat"),
              { repeatMode: StrokeParser.RepeatMode.NoRepeat,
                widths: [ { width: { value: 1, unit: "px" },
                            position: { value: 30, unit: "em" } } ] },
              "parses list with single width-position pair and repeat mode");
    deepEqual(StrokeParser.parseStrokeWidths("1px 30em"),
              { repeatMode: null,
                widths: [ { width: { value: 1, unit: "px" },
                            position: { value: 30, unit: "em" } } ] },
              "parses list with single width-position pair");
    deepEqual(StrokeParser.parseStrokeWidths("7px"),
              { repeatMode: null,
                widths: [ { width: { value: 7, unit: "px" },
                            position: null } ] },
              "parses list with single width");
    deepEqual(StrokeParser.parseStrokeWidths("0"),
              { repeatMode: null,
                widths: [ { width: { value: 0, unit: "" },
                            position: null } ] },
              "parses list with single 0 width");
    deepEqual(StrokeParser.parseStrokeWidths("repeat"),
              { repeatMode: StrokeParser.RepeatMode.Repeat,
                widths: [ ] },
              "parses list with single repeat value");
    deepEqual(StrokeParser.parseStrokeWidths("7px  no-repeat"),
              { repeatMode: StrokeParser.RepeatMode.NoRepeat,
                widths: [ { width: { value: 7, unit: "px" },
                            position: null } ] },
              "parses list with single width and repeat mode");
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
                widths: [ { width: { value: 1, unit: "cm" },
                            position: { value: 30, unit: "seg" } } ] },
              "parses width-position pair with double space");
  });

  test('stroke-widths: seg value alone', function() {
    strictEqual(StrokeParser.parseStrokeWidths("2seg"),
                null, "rejects seg value alone");
  });

  test('stroke-widths: bad syntax', function() {
    strictEqual(StrokeParser.parseStrokeWidths("1cm 3px, 4cm 5!"),
                null, "rejects bad syntax");
  });
});
