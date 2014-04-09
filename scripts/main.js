require(["test-cases", "batch-dispatch", "compute-widths", "innersvg",
         "domReady!"],
  function(predefinedTests, BatchTimer, computeWidths) {
  "use strict";

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
    updatePermalink();
    updatePreview();
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
  var sourceBoxLinkTimer = new BatchTimer(updatePermalink, 300);
  sourceBox.addEventListener("input", sourceBoxLinkTimer.trigger);
  updatePermalink();

  // Preview
  function updatePreview() {
    var source = sourceBox.value;
    var svgOutput = document.querySelector("svg#rendering");
    svgOutput.innerSVG = source;

    // In future we should make this take shapes and convert them to paths
    [].forEach.call(svgOutput.querySelectorAll("path"), (transformPath));
  }
  var sourceBoxPreviewTimer = new BatchTimer(updatePreview, 200);
  sourceBox.addEventListener("input", sourceBoxPreviewTimer.trigger);
  updatePreview();

  function transformPath(pathElem) {
    var computeWidthsResult = computeWidths(pathElem);
    computeWidthsResult.parseErrors.forEach(function(error) {
      console.log("Error parsing " + error);
    });
    computeWidthsResult.widths.forEach(function(width) {
      showWidthPoint(width, pathElem);
    });
  }

  function showWidthPoint(width, pathElem) {
    var pathLength = pathElem.getTotalLength();
    var point = pathElem.getPointAtLength(width.offset * pathLength);

    var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
    dot.setAttribute("r", 3);
    dot.setAttribute("fill", "red");
    pathElem.parentNode.insertBefore(dot, pathElem.nextSibling);
  }
});
