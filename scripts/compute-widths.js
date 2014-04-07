define(["stroke-parser", "css-value"], function(StrokeParser, parseCSSValue) {
  "use strict";

  function dashToCamel(str) {
    return str.replace(/-(\w)/g,
      function(match, letter) { return letter.toUpperCase(); })
  }

  return function(pathElem) {
    var parseErrors = [];

    // Parse parameters
    var properties = {};
    [ "stroke-widths-positions",
      "stroke-widths-values",
      "stroke-widths-repeat",
      "stroke-widths" ].forEach(function(property) {
      var parseFunc =
        StrokeParser[dashToCamel("parse-" + property)].bind(StrokeParser);
      if (pathElem.hasAttribute(property)) {
        var parseResult = parseFunc(pathElem.getAttribute(property));
        if (parseResult !== null) {
          properties[dashToCamel(property)] = parseResult;
        } else {
          parseErrors.push(property);
        }
      }
    });

    // Apply cascade
    var baseStrokeWidth =
      parseCSSValue(window.getComputedStyle(pathElem).strokeWidth)[0];
    var widths = [];
    var positions = [];
    if (!properties.strokeWidthsValues) {
      widths = [ { left: baseStrokeWidth, right: baseStrokeWidth } ];
      positions = [ { value: 0, unit: "%" } ];
    } else {
      properties.strokeWidthsValues.forEach(function(widthValue, index) {
        widths.push({ left:  widthValue.left,
                      right: widthValue.right || widthValue.left });
      });
      positions = properties.strokeWidthsPositions ||
                  Array.apply(null, { length: widths.length }
                  ).map(Function.call,
                    function(index, array) {
                      return { value: index ?
                                      index / (array.length - 1) * 100 :
                                      0,
                               unit: "%" };
                  });
    }

    // If there is only value, ignore the positions
    if (widths.length === 1) {
      positions = [ { value: 0, unit: "%" } ];
    }

    // Apply repeating, list length adjustment

    // Convert values
    var pxWidths = widths.map(function(cssWidth) {
      return { left: cssWidth.left.value,
               right: cssWidth.right.value };
    });
    var pxPositions = positions.map(function(cssPosition) {
      return cssPosition.value / 100;
    });

    // Merge arrays
    var combinedWidths = pxWidths.map(function(pxWidth, index) {
      return { offset: pxPositions[index],
               left: pxWidth.left,
               right: pxWidth.right };
    });

    // Make sure there is a position at or before 0
    var first = combinedWidths[0];
    if (first.offset > 0) {
      combinedWidths.unshift({ left: first.left,
                               right: first.right,
                               offset: 0 });
    }

    // Make sure there is a position at or after 1
    var last = combinedWidths[combinedWidths.length - 1];
    if (last.offset < 1) {
      combinedWidths.push({ left: last.left,
                            right: last.right,
                            offset: 1 });
    }

    return {
              widths: combinedWidths,
              parseErrors: parseErrors
           };
  }
});
