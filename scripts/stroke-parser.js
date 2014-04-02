define(["css-value"], function(parseCSSValue) {
  return {
    RepeatMode: {
      NoRepeat: 0,
      Repeat: 1
    },
    parseStrokeWidthsValues: function(str) {
      var result = parseCSSValue(str);
      return result.map(function(parsedValue) {
        return { unit: parsedValue.unit, value: parsedValue.value };
      });
    },
    parseStrokeWidthsPositions: function(str) {
    },
    parseStrokeWidthsRepeat: function(str) {
    },
    parseStrokeWidths: function(str) {
    }
  };
});
