define(["stroke-parser", "css-value"], function(StrokeParser, parseCSSValue) {
  "use strict";

  function dashToCamel(str) {
    return str.replace(/-(\w)/g,
      function(match, letter) { return letter.toUpperCase(); })
  }

  function widthsEqual(a, b) {
    return a.left === b.left && a.right === b.right;
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
    } else {
      properties.strokeWidthsValues.forEach(function(widthValue, index) {
        widths.push({ left:  widthValue.left,
                      right: widthValue.right || widthValue.left });
      });
      positions = properties.strokeWidthsPositions;
    }

    // Fill in positions
    if (!positions) {
      positions = [ { value: 0, unit: "%" } ];
    }

    // If there is only value, ignore the positions
    if (widths.length === 1) {
      positions = [ { value: 0, unit: "%" } ];
    }

    // Convert values
    var pxWidths = widths.map(function(cssWidth) {
      return { left: cssWidth.left.value,
               right: cssWidth.right.value };
    });
    var pcPositions = positions.map(function(cssPosition) {
      return parseFloat(cssPosition.value / 100);
    });

    // If there are fewer positions than values, fill them in
    if (pcPositions.length < pxWidths.length) {
      var lower = pcPositions[pcPositions.length - 1];
      var upper = Math.max(lower, 1);
      var items = pxWidths.length - pcPositions.length;
      for (var i = 1; i <= items; i++) {
        pcPositions.push((i / items) * (upper - lower) + lower);
      }
    // If there are extra positions, drop them
    } else if (pxWidths.length < pcPositions.length) {
      pcPositions.splice(pxWidths.length);
    }

    // Make sure there is a position at or before 0
    if (pcPositions[0] > 0) {
      pcPositions.unshift(0);
      pxWidths.unshift(pxWidths[0]);
    }

    // Make sure there is a position at or after 1 using the repeat mode if set
    if (properties.strokeWidthsRepeat === StrokeParser.RepeatMode.Repeat) {
      var listPos = 0;
      var originalListLength = pcPositions.length;
      var patternLength = pcPositions[pcPositions.length - 1] - pcPositions[0];
      var offset = patternLength;
      while (patternLength > 0 && pcPositions[pcPositions.length - 1] < 1) {
        var newPosition =
          parseFloat((offset + pcPositions[listPos]).toFixed(5));

        // Skip identical values
        if (newPosition != pcPositions[pcPositions.length - 1] ||
            !widthsEqual(pxWidths[listPos], pxWidths[pxWidths.length - 1])) {
          pcPositions.push(newPosition);
          pxWidths.push(pxWidths[listPos]);
        }

        listPos++;
        if (listPos >= originalListLength) {
          offset += patternLength;
          listPos = 0;
        }
      }
    }

    // Make sure the last position is 1 or greater (for the case where there is
    // no repeating behavior or the pattern length is 0)
    if (pcPositions[pcPositions.length - 1] < 1) {
      pcPositions.push(1);
      pxWidths.push(pxWidths[pxWidths.length - 1]);
    }

    // Merge arrays
    var combinedWidths = pxWidths.map(function(pxWidth, index) {
      return { offset: pcPositions[index],
               left: pxWidth.left,
               right: pxWidth.right };
    });

    return {
              widths: combinedWidths,
              parseErrors: parseErrors
           };
  }
});
