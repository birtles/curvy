define(["css-value"], function(parseCSSValue) {
  return {
    RepeatMode: {
      NoRepeat: 0,
      Repeat: 1
    },

    parseStrokeWidthsValues: function(str) {
      var widths = [];
      var parsedOk = parseCSSValue(str).every(function(item, i) {
        if (i % 2 === 1) {
          // Check it is comma-separated
          if (item.type != 'comma')
            return false;
        } else {
          // Check it is a valid length
          if (item.type != "number" ||
              (item.unit == "" && item.value !== 0))
            return false;
          widths.push({ unit: item.unit, value: item.value });
        }
        return true;
      });
      return parsedOk ? widths : null;
    },

    parseStrokeWidthsPositions: function(str) {
    },
    parseStrokeWidthsRepeat: function(str) {
    },
    parseStrokeWidths: function(str) {
    }
  };
});
