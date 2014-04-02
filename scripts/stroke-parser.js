define(["css-value"], function(parseCSSValue) {
  var validUnits = [ "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax",
                     "cm", "mm", "in", "px", "pt", "pc", "%" ];

  var AllowedUnits = {
    DontAllowSeg: 0,
    AllowSeg: 1
  };

  function parseLengthOrPercentage(str, allowedUnits) {
    var tokens = parseCSSValue(str);
    if (tokens.length > 1)
      return null;
    var token = tokens[0];
    if (token.type != "number")
      return null;
    var validUnit =
      validUnits.indexOf(token.unit) !== -1 ||
      (allowedUnits === AllowedUnits.AllowSeg && token.unit === "seg") ||
      (token.unit === "" && token.value === 0);
    if (!validUnit)
      return null;
    return { unit: token.unit, value: token.value };
  }

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
      return str === "repeat" ? this.RepeatMode.Repeat :
             str === "no-repeat" ? this.RepeatMode.NoRepeat :
             null;
    },

    parseStrokeWidths: function(str) {
      // Syntax: [<value> <position>?]# <repeat>?
      // Split off final repeat
      var matches = str.match(/(.*?)(?: (repeat|no-repeat))?$/);
      if (!matches)
        return null;

      // Parse width (position) pairs
      var widths = [];
      var pairs = matches[1].trim().split(",");
      var parsedOk = pairs.every(function(pair) {
        var result = { width: null, position: null };
        pair = pair.trim();
        var parts = pair.split(" ");
        if (parts.length > 2)
          return false;
        result.width =
          parseLengthOrPercentage(parts[0], AllowedUnits.DontAllowSeg);
        if (!result.width)
          return false;
        if (parts.length === 2) {
          result.position =
            parseLengthOrPercentage(parts[1], AllowedUnits.AllowSeg);
          if (!result.position)
            return false;
        }
        widths.push(result);
        return true;
      });
      if (!parsedOk)
        return null;

      // Parse final repeat
      var repeatMode = this.parseStrokeWidthsRepeat(matches[2]);
      if (repeatMode === null)
        return null;

      return { widths: widths, repeatMode: repeatMode };
    }
  };
});
