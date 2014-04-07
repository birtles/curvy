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

  // stroke-widths-positions and stroke-widths-values
  //  -- extra values

  /*
  test('Shorthand only', function () {
  });

  test('Shorthand and longhand', function () {
  });
  */
});
