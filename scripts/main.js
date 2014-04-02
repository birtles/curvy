require(["test-cases"], function(predefinedTests) {
  // Common references
  var sourceBox = document.querySelector("textarea[name=source]");

  // Pre-defined test cases
  var testSelect = document.querySelector("select[name=preset-test]");
  predefinedTests.tests.forEach(function(test) {
    var testOption = document.createElement("option");
    testOption.appendChild(document.createTextNode(test.title));
    testOption.dataset.src = test.source;
    testSelect.appendChild(testOption);
  });
  testSelect.addEventListener("change", function(evt) {
    var select = evt.target;
    sourceBox.value = select.options[select.selectedIndex].dataset.src || "";
  });

  // Parse URL params
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    // If only other browsers would support destructuring assignment...
    var pair  = vars[i].split('=');
    var key   = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    switch(key) {
      case 'src':
        sourceBox.value = value;
        break;
    }
  }

  // Permalink
  sourceBox.addEventListener("input", updatePermalink);
  function updatePermalink() {
    var link = document.getElementById("permalink");
    var params = [
        { key: "src",
          value: sourceBox.value }
      ];
    var queryString =
      params.map(function(param) {
        return encodeURIComponent(param.key) + '=' +
               encodeURIComponent(param.value);
      }).join("&");
    link.href = "?" + queryString;
  }
});
