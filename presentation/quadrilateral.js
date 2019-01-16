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


    let circlePosition = Range.create("circlePosition");
    circlePosition.setRange(0.0, 1);
    circlePosition.setValue(0.0);
    circlePosition.onChange = Make.updateNewMap;

    // initializing map parameters, choosing the map in the method     
    //==============================================================================================

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.makeColorCollection(2, 1, 2.5, 80);
    Make.map.hueInversionColorSymmetry();

    circleScope.maxIterations = 200;

    VectorMap.iterationGamma = 0.8;
    VectorMap.iterationSaturation = 8;
    VectorMap.iterationThreshold = 2;

    const worldradius = 9.7;
    const worldradius2 = worldradius * worldradius;
    const solutions = new Vector2();

    Make.initializeMap = function() {
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
        const tanGamma = sinGamma / cosGamma;
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
        var r2, x2, y2;
        var a, b, c;
        var f, g, f0, f1, g0, g1;
        var xiLow, xiHigh, xiHyperbolic;
        // limits for position (fractal case)
        f = sinGamma / (1 + cosGamma * cosDelta);
        g = cosGamma + f * sinGamma * cosDelta;
        a = g * g;
        b = -2 * (g * x1 + f * (y1 + r1 * cosBeta));
        c = worldradius2;
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            xiLow = solutions.x;
            xiHigh = solutions.y;
        } else {
            console.log("**** no solution for limits");
            xiLow = 1;
            xiHigh = 2;
        }
        // position in hyperbolic case
        f0 = 1 / (x1 + y1 * tanGamma);
        f1 = f0 * (y1 * cosDelta / cosGamma - r1 * cosBeta);
        g0 = f0 * tanGamma;
        g1 = f1 * tanGamma - cosDelta / cosGamma;
        a = f1 * f1 + g1 * g1 - 1;
        b = 2 * worldradius2 * (f1 * f0 + g1 * g0);
        c = worldradius2 * worldradius2 * (f0 * f0 + g0 * g0) - worldradius2;
        if (Math.abs(a) < 0.001) {
            r2 = -c / b;
            x2 = f0 * worldradius2 + f1 * r2;
            y2 = g0 * worldradius2 + g1 * r2;
        } else if (Fast.quadraticEquation(a, b, c, solutions)) {
            r2 = solutions.x;
            x2 = f0 * worldradius2 + f1 * r2;
            y2 = g0 * worldradius2 + g1 * r2;
        } else {
            console.log("**** no solution for hyperbolic second circle");
            r2 = 0;
            x2 = 0;
            y2 = 0;
        }
        // position of second circle for hyperbolic image
        xiHyperbolic = x2 * cosGamma + y2 * sinGamma;
        // interpolation of position
        const x = circlePosition.getValue();
        const xi0 = xiHyperbolic;
        const xi1 = xiLow;
        const xi = xi0 + x * (xi1 - xi0);
        f0 = x1 - xi * cosGamma;
        f1 = -sinGamma * cosDelta;
        g0 = y1 - xi * sinGamma;
        g1 = cosGamma * cosDelta;
        a = 1 - f1 * f1 - g1 * g1;
        b = 2 * (r1 * cosBeta - f0 * f1 - g0 * g1);
        c = r1 * r1 - f0 * f0 - g0 * g0;
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            r2 = solutions.y;
            x2 = xi * cosGamma + r2 * sinGamma * cosDelta;
            y2 = xi * sinGamma - r2 * cosGamma * cosDelta;
            circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
        } else {
            console.log("**** no solution for general second circle");
            r2 = 0;
            x2 = 0;
            y2 = 0;
        }
        // separating regions, and remapping
        const m2 = 1 / tanGamma;
        if (x2 < x1) {
            const m12 = (y1 - y2) / (x1 - x2 + 0.00001);
            circleScope.finishMap = function(position, furtherResults) {
                if (position.x > x1) {
                    furtherResults.colorSector = 1;
                    position.scale(worldradius2/position.length2());
                } else if (position.x > x2) {
                    if (position.y > y2 + m12 * (position.x - x2)) {
                        furtherResults.colorSector = 1;
                    position.scale(worldradius2/position.length2());
                    } else {
                        furtherResults.colorSector = 0;
                    }
                } else {
                    if (position.y > y2 + m2 * (x2 - position.x)) {
                        furtherResults.colorSector = 1;
                    position.scale(worldradius2/position.length2());
                    } else {
                        furtherResults.colorSector = 0;
                    }
                }
            };
        } else {
            const m12 = (y2 - y1) / (x2 - x1 + 0.00001);
            circleScope.finishMap = function(position, furtherResults) {
                if (position.x>x2){
                 furtherResults.colorSector = 1;
                    position.scale(worldradius2/position.length2());
                }
                else {
                    if (position.y>y2+m2*(x2-position.x)){
                            furtherResults.colorSector = 1;
                    position.scale(worldradius2/position.length2());
                    }
                    else if (position.x>x1){
                        if (position.y>y1+m12*(position.x-x1)){
                                                    furtherResults.colorSector = 0;
                        }
                        else {
                             furtherResults.colorSector = 1;
                    position.scale(worldradius2/position.length2());                          
                        }
                    }
                    else {
                                            furtherResults.colorSector = 0;
                    }
                }
            };
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
