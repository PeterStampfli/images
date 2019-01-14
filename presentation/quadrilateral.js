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

    let geometry = new Select("geometry");
    let hyperbolic = true;

    geometry.addOption("hyperbolic",
        function() {
            if (!hyperbolic) {
                hyperbolic = true;
                Make.updateNewMap();
            }
        });

    geometry.addOption("fractal",
        function() {
            if (hyperbolic) {
                hyperbolic = false;
                Make.updateNewMap();
            }
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


    let circlePosition = Range.create("circlePosition");
    circlePosition.setRange(0.0, 1);
    circlePosition.onChange = Make.updateNewMap;

    // initializing map parameters, choosing the map in the method     
    //==============================================================================================

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.makeColorCollection(2, 1, 2.5, 80);
    Make.map.hueInversionColorSymmetry();

    circleScope.maxIterations = 200;

    VectorMap.iterationGamma = 0.9;
    VectorMap.iterationSaturation = 8;
    VectorMap.iterationThreshold = 2;

    const worldradius = 9.7;
    const worldradius2 = worldradius * worldradius;
    const solutions = new Vector2();

    Make.initializeMap = function() {
        console.log("hyperbolic " + hyperbolic);

        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        let p = setPButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n + 1 / p)) + "<sup>o</sup>";
        // the angles
        circleScope.setDihedral(k); // cosGamma1, sinGamma1
        const cosAlpha = Math.cos(Math.PI / m);
        const sinAlpha = Math.sin(Math.PI / m);
        const cosBeta = Math.cos(Math.PI / n);
        const sinBeta = Math.sin(Math.PI / n);
        const cosGamma = Math.cos(Math.PI / k);
        const sinGamma = Math.sin(Math.PI / k);
        const cosDelta = Math.cos(Math.PI / p);
        const sinDelta = Math.sin(Math.PI / p);
        // the first circle, its size relative to maximum value
        const relativeCircleSize = circleSize.getValue();
        let x1 = 5; // trial value
        let rMax = x1 * sinGamma / (1 + cosAlpha * cosGamma);
        let r1 = relativeCircleSize * rMax;
        let y1 = r1 * cosAlpha;
        // calculate worldradius and adjust to desired value
        const w2 = x1 * x1 + y1 * y1 - r1 * r1;
        const scale = Math.sqrt(worldradius2 / w2);
        x1 *= scale;
        y1 *= scale;
        r1 *= scale;
        circleScope.circle1 = circleScope.circleInsideOut(r1, x1, y1);
        // the second circle and finish map depending on geometry


        circleScope.circle2 = circleScope.circleZero();


        // limits for position

        const f = sinGamma / (1 + cosGamma * cosDelta);
        const g = cosGamma + f * sinGamma * cosDelta;
        const a = g * g;
        const b = -2 * (g * x1 + f * (y1 + r1 * cosBeta));
        const c = worldradius2;
        var xiLow, xiHigh;
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            xiLow = solutions.x;
            xiHigh = solutions.y;
            solutions.log("xilimits");
        } else {
            console.log("**** no solution for limits");
            xiLow = 1;
            xiHigh = 2;
        }

        if (hyperbolic) {
            const tanGamma = sinGamma / cosGamma;
            const f0 = 1 / (x1 + y1 * tanGamma);
            console.log(f0);
            const f1 = f0 * (y1 * cosDelta / cosGamma - r1 * cosBeta);
            const g0 = f0 * tanGamma;
            const g1 = f1 * tanGamma - cosDelta / cosGamma;
            const a = f1 * f1 + g1 * g1 - 1;
            const b = 2 * worldradius2 * (f1 * f0 + g1 * g0);
            const c = worldradius2 * worldradius2 * (f0 * f0 + g0 * g0) - worldradius2;
            var r2, x2, y2;
            if (Math.abs(a) < 0.001) {
                console.log("azero");
                r2 = -c / b;
                x2 = f0 * worldradius2 + f1 * r2;
                y2 = g0 * worldradius2 + g1 * r2;
                circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
                solutions.log("hap radius");
            } else if (Fast.quadraticEquation(a, b, c, solutions)) {
                r2 = solutions.x;
                x2 = f0 * worldradius2 + f1 * r2;
                y2 = g0 * worldradius2 + g1 * r2;
                circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
                solutions.log("hap radius");
            } else {
                console.log("**** no solution for second circle");
                r2 = 0;
                x2 = 0;
                y2 = 0;
            }
            // adjust joyce for position of second circle
            const xi = x2 * cosGamma + y2 * sinGamma;
            console.log("xi " + xi);


            circleScope.finishMap = function(position, furtherResults) {
                let l2 = position.length2();
                if (l2 > worldradius2) {
                    furtherResults.colorSector = 1;
                    position.scale(worldradius2 / l2);
                } else {
                    furtherResults.colorSector = 0;
                }
            };
        }
        // fractal geometry
        else {

        }
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
