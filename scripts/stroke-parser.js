define(["css-value"], function(parseCSSValue) {
  "use strict";

  var validUnits = [ "em", "ex", "cm", "mm", "in", "px", "pt", "pc", "%" ];

  var AllowedUnits = {
    DontAllowSeg: 0,
    AllowSeg: 1
  };

  function parseLengthOrPercentage(str, allowedUnits) {
    try {
      var tokens = parseCSSValue(str);
    } catch(e) {
      return null;
    }
    if (tokens.length !== 1)
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

  function parseStrokeWidth(str) {
    var parts = str.split(/\s*\/\s*/);
    if (parts.length > 2)
      return null;
    var widths = parts.map(function(part) {
        return parseLengthOrPercentage(part.trim(), AllowedUnits.DontAllowSeg);
      });
    return widths.indexOf(null) === -1 ?
           { left: widths[0], right: widths.length == 2 ? widths[1] : null } :
           null;
  }

  function parseStrokeWidthAndPosition(str) {
    var matches =
      str.match(/^\s*([^\s/]+)(?:\s*\/\s*([^\s/]+))?\s*([^\s/]+)?\s*$/);
    if (!matches)
      return null;
    var left =
      parseLengthOrPercentage(matches[1], AllowedUnits.DontAllowSeg);
    if (!left)
      return null;
    var right = null;
    if (matches[2]) {
      right = parseLengthOrPercentage(matches[2], AllowedUnits.DontAllowSeg);
      if (!right)
        return null;
    }
    var position = null;
    if (matches[3]) {
      position = parseLengthOrPercentage(matches[3], AllowedUnits.AllowSeg);
      if (!position)
        return null;
    }
    return {
      left: left,
      right: right,
      position: position
    };
  }

  return {
    RepeatMode: {
      NoRepeat: 0,
      Repeat: 1
    },

    parseStrokeWidthsValues: function(str) {
      str = str.trim();
      if (!str.length)
        return [];
      var widths = str.split(",").map(function(value) {
          return parseStrokeWidth(value);
        });
      return widths.indexOf(null) === -1 ? widths : null;
    },

    parseStrokeWidthsPositions: function(str) {
      var result = [];
      str = str.trim();
      if (!str.length)
        return result;
      var result = str.split(",").map(function(value) {
          return parseLengthOrPercentage(value.trim(), AllowedUnits.AllowSeg);
        });
      return result.indexOf(null) === -1 ? result : null;
    },

    parseStrokeWidthsRepeat: function(str) {
      return str === "repeat" ? this.RepeatMode.Repeat :
             str === "no-repeat" ? this.RepeatMode.NoRepeat :
             null;
    },

    parseStrokeWidths: function(str) {
      // Syntax: [<width>(/<width>)? <position>?]# <repeat>?
      // Split off final repeat
      var matches = str.match(/(.*?)(?:(?:^| )(repeat|no-repeat))?$/);
      if (!matches)
        return null;

      // Parse width(/width) (position) values
      var list = matches[1].trim();
      var listItems = list ? list.split(",") : [];
      var widths = listItems.map(parseStrokeWidthAndPosition);
      if (widths.indexOf(null) !== -1)
        return null;

      // Parse final repeat
      var repeatMode = null;
      if (matches.length >= 3 && matches[2]) {
        repeatMode = this.parseStrokeWidthsRepeat(matches[2]);
        if (repeatMode === null)
          return null;
      }

      return { widths: widths, repeatMode: repeatMode };
    }
  };
});
