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
    setMButton.setValue(3);
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


    let xiRange = Range.create("xi");
    xiRange.setRange(0.1, 10);
    xiRange.setValue(5);
    xiRange.onChange = Make.updateNewMap;

    let x1Range = Range.create("x1");
    x1Range.setRange(0.1, 10);
    x1Range.setValue(5);
    x1Range.onChange = Make.updateNewMap;

    let rhoRange = Range.create("rho");
    rhoRange.setRange(0.1, 1);
    rhoRange.setValue(0.6);
    rhoRange.onChange = Make.updateNewMap;



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

    const solutions = new Vector2();

    Make.initializeMap = function() {
        let k = setKButton.getValue();
        circleScope.setDihedral(k); // cosGamma1, sinGamma1
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        let p = setPButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n + 1 / p)) + "<sup>o</sup>";


        const cosGamma = Math.cos(Math.PI / k);
        const sinGamma = Math.sin(Math.PI / k);
        const cosAlpha = Math.cos(Math.PI / m);
        const sinAlpha = Math.sin(Math.PI / m);
        const cosBeta = Math.cos(Math.PI / n);
        const sinBeta = Math.sin(Math.PI / n);
        const cosDelta = Math.cos(Math.PI / p);
        const sinDelta = Math.sin(Math.PI / p);

        const xi = xiRange.getValue();
        const x1 = x1Range.getValue();
        const rho = rhoRange.getValue();

        const h2 = rho * rho + 1 + 2 * rho * cosBeta;
        const f0 = x1 - xi * cosGamma;
        const f1 = -sinGamma * cosDelta;
        const g0 = -xi * sinGamma;
        const g1 = rho * cosAlpha + cosGamma * cosDelta;

        const a = f1 * f1 + g1 * g1 - h2;
        const b = 2 * (f0 * f1 + g0 * g1);
        const c = f0 * f0 + g0 * g0;
        console.log(a);
        console.log(b);
        console.log(c);
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            console.log("solution");
            const r2 = solutions.x;
            const r1 = rho * r2;
            const y1 = r1 * cosAlpha;
            const x2 = xi * cosGamma + r2 * cosDelta * sinGamma;
            const y2 = xi * sinGamma - r2 * cosDelta * cosGamma;

            circleScope.circle1 = circleScope.circleInsideOut(r1, x1, y1);
            circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);

            const m12 = (x2 - x1) / (y2 - y1);
            const c12 = x1 - m12 * y1;
            const m2 = -sinGamma / cosGamma;
            const c2 = x2 - m2 * y2;
            const inversionRadius2 = 0.25 * ((x1 + x2) * (x1 + x2) + (y1 + y2) * (y1 + y2));
            circleScope.finishMap = function(position, furtherResults) {
                furtherResults.colorSector = 1;
                if (position.y < y1) {
                    if (position.x < x1) {
                        furtherResults.colorSector = 0;
                    }
                } else if (position.y < y2) {
                    if (position.x < c12 + m12 * position.y) {
                        furtherResults.colorSector = 0;
                    }
                } else {
                    if (position.x < c2 + m2 * position.y) {
                        furtherResults.colorSector = 0;
                    }
                }
                if (furtherResults.colorSector === 1) {
                    position.scale(inversionRadius2 / position.length2());
                }
            };

        } else {
            console.log("****** no solution");
            circleScope.finishMap = function(position, furtherResults) {};
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
