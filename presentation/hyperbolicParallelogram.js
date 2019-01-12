/* jshint esversion:6 */

function creation() {
    "use strict";

    //===================================================================================================
    // UI elements depending on actual image and its symmetries
    //=================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "hyperbolicParallelogramHelp.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");

    let generators = new Select("generators");
    let showGenerators = true;

    generators.addOption("show",
        function() {
            if (!showGenerators) {
                showGenerators = true;
                Make.updateOutputImage();
            }
        });

    generators.addOption("hide",
        function() {
            if (showGenerators) {
                showGenerators = false;
                Make.updateOutputImage();
            }
        });



    //choosing the symmetries, and set initial values
    let setKButton = NumberButton.create("k");
    setKButton.setRange(3, 10000);
    setKButton.setValue(3);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(2);
    setNButton.onChange = Make.updateNewMap;

    let setPButton = NumberButton.create("p");
    setPButton.setRange(2, 10000);
    setPButton.setValue(2);
    setPButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");

    let circleSize = Range.create("circleSize");
    circleSize.setRange(0.0, 1);
    circleSize.setValue(0.94);
    circleSize.onChange = Make.updateNewMap;

    // initializing map parameters, choosing the map in the method     
    //==============================================================================================

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.makeColorCollection(2, 1, 2.5, 80);
    Make.map.hueInversionColorSymmetry();

    circleScope.maxIterations = 200;

    VectorMap.iterationGamma = 0.9;
    VectorMap.iterationReduction = 0.4;

    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        let p = setPButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n + 1 / p)) + "<sup>o</sup>";
        const theCircleSize = circleSize.getValue();
        circleScope.hyperbolicQuadrangle(k, m, n, p, theCircleSize);
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if (showGenerators) {
            Draw.setLineWidth(basicUI.lineWidth);
            Draw.setColor("white");
            circleScope.draw();
        }
    };

    circleScope.setMapping();
}

window.onload = function() {
    "use strict";
    creation();
    basicUI.onload();
    basicUI.showSelectAddConvergence();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
