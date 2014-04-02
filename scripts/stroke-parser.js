define(["css-value"], function(parseCSSValue) {
  var validUnits = [ "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax",
                     "cm", "mm", "in", "px", "pt", "pc", "%" ];

  var AllowedUnits = {
    DontAllowSeg: 0,
    AllowSeg: 1
  };

  function parseLengthAndPercentageList(str, allowedUnits) {
    var values = [];
    try {
      var tokens = parseCSSValue(str.trim());
    } catch(e) {
      return null;
    }
    var parsedOk = tokens.every(function(token, i) {
      if (i % 2 === 1) {
        // Check it is comma-separated
        if (token.type != "comma")
          return false;
      } else {
        // Check it is a valid length
        if (token.type != "number")
          return false;
        var validUnit =
          validUnits.indexOf(token.unit) !== -1 ||
          (allowedUnits === AllowedUnits.AllowSeg && token.unit === "seg") ||
          (token.unit === "" && token.value === 0);
        if (!validUnit)
          return false;
        values.push({ unit: token.unit, value: token.value });
      }
      return true;
    });
    return parsedOk ? values : null;
  }

  return {
    RepeatMode: {
      NoRepeat: 0,
      Repeat: 1
    },

    parseStrokeWidthsValues: function(str) {
      return parseLengthAndPercentageList(str, AllowedUnits.DontAllowSeg);
    },

    parseStrokeWidthsPositions: function(str) {
      return parseLengthAndPercentageList(str, AllowedUnits.AllowSeg);
    },

    parseStrokeWidthsRepeat: function(str) {
    },
    parseStrokeWidths: function(str) {
    }
  };
});
