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
    viewSelect.addOption("four", function() {
        numberOfCircles = 4;
        Make.updateNewMap();
    });
    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
    });

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
    // basic triangle
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
    setNButton.setValue(4);
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

    let circleSize = Range.create("circleSize");
    circleSize.setRange(0.0, 1);
    circleSize.setValue(0.88);
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
    Make.setInitialOutputImageSpace(-11, 11, -11);

    Make.map.makeColorCollection(4, 1, 1, 64);
    Make.map.hueInversionColorSymmetry();

    circleScope.maxIterations = 200;


    VectorMap.iterationGamma = 0.7;
    VectorMap.iterationSaturation = 8;
    VectorMap.iterationThreshold = 2;

    const worldradius = 9.7;
    const worldradius2 = worldradius * worldradius;
    circleScope.setWorldradius(worldradius);
    const solutions = new Vector2();

    circleScope.setupMouseForTrajectory();

    var sumAngles;

    Make.initializeMap = function() {
        let k1 = setKButton.getValue();
        let m1 = setMButton.getValue();
        let n1 = setNButton.getValue();
        sumAngles = 1 / k1 + 1 / m1 + 1 / n1;
        sum.innerHTML = "" + Math.round(180 * sumAngles) + "<sup>o</sup>";
        circleScope.setDihedral(k1);
        const cosAlpha1 = Fast.cos(Math.PI / m1);
        const sinAlpha1 = Fast.sin(Math.PI / m1);
        const cosBeta1 = Fast.cos(Math.PI / n1);
        const sinBeta1 = Fast.sin(Math.PI / n1);
        const cosGamma1 = Fast.cos(Math.PI / k1);
        const sinGamma1 = Fast.sin(Math.PI / k1);
        // setting up the first circle/line, making the triangle
        var r1, x1, y1;
        if (sumAngles > 1.0001) { // elliptic
            r1 = 1;
            x1 = -(cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1;
            y1 = cosAlpha1;
            const scale = Math.sqrt(worldradius2 / (1 - x1 * x1 + y1 * y1));
            r1 *= scale;
            x1 *= scale;
            y1 *= scale;
            circleScope.circle1 = circleScope.circleOutsideIn(r1, x1, y1);
        } else if (sumAngles > 0.999999) { // euklidic
            const big = 100000;
            x1 = 3; // intersection with x-axis
            circleScope.circle1 = circleScope.lineLeftRight(x1 - big * cosAlpha1, big * sinAlpha1, x1 + big * cosAlpha1, -big * sinAlpha1);
        } else { // hyperbolic
            r1 = 1;
            x1 = (cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1;
            y1 = cosAlpha1;
            const scale = Math.sqrt(worldradius2 / (x1 * x1 + y1 * y1 - 1));
            r1 *= scale;
            x1 *= scale;
            y1 *= scale;
            circleScope.circle1 = circleScope.circleInsideOut(r1, x1, y1);
        }
        if (sumAngles > 0.99) {
            circleScope.circle1.map = circleScope.nothingMap;
            circleScope.circle2 = circleScope.circleZero();
        } else if (numberOfCircles === 3) {
            circleScope.circle2 = circleScope.circleZero();
        } else {
            let k2 = setK2Button.getValue();
            let m2 = setM2Button.getValue();
            let n2 = setN2Button.getValue();
            const cosAlpha2 = Fast.cos(Math.PI / m2);
            const sinAlpha2 = Fast.sin(Math.PI / m2);
            const cosBeta2 = Fast.cos(Math.PI / n2);
            const sinBeta2 = Fast.sin(Math.PI / n2);
            const cosGamma2 = Fast.cos(Math.PI / k2);
            const sinGamma2 = Fast.sin(Math.PI / k2);
            // for the line containing the center of the second circle
            const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
            const v = cosAlpha2;
            const a = u * u + v * v - 1;
            const b = -2 * (x1 * u + y1 * v + r1 * cosGamma2);
            const c = x1 * x1 + y1 * y1 - r1 * r1;
            if (Fast.quadraticEquation(a, b, c, solutions)) {
                const r2 = solutions.x;
                const x2 = r2 * u;
                const y2 = r2 * v;
                circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
                const separator1 = -cosGamma1 / sinGamma1;
                const separator2 = (y2 - y1) / (x2 - x1);
                // the finishing function to mark the different triangles
                circleScope.finishMap = function(position, furtherResults) {
                    let l2 = position.length2();
                    if (l2 > worldradius2) {
                        position.scale(worldradius2 / l2);
                        furtherResults.colorSector = 0;
                    } else {
                        const dx = position.x - x2;
                        const dy = position.y - y2;
                        if (dx < 0) {
                            if (dy < separator1 * dx) {
                                furtherResults.colorSector = 3;
                            } else {
                                furtherResults.colorSector = 2;
                            }
                        } else {
                            if (dy < separator2 * dx) {
                                furtherResults.colorSector = 1;
                            } else {
                                furtherResults.colorSector = 2;
                            }
                        }
                    }
                };
                // end finishing map
            }
        }
    };

    Make.updateOutputImage = function() {
        if (sumAngles < 0.99) {
            Make.updateMapOutput();
            if (showGenerators) {
                Draw.setLineWidth(basicUI.lineWidth);
                Draw.setColor("white");
                circleScope.draw();
            }
        } else {
            Make.outputImage.pixelCanvas.errorMessage("The basic triangle is",
                "not hyperbolic.", "Please increase the", "rotational symmetries.");
            Make.outputImage.adjustCanvasTransform();
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
