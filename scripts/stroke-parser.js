define(["css-value"], function(parseCSSValue) {
  var validUnits = [ "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax",
                     "cm", "mm", "in", "px", "pt", "pc",
                     "seg", "%" ];
  return {
    RepeatMode: {
      NoRepeat: 0,
      Repeat: 1
    },

    parseStrokeWidthsValues: function(str) {
      var widths = [];
      try {
        var tokens = parseCSSValue(str.trim());
      } catch(e) {
        return null;
      }
      var parsedOk = tokens.every(function(token, i) {
        if (i % 2 === 1) {
          // Check it is comma-separated
          if (token.type != 'comma')
            return false;
        } else {
          // Check it is a valid length
          if (token.type != "number")
            return false;
          if (validUnits.indexOf(token.unit) === -1 &&
              !(token.unit == "" && token.value === 0))
            return false;
          widths.push({ unit: token.unit, value: token.value });
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
