/* jshint esversion:6 */

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "help.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");



    //choosing the symmetries, and set initial values
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(3);
    setNButton.onChange = Make.updateNewMap;

    let setPButton = NumberButton.create("p");
    setPButton.setRange(2, 10000);
    setPButton.setValue(3);
    setPButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");


    let circleSize = Range.create("circleSize");
    circleSize.setRange(0.1, 1);
    circleSize.setValue(0.6);
    circleSize.onChange = Make.updateNewMap;



    // initializing map parameters, choosing the map in the method     Make.initializeMap
    // this is called before calculating the second map in geometrical space, this map  defines the geometry

    // set the mapping  functions via:
    //         Make.setMapping(mapInputImageMethod, mapStructureMethod);
    // where
    //  mapInputImageMethod(position) maps the Vector2 object position, 
    //  returns the lyapunov coefficient>0 if mapping successful, returns value<0 if mapping not successful
    // mapStructureMethod is similar, except that returned position.x is number of reflections
    //  (Note that position.x=0 gets special color (no mapping...), colors defined in vectorMap.js

    // setting a disc radius for the output image:
    // Make.map.discRadius=???,  value >0 for output image clipped to circle, <0 for no clipping
    //==========================================================================================================================

    // if we need some special drawing over the image, modify:
    //   Make.updateOutputImage = Make.updateMapOutput; //default, if needed add some lines ...
    // where Make.updateMapOutput is the method to draw the image according to the map

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-15, 15, -15);

    Make.map.makeColorCollection(4, 1, 1, 64);
    Make.map.hueInversionColorSymmetry();

    circleScope.maxIterations = 200;


    VectorMap.iterationGamma = 0.75;
    VectorMap.iterationReduction = 0.2;

    circleScope.setupMouseForTrajectory();


    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        let p = setPButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n + 1 / p)) + "<sup>o</sup>";
        const theCircleSize = circleSize.getValue();
        console.log(theCircleSize);
        circleScope.hyperbolicQuadrangle(k, m, n, p, theCircleSize);
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidth);
        Draw.setColor("white");
        circleScope.draw();

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
