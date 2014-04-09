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

    var leftOffset  = Math.min(Math.max(width.offset - 0.01, 0), 0.99);
    var rightOffset = Math.max(Math.min(width.offset + 0.01, 1), 0.01);
    var left  = pathElem.getPointAtLength(leftOffset * pathLength);
    var right = pathElem.getPointAtLength(rightOffset * pathLength);

    var x = right.x - left.x;
    var y = right.y - left.y;
    var angle = (!x && !y) ? 0 : Math.atan2(-y, x);
    angle += Math.PI / 2;

    var lhs = { x: point.x + Math.cos(angle) * width.left,
                y: point.y - Math.sin(angle) * width.left };
    var rhs = { x: point.x - Math.cos(angle) * width.right,
                y: point.y + Math.sin(angle) * width.right };
    addLine(lhs, rhs, "fill:none;stroke-width:1px;stroke:red", pathElem);
  }

  function addLine(a, b, style, after) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("style", style);
    after.parentNode.insertBefore(line, after.nextSibling);
  }
});
