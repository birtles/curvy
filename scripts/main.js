require(["test-cases"], function(predefinedTests) {

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
    var src = select.options[select.selectedIndex].dataset.src || "";
    document.querySelector("textarea[name=source]").value = src;
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
        document.querySelector("textarea[name=source]").value = value;
        break;
    }
  }
});
