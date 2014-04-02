define(function() {
  return function(callback, timeout) {
    var timeoutId;
    return {
      trigger: function() {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(function() {
          timeoutId = undefined;
          callback();
        }, timeout);
      }
    };
  }
});
