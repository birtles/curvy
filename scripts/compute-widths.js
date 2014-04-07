define(["stroke-parser"], function(StrokeParser) {
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
      parseFloat(window.getComputedStyle(pathElem).strokeWidth);
    if (properties.strokeWidthsValues) {
      if (properties.strokeWidthsValues.length === 1) {
        properties.strokeWidthsValues.push(properties.strokeWidthsValues[0]);
      }
      properties.strokeWidthsValues.forEach(function(widthValue, index) {
        widths.push(
          { offset: index / (properties.strokeWidthsValues.length - 1),
            left:  widthValue.left.value,
            right: widthValue.right ?
                   widthValue.right.value :
                   widthValue.left.value });
      });
    } else {
      widths = [ { offset: 0, left: baseStrokeWidth, right: baseStrokeWidth },
                 { offset: 1, left: baseStrokeWidth, right: baseStrokeWidth } ];
    }

    // Apply repeating, list length adjustment

    // Convert values

    return {
              widths: widths,
              parseErrors: parseErrors
           };
  }
});
