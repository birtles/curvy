define(function() {
  return function(callback, timeout) {
    console.log("creating new timer");
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
