define(['compute-widths'], function(computeWidths) {

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var svgRoot,
      pathElem;

  QUnit.module('Compute widths', {
    setup: function() {
      svgRoot  = document.createElementNS(SVG_NS, 'svg');
      pathElem = document.createElementNS(SVG_NS, 'path');
      pathElem.setAttribute("stroke-width", "7px");
      svgRoot.appendChild(pathElem);
      document.body.appendChild(svgRoot);
    },
    teardown: function() {
      document.body.removeChild(svgRoot);
      svgRoot  = undefined;
      pathElem = undefined;
    }
  });

  function compareWidths(expected, desc) {
    deepEqual(computeWidths(pathElem),
              { widths: expected.map(function(item) {
                  return { offset: item[0], left: item[1], right: item[2] };
                }),
                parseErrors: [] },
              desc);
  }

  function compareWidthsRough(expected, desc) {
    var round = function(val) {
      return parseFloat(val.toFixed(4));
    };
    var approximateWidths = function(widths) {
      return widths.map(function(width) {
               return { left: round(width.left),
                        right: round(width.right),
                        offset: round(width.offset) };
             });
    };

    var actual = computeWidths(pathElem);
    actual.widths = approximateWidths(actual.widths);
    var expected =
      { widths: approximateWidths(expected.map(function(item) {
                  return { offset: item[0], left: item[1], right: item[2] };
                 })),
        parseErrors: [] };
    deepEqual(actual, expected, desc);
  }

  test('Nothing specified', function() {
    compareWidths([ [ 0, 7, 7 ], [ 1, 7, 7 ] ], 'Nothing specified');
  });

  test('Parse errors', function() {
    pathElem.setAttribute("stroke-widths", "abc");
    deepEqual(computeWidths(pathElem),
              { widths: [ { offset: 0, left: 7, right: 7 },
                          { offset: 1, left: 7, right: 7 } ],
                parseErrors: [ "stroke-widths" ] },
              "gets parse error for stroke-widths");
    pathElem.setAttribute("stroke-widths-values", "abc");
    deepEqual(computeWidths(pathElem),
              { widths: [ { offset: 0, left: 7, right: 7 },
                          { offset: 1, left: 7, right: 7 } ],
                parseErrors: [ "stroke-widths-values", "stroke-widths" ] },
              "gets parse error for stroke-widths and stroke-widths-values");
  });

  test('stroke-widths-values only', function () {
    // Single value
    pathElem.setAttribute("stroke-widths-values", "10px");
    compareWidths([ [ 0, 10, 10 ], [ 1, 10, 10 ] ],
                  'stroke-widths-values: 10px');

    // Two values
    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    compareWidths([ [ 0, 10, 10 ], [ 1, 20, 20 ] ],
                  'stroke-widths-values: 10px 20px');

    // Three values
    pathElem.setAttribute("stroke-widths-values", "10px, 20px, 30px");
    compareWidths([ [ 0, 10, 10 ], [ 0.5, 20, 20 ], [ 1, 30, 30 ] ],
                  'stroke-widths-values: 10px 20px 30px');

    // Single value, asymmetric
    pathElem.setAttribute("stroke-widths-values", "10px / 20px");
    compareWidths([ [ 0, 10, 20 ], [ 1, 10, 20 ] ],
                  'stroke-widths-values: 10px / 20px');

    // Two values, asymmetric
    pathElem.setAttribute("stroke-widths-values", "10px / 20px, 30px / 40px");
    compareWidths([ [ 0, 10, 20 ], [ 1, 30, 40 ] ],
                  'stroke-widths-values: 10px / 20px, 30px / 40px');

    // Two values, one asymmetric, one symmetric
    pathElem.setAttribute("stroke-widths-values", "10px / 20px, 30px");
    compareWidths([ [ 0, 10, 20 ], [ 1, 30, 30 ] ],
                  'stroke-widths-values: 10px / 20px, 30px');
  });

  test('stroke-widths-positions only', function () {
    pathElem.setAttribute("stroke-widths-positions", "10px, 20px");
    compareWidths([ [ 0, 7, 7 ], [ 1, 7, 7 ] ],
                  'stroke-widths-positions: 10px, 20px');
  });

  test('stroke-widths-repeat only', function () {
    pathElem.setAttribute("stroke-widths-repeat", "no-repeat");
    compareWidths([ [ 0, 7, 7 ], [ 1, 7, 7 ] ],
                  'stroke-widths-repeat: no-repeat');
  });

  test('stroke-widths-values and stroke-widths-positions, equal length',
  function() {
    pathElem.setAttribute("stroke-widths-values", "10px");
    pathElem.setAttribute("stroke-widths-positions", "50%");
    compareWidths([ [ 0, 10, 10 ], [ 1, 10, 10 ] ],
                  'stroke-widths-values: 10px; stroke-widths-positions: 50%');

    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    pathElem.setAttribute("stroke-widths-positions", "50%, 80%");
    compareWidths([ [ 0, 10, 10 ], [ 0.5, 10, 10 ], [ 0.8, 20, 20 ],
                    [ 1, 20, 20 ] ],
                  'stroke-widths-values: 10px, 20px; ' +
                  'stroke-widths-positions: 50%, 80%');

    pathElem.setAttribute("stroke-widths-values", "10px, 20px, 30px");
    pathElem.setAttribute("stroke-widths-positions", "50%, 80%, 120%");
    compareWidths([ [ 0, 10, 10 ], [ 0.5, 10, 10 ], [ 0.8, 20, 20 ],
                    [ 1.2, 30, 30 ] ],
                  'stroke-widths-values: 10px, 20px, 30px; ' +
                  'stroke-widths-positions: 50%, 80%, 120%');
  });

  test('Less stroke-widths-values than stroke-widths-positions', function() {
    // Single value
    pathElem.setAttribute("stroke-widths-values", "10px");
    pathElem.setAttribute("stroke-widths-positions", "50%, 100%");
    compareWidths([ [ 0, 10, 10 ], [ 1, 10, 10 ] ],
                  'stroke-widths-values: 10px; ' +
                  'stroke-widths-positions: 50%, 100%');

    // Two values
    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    pathElem.setAttribute("stroke-widths-positions", "50%, 80%, 90%");
    compareWidths([ [ 0, 10, 10 ], [ 0.5, 10, 10 ], [ 0.8, 20, 20 ],
                    [ 1, 20, 20 ] ],
                  'stroke-widths-values: 10px, 20px; ' +
                  'stroke-widths-positions: 50%, 80%, 90%');
  });

  test('Less stroke-widths-positions than stroke-widths-values', function() {
    pathElem.setAttribute("stroke-widths-values", "10px, 20px, 30px");
    pathElem.setAttribute("stroke-widths-positions", "50%");
    compareWidths([ [ 0, 10, 10 ], [ 0.5, 10, 10 ],
                    [ 0.75, 20, 20 ], [ 1.0, 30, 30 ] ],
                  'stroke-widths-values: 10px, 20px, 30px; ' +
                  'stroke-widths-positions: 50%');

    // Final value > 100
    pathElem.setAttribute("stroke-widths-values", "10px, 20px, 30px");
    pathElem.setAttribute("stroke-widths-positions", "50%, 120%");
    compareWidths([ [ 0, 10, 10 ], [ 0.5, 10, 10 ],
                    [ 1.2, 20, 20 ], [ 1.2, 30, 30 ] ],
                  'stroke-widths-values: 10px, 20px, 30px; ' +
                  'stroke-widths-positions: 50%, 120%');
  });

  test('Repeating patterns', function() {
    // Starting at 0
    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    pathElem.setAttribute("stroke-widths-positions", "0%, 20%");
    pathElem.setAttribute("stroke-widths-repeat", "repeat");
    compareWidths([ [ 0, 10, 10 ], [ 0.2, 20, 20 ],
                    [ 0.2, 10, 10 ], [ 0.4, 20, 20 ],
                    [ 0.4, 10, 10 ], [ 0.6, 20, 20 ],
                    [ 0.6, 10, 10 ], [ 0.8, 20, 20 ],
                    [ 0.8, 10, 10 ], [ 1.0, 20, 20 ] ],
                  'stroke-widths-values: 10px, 20px; ' +
                  'stroke-widths-positions: 0%, 20%; ' +
                  'stroke-widths-repeat: repeat');

    // Starting at 0 and returning to the same value
    pathElem.setAttribute("stroke-widths-values", "10px, 20px, 10px");
    pathElem.setAttribute("stroke-widths-positions", "0%, 20%, 40%");
    pathElem.setAttribute("stroke-widths-repeat", "repeat");
    compareWidths([ [ 0, 10, 10 ],
                    [ 0.2, 20, 20 ],
                    [ 0.4, 10, 10 ],
                    [ 0.6, 20, 20 ],
                    [ 0.8, 10, 10 ],
                    [ 1.0, 20, 20 ] ],
                  'stroke-widths-values: 10px, 20px, 10px; ' +
                  'stroke-widths-positions: 0%, 20%, 40%; ' +
                  'stroke-widths-repeat: repeat');

    // Starting at 20%
    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    pathElem.setAttribute("stroke-widths-positions", "20%, 40%");
    pathElem.setAttribute("stroke-widths-repeat", "repeat");
    compareWidths([ [ 0, 10, 10 ],
                    [ 0.2, 10, 10 ],
                    [ 0.4, 20, 20 ],
                    [ 0.4, 10, 10 ],
                    [ 0.6, 10, 10 ],
                    [ 0.8, 20, 20 ],
                    [ 0.8, 10, 10 ],
                    [ 1.0, 10, 10 ] ],
                  'stroke-widths-values: 10px, 20px; ' +
                  'stroke-widths-positions: 20%, 40%; ' +
                  'stroke-widths-repeat: repeat');

    // Starting before 0
    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    pathElem.setAttribute("stroke-widths-positions", "-20%, 30%");
    pathElem.setAttribute("stroke-widths-repeat", "repeat");
    compareWidths([ [ -0.2, 10, 10 ],
                    [ 0.3, 20, 20 ], [ 0.3, 10, 10 ],
                    [ 0.8, 20, 20 ], [ 0.8, 10, 10 ],
                    [ 1.3, 20, 20 ] ],
                  'stroke-widths-values: 10px, 20px; ' +
                  'stroke-widths-positions: -20%, 30%; ' +
                  'stroke-widths-repeat: repeat');

    // Single value
    pathElem.setAttribute("stroke-widths-values", "10px");
    pathElem.setAttribute("stroke-widths-positions", "0%");
    pathElem.setAttribute("stroke-widths-repeat", "repeat");
    compareWidths([ [ 0, 10, 10 ], [ 1, 10, 10 ] ],
                  'stroke-widths-values: 10px; ' +
                  'stroke-widths-positions: 0%; ' +
                  'stroke-widths-repeat: repeat');

    // No distance
    pathElem.setAttribute("stroke-widths-values", "10px, 20px");
    pathElem.setAttribute("stroke-widths-positions", "0%, 0%");
    pathElem.setAttribute("stroke-widths-repeat", "repeat");
    compareWidths([ [ 0, 10, 10 ], [ 0, 20, 20 ], [ 1, 20, 20 ] ],
                  'stroke-widths-values: 10px; ' +
                  'stroke-widths-positions: 0%; ' +
                  'stroke-widths-repeat: repeat');
  });

  // Extend positions (by 1seg) when all positions are segments

  test('Shorthand only', function () {
    pathElem.setAttribute("stroke-widths", "1px / 2px 10%, 30px 50%, 50px");
    compareWidths([ [ 0, 1, 2 ],
                    [ 0.1, 1, 2 ],
                    [ 0.5, 30, 30 ],
                    [ 1, 50, 50 ] ],
                  'stroke-widths: 1px / 2px 10%, 30px 50%, 50px');
  });

  // XXX Shorthand and longhand
  // XXX Fill in gaps in positions list in shorthand

  // Convert units
  test('stroke-widths-values unit conversion', function () {
    pathElem.setAttribute("stroke-widths-values",
      "1px / 2cm, 30mm / 4in, 5em / 6ex, 7pt / 8pc, 9%");
    compareWidthsRough([ [ 0, 1, toPx("2cm") ],
                         [ 0.25, toPx("30mm"), toPx("4in") ],
                         [ 0.5, toPx("5em"), toPx("6ex") ],
                         [ 0.75, toPx("7pt"), toPx("8pc") ],
                         [ 1, 0.09 * 7, 0.09 * 7 ] ],
                       'converts stroke width values');
  });

  test('stroke-widths-positions unit conversion', function () {
    // Regular units
    pathElem.setAttribute("d", "M0 0h100");
    pathElem.setAttribute("stroke-widths-values",
      "1px, 1px, 1px, 1px, 1px, 1px, 1px, 1px, 1px");
    pathElem.setAttribute("stroke-widths-positions",
      "1px, 0.2cm, 3mm, 0.4in, 3em, 8ex, 50pt, 5pc, 95%");
    compareWidthsRough([ [ 0, 1, 1 ],
                         [ 0.01, 1, 1 ],
                         [ toPx("0.2cm") / 100, 1, 1 ],
                         [ toPx("3mm") / 100, 1, 1 ],
                         [ toPx("0.4in") / 100, 1, 1 ],
                         [ toPx("3em") / 100, 1, 1 ],
                         [ toPx("8ex") / 100, 1, 1 ],
                         [ toPx("50pt") / 100, 1, 1 ],
                         [ toPx("5pc") / 100, 1, 1 ],
                         [ 0.95, 1, 1 ],
                         [ 1, 1, 1 ] ],
                       'converts stroke position values');

    // Seg units
    pathElem.setAttribute("d", "M0 0h100v50h-50");
    pathElem.setAttribute("stroke-widths-values",
      "1px, 1px, 1px");
    pathElem.setAttribute("stroke-widths-positions",
      "0.5seg, 2seg, 2.5seg");
    compareWidthsRough([ [ 0, 1, 1 ],
                         [ 0.25, 1, 1 ],
                         [ 0.75, 1, 1 ],
                         [ 0.875, 1, 1 ],
                         [ 1, 1, 1 ] ],
                       'converts seg stroke position values');
  });

  /*
  test('stroke-widths unit conversion', function () {
    // XXX
  });
  */

  // Ordering of positions
  test('Position ordering', function () {
    pathElem.setAttribute("stroke-widths-values", "10px, 20px, 30px, 40px");
    pathElem.setAttribute("stroke-widths-positions", "10%, 0%, 40%, 30%");
    compareWidths([ [ 0, 10, 10 ],
                    [ 0.1, 10, 10 ],
                    [ 0.1, 20, 20 ],
                    [ 0.4, 30, 30 ],
                    [ 0.4, 40, 40 ],
                    [ 1, 40, 40 ] ],
                    'puts positions in order');

    // XXX test with the shorthand
  });

  function toPx(str) {
    var rect = document.createElementNS(SVG_NS, "rect");
    svgRoot.appendChild(rect);
    var length = rect.x.baseVal;
    length.valueAsString = str;
    var pxResult = length.value;
    svgRoot.removeChild(rect);
    return pxResult;
  }
});
