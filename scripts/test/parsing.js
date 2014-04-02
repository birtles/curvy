define(['stroke-parser'],
  function(StrokeParser) {

  test('stroke-widths-values: parse values', function() {
    var result =
      StrokeParser.parseStrokeWidthsValues("1px, 30em , 50% ,2.3seg,0, 5rem");
    var isArray = Array.isArray(result);
    ok(isArray, "parses width values list");
    if (!isArray)
      return;
    equal(result.length, 6, "gets correct number of widths");
    deepEqual(result[0], { value: 1, unit: "px" }, "parses pixel lengths");
    deepEqual(result[1], { value: 30, unit: "em" }, "parses em lengths");
    deepEqual(result[2], { value: 50, unit: "%" }, "parses percentages");
    deepEqual(result[3], { value: 2.3, unit: "seg" }, "parses seg lengths");
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
});
