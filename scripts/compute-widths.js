define(["stroke-parser", "css-value"], function(StrokeParser, parseCSSValue) {
  "use strict";

  function dashToCamel(str) {
    return str.replace(/-(\w)/g,
      function(match, letter) { return letter.toUpperCase(); })
  }

  function widthsEqual(a, b) {
    return a.left === b.left && a.right === b.right;
  }

  function getEmSize(elem) {
    return getFontSize(elem, "em");
  }

  function getExSize(elem) {
    return getFontSize(elem, "ex");
  }

  function getFontSize(elem, unit) {
    var elem = elem.ownerDocument.documentElement;
    var oldMarginBottom = elem.marginBottom;
    elem.style.marginBottom = "1" + unit;
    var px = parseFloat(window.getComputedStyle(elem).marginBottom);
    elem.style.marginBottom = oldMarginBottom;
    return px;
  }

  function widthToPx(width, pathElem) {
    switch (width.unit) {
      case "px":
        return width.value;

      case "cm":
        return width.value * 96 / 2.54;

      case "mm":
        return width.value * 96 / 2.54 / 10;

      case "in":
        return width.value * 96;

      case "em":
        return width.value * getEmSize(pathElem);

      case "ex":
        return width.value * getExSize(pathElem);

      case "pt":
        return width.value * 96 / 72;

      case "pc":
        return width.value * 96 / 72 * 12;

      case "%":
        return width.value / 100 *
          parseFloat(window.getComputedStyle(pathElem).strokeWidth);

      default:
        return width.value;
    }
  }

  function getNumDrawingSegments(pathElem) {
    var segList = pathElem.pathSegList;
    var numSegments = 0;
    for (var i = 0; i < segList.numberOfItems; i++) {
      var segType = segList.getItem(i).pathSegType;
      if (segType == SVGPathSeg.PATHSEG_MOVETO_ABS ||
          segType == SVGPathSeg.PATHSEG_MOVETO_REL)
        continue;
      numSegments++;
    }
    return numSegments;
  }

  function segmentRefToLength(segmentRef, pathElem) {
    if (segmentRef <= 0)
      return 0;

    var pathClone = pathElem.cloneNode();
    pathClone.setAttribute("d", pathElem.getAttribute("d"));
    var segList = pathClone.pathSegList;
    var segmentIndex = Math.floor(segmentRef);
    var segmentFraction = segmentRef - segmentIndex;

    if (segmentIndex >= getNumDrawingSegments(pathClone)) {
      return pathClone.getTotalLength();
    }

    while (getNumDrawingSegments(pathClone) >
           (segmentFraction == 0 ? segmentIndex : segmentIndex + 1)) {
      segList.removeItem(segList.numberOfItems - 1);
    }
    if (segmentFraction == 0) {
      return pathClone.getTotalLength();
    }

    var lengthWithSegment = 0;
    try {
      lengthWithSegment = pathClone.getTotalLength();
    } catch (e) { }
    segList.removeItem(segList.numberOfItems - 1);
    var lengthWithoutSegment = 0;
    try {
      lengthWithoutSegment = pathClone.getTotalLength();
    } catch (e) { }
    var segmentLength = lengthWithSegment - lengthWithoutSegment;

    return lengthWithoutSegment + segmentFraction * segmentLength;
  }

  function positionToPc(position, pathElem) {
    if (position === null) {
      return null;
    }
    var pathLength = pathElem.hasAttribute("d") ?
                     pathElem.getTotalLength() :
                     0;
    switch (position.unit) {
      case "seg":
        return pathLength ?
               segmentRefToLength(position.value, pathElem) / pathLength :
               0;

      case "%":
        return position.value / 100;

      default:
        return pathLength ? widthToPx(position, pathElem) / pathLength : 0;
    }
  }

  function fillInGaps(positions) {
    if (!positions.length)
      return;

    var getIndexOfNextNonNull = function(startIndex) {
      for (var i = startIndex; i < positions.length; i++) {
        if (positions[i] !== null) {
          return i;
        }
      }
      return null;
    };

    var lowerIndex = getIndexOfNextNonNull(0);
    if (lowerIndex === null)
      lowerIndex = 0;
    if (positions[0] === null)
      positions[0] = Math.min(positions[lowerIndex], 0);

    lowerIndex = 0;
    for (var i = 1; i < positions.length; i++) {
      if (positions[i] !== null) {
        lowerIndex = i;
        continue;
      }
      var lower = positions[lowerIndex];
      var upperIndex = getIndexOfNextNonNull(i + 1);
      if (upperIndex === null) {
        upperIndex = positions.length - 1;
        upper = Math.max(1, lower);
        positions[upperIndex] = upper;
      }
      var upper = positions[upperIndex];
      var items = upperIndex - lowerIndex;
      for (var i = lowerIndex + 1; i < upperIndex; i++) {
        positions[i] = (((i - lowerIndex) / items) * (upper - lower) + lower);
      }
      lowerIndex = upperIndex;
      i = upperIndex + 1;
    }
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
    if (!properties.strokeWidthsValues && !properties.strokeWidths) {
      widths = [ { left: baseStrokeWidth, right: baseStrokeWidth } ];
    } else {
      var widthSource =
        properties.strokeWidthsValues || properties.strokeWidths.widths;
      widthSource.forEach(function(widthValue, index) {
        widths.push({ left:  widthValue.left,
                      right: widthValue.right || widthValue.left });
      });
      positions = properties.strokeWidthsPositions ||
        (properties.strokeWidths ?
         properties.strokeWidths.widths.map(function(width) {
           return width.position;
         }) :
         null);
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
      return { left: widthToPx(cssWidth.left, pathElem),
               right: widthToPx(cssWidth.right, pathElem) };
    });
    var pcPositions = positions.map(function(cssPosition) {
      return positionToPc(cssPosition, pathElem);
    });

    // Extend the positions array to match the length of the widths array
    while (pcPositions.length < pxWidths.length) {
      pcPositions.push(null);
    }
    // If there are extra positions trim them
    if (pxWidths.length < pcPositions.length) {
      pcPositions.splice(pxWidths.length);
    }

    // Fill in null values
    fillInGaps(pcPositions);

    // Clamp positions so they are in ascending order
    var prev = Number.NEGATIVE_INFINITY;
    var pcPositions = pcPositions.map(function(position) {
      prev = Math.max(prev, position);
      return prev;
    });

    // Make sure there is a position at or before 0
    if (pcPositions[0] > 0) {
      pcPositions.unshift(0);
      pxWidths.unshift(pxWidths[0]);
    }

    // Make sure there is a position at or after 1 using the repeat mode if set
    var repeatMode = typeof properties.strokeWidthsRepeat !== "undefined" ?
      properties.strokeWidthsRepeat :
      (properties.strokeWidths && properties.strokeWidths.repeatMode !== null ?
       properties.strokeWidths.repeatMode : StrokeParser.RepeatMode.NoRepeat);
    if (repeatMode === StrokeParser.RepeatMode.Repeat) {
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

    return { widths: combinedWidths,
             parseErrors: parseErrors };
  }
});
