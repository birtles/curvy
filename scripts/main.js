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
});
