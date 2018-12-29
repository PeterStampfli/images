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

    let viewSelect = new Select("view");
    let numberOfCircles = 4;
    viewSelect.addOption("four circles", function() {
        numberOfCircles = 4;
        Make.updateNewMap();
    });
    viewSelect.addOption("three circles", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
    });

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

    // show the sum of angles
    let sum = document.getElementById("sum");


    //choosing the symmetries, and set initial values
    let setK2Button = NumberButton.create("k2");
    setK2Button.setRange(2, 10000);
    setK2Button.setValue(3);
    setK2Button.onChange = Make.updateNewMap;

    let setM2Button = NumberButton.create("m2");
    setM2Button.setRange(2, 10000);
    setM2Button.setValue(4);
    setM2Button.onChange = Make.updateNewMap;

    let setN2Button = NumberButton.create("n2");
    setN2Button.setRange(2, 10000);
    setN2Button.setValue(3);
    setN2Button.onChange = Make.updateNewMap;

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
        console.log("circles: " + numberOfCircles);
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n)) + "<sup>o</sup>";
        if (numberOfCircles === 3) {
            circleScope.triangleKaleidoscope(k, m, n);
        } else {
            let k2 = setK2Button.getValue();
            let m2 = setM2Button.getValue();
            let n2 = setN2Button.getValue();
            circleScope.triangleCentralCircle(k, m, n, k2, m2, n2);
            /*  const circle=circleScope.circle1;
              circleScope.circle1=circleScope.circle2;
              circleScope.circle2=circle;
              */
        }
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
