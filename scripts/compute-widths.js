define(["stroke-parser", "css-value"], function(StrokeParser, parseCSSValue) {
  "use strict";

  function dashToCamel(str) {
    return str.replace(/-(\w)/g,
      function(match, letter) { return letter.toUpperCase(); })
  }

  return function(pathElem) {
    var widths = [];
    var parseErrors = [];

    // Parse parameters
    var properties = {};
    [ "stroke-widths-positions",
      "stroke-widths-values",
      "stroke-widths-repeat",
      "stroke-widths" ].forEach(function(property) {
      var parseFunc = StrokeParser[dashToCamel("parse-" + property)];
      if (pathElem.hasAttribute(property)) {
        var parseResult = parseFunc(pathElem.getAttribute(property));
        if (parseResult) {
          properties[dashToCamel(property)] = parseResult;
        } else {
          parseErrors.push(property);
        }
      }
    });

    // Apply cascade
    var baseStrokeWidth =
      parseCSSValue(window.getComputedStyle(pathElem).strokeWidth)[0];
    if (properties.strokeWidthsValues) {
      if (properties.strokeWidthsValues.length === 1) {
        properties.strokeWidthsValues.push(properties.strokeWidthsValues[0]);
      }
      properties.strokeWidthsValues.forEach(function(widthValue, index) {
        widths.push(
          { offset: index / (properties.strokeWidthsValues.length - 1),
            left:  widthValue.left,
            right: widthValue.right || widthValue.left });
      });
    } else {
      widths = [ { offset: 0, left: baseStrokeWidth, right: baseStrokeWidth },
                 { offset: 1, left: baseStrokeWidth, right: baseStrokeWidth } ];
    }

    // Apply repeating, list length adjustment

    // Convert values
    var pxWidths = widths.map(function(cssWidth) {
      return { offset: cssWidth.offset,
               left: cssWidth.left.value,
               right: cssWidth.right.value };
    });

    return {
              widths: pxWidths,
              parseErrors: parseErrors
           };
  }
});
