/* jshint esversion:6 */

const worldradius = 11.9;
const worldradius2 = worldradius * worldradius;
var quincuncinalRadius = worldradius;
const solutions = new Vector2();

const parameters = {};


function creation() {
    "use strict";

    //===================================================================================================
    // UI elements depending on actual image and its symmetries
    //=================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "quadrilateralHelp.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");
    basicUI.setupGenerators();

    var numberOfCircles = 4;
    Make.map.makeColorCollection(2, 1, 2.5, 140, 100);
    Make.map.hueInversionColorSymmetry();
    Make.map.inversionColorSymmetry();

    Make.map.discRadius = -1;
    circleScope.projection = circleScope.doNothing;
    let canShowGenerators = true;
    Make.map.drawSector = [true, true];

    let visibleSelect = new Select("visible");
    visibleSelect.addOption("all",
        function() {
            Make.map.drawSector = [true, true];
            Make.updateOutputImage();
        });

    visibleSelect.addOption("inside",
        function() {
            Make.map.drawSector = [true, false];
            Make.updateOutputImage();
        });

    visibleSelect.addOption("outside",
        function() {
            Make.map.drawSector = [false, true];
            Make.updateOutputImage();
        });

    var v = new Vector2();

    //choosing the symmetries, and set initial values
    let setKButton = NumberButton.create("k");
    parameters.setKButton = setKButton;
    setKButton.setRange(3, 10000);
    setKButton.setValue(3);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.createInfinity("m");
    parameters.setMButton = setMButton;
    setMButton.setRange(2, 10000);
    setMButton.setValue(3);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.createInfinity("n");
    parameters.setNButton = setNButton;
    setNButton.setRange(2, 10000);
    setNButton.setValue(2);
    setNButton.onChange = Make.updateNewMap;

    let setPButton = NumberButton.create("p");
    parameters.setPButton = setPButton;
    setPButton.setRange(2, 10000);
    setPButton.setValue(2);
    setPButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");

    const circleSize = Range.create("circleSize");
    parameters.circleSize = circleSize;
    circleSize.setStep(0.001);
    circleSize.setRange(0.01, 1);
    circleSize.setValue(0.9);
    circleSize.onChange = Make.updateNewMap;

    let circlePosition = Range.create("circlePosition");
    parameters.circlePosition = circlePosition;
    circlePosition.setRange(0.0, 1);
    circlePosition.setValue(0.81);
    circlePosition.onChange = Make.updateNewMap;

    // initializing map parameters, choosing the map in the method     
    //==============================================================================================

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    circleScope.maxIterations = 200;
    circleScope.setupMouseForTrajectory();

    basicUI.setupIterationStyle();

    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        let p = setPButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n + 1 / p)) + "<sup>o</sup>";
        // the angles
        circleScope.setDihedral(k); // cosGamma1, sinGamma1
        circleScope.reset();
        circleScope.startMap = circleScope.nothingMap;

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
        circleScope.circle1 = new Circle(r1, x1, y1);
        circleScope.circle1.map = circleScope.circle1.invertInsideOut;

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
        let x = circlePosition.getValue();
        // goes from 0 to 1
        // near 0 not much happens
        const acceleration = 1.6;
        x = acceleration * x + (1 - acceleration) * x * x;
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
            //   circleScope.circle2 = circleScope.circleInsideOut(r2, x2, y2);
            circleScope.circle2 = new Circle(r2, x2, y2);
            circleScope.circle2.map = circleScope.circle2.invertInsideOut;
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
                    position.scale(worldradius2 / position.length2());
                } else if (position.x > x2) {
                    if (position.y > y2 + m12 * (position.x - x2)) {
                        furtherResults.colorSector = 1;
                        position.scale(worldradius2 / position.length2());
                    } else {
                        furtherResults.colorSector = 0;
                    }
                } else {
                    if (position.y > y2 + m2 * (x2 - position.x)) {
                        furtherResults.colorSector = 1;
                        position.scale(worldradius2 / position.length2());
                    } else {
                        furtherResults.colorSector = 0;
                    }
                }
            };
        } else {
            const m12 = (y2 - y1) / (x2 - x1 + 0.00001);
            circleScope.finishMap = function(position, furtherResults) {
                if (position.x > x2) {
                    furtherResults.colorSector = 1;
                    position.scale(worldradius2 / position.length2());
                } else {
                    if (position.y > y2 + m2 * (x2 - position.x)) {
                        furtherResults.colorSector = 1;
                        position.scale(worldradius2 / position.length2());
                    } else if (position.x > x1) {
                        if (position.y > y1 + m12 * (position.x - x1)) {
                            furtherResults.colorSector = 0;
                        } else {
                            furtherResults.colorSector = 1;
                            position.scale(worldradius2 / position.length2());
                        }
                    } else {
                        furtherResults.colorSector = 0;
                    }
                }
            };
        }
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidthRange.getValue());
        if (basicUI.generators.getIndex() > 0) {
            Draw.setColor(basicUI.generatorColor);
            circleScope.dihedral.drawMirrors();
            circleScope.circle1.draw();
            circleScope.circle2.draw();
        }
    };

    circleScope.setMapping();
}

// saving the map data
if (DOM.idExists("saveMapData")) {
    Make.saveMapButton = new Button('saveMapData');
    Make.saveMapButton.onClick = function() {
        const precision = Make.saveMapPrecision.getValue();
        const height = Make.map.height;
        const width = Make.map.width;
        const lowerLeft = {};
        const upperRight = {};
        Make.map.getOutputRange(lowerLeft, upperRight);
        const shiftX = -lowerLeft.x;
        const shiftY = -lowerLeft.y;
        const factor = Math.pow(10, precision) / (Math.max(upperRight.x - lowerLeft.x, upperRight.y - lowerLeft.y));
        const xArray = Make.map.xArray;
        const yArray = Make.map.yArray;
        const lyapunovArray = Make.map.lyapunovArray;
        let mapData = '%%MatrixMarket matrix array complex general\r\n';
        mapData += '\r\n';
        mapData += '% generated by quadrilateral.html\r\n';
        mapData += '% data inside: ' + Make.map.drawSector[0] + '\r\n';
        mapData += '% data outside: ' + Make.map.drawSector[1] + '\r\n';
        mapData += '% rotational symmetries between\r\n';
        mapData += '% straight lines: ' + parameters.setKButton.getValue() + '\r\n';
        mapData += '% upper line and circle: ' + parameters.setMButton.getValue() + '\r\n';
        mapData += '% circles: ' + parameters.setNButton.getValue() + '\r\n';
        mapData += '% lower line and circle: ' + parameters.setPButton.getValue() + '\r\n';
        mapData += '% size of upper circle: ' + parameters.circleSize.getValue() + '\r\n';
        mapData += '% fractal character: ' + parameters.circlePosition.getValue() + '\r\n';
        mapData += '% map width: ' + width + '\r\n';
        mapData += '% map height: ' + height + '\r\n';
        mapData += '% an array of the results of the kaleidoscope mapping\r\n';
        mapData += '% for each pixel a pair of (x,y) coordinates\r\n';
        mapData += '% the x-coordinate is the real part, the y-coordinate the imaginary part\r\n';
        mapData += '% coordinate values are between 0 and 1\r\n';
        mapData += '% to save space "0." is not written\r\n';
        mapData += '% precision: ' + precision + ' digits\r\n';
        mapData += '% thus 0.123456 appears as ' + Math.round(Math.pow(10, precision) * 0.123456) + '\r\n';
        mapData += '% so divide numbers by ' + Math.pow(10, precision) + '\r\n';
        mapData += '% pixels with a x-coordinate of -1 have no valid map result and should be transparent\r\n';
        mapData += '\r\n';
        mapData += height + ' ' + width + '\r\n';
        mapData += '\r\n';
        const colorSectorArray = Make.map.colorSectorArray;
        const drawSector = Make.map.drawSector;
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                const index = i + j * width;
                if ((drawSector[colorSectorArray[index]]) && (lyapunovArray[index] > -0.001)) {
                    mapData += Math.round(factor * (xArray[index] + shiftX)) + ' ' + Math.round(factor * (yArray[index] + shiftY)) + '\r\n';
                } else {
                    mapData += '-1 0\r\n';
                }
            }
        }
        const blob = new Blob([mapData], {
            type: 'text/plain'
        });
        const filename = 'mapData.txt';
        const objURL = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        document.body.appendChild(a);
        a.href = objURL;
        a.download = filename;
        a.click();
        a.remove();
        URL.revokeObjectURL(objURL);
    };
    Make.saveMapPrecision = new NumberButton('precision');
    Make.saveMapPrecision.setRange(2, 6);
    Make.saveMapPrecision.setValue(4);
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
    basicUI.showSelectAddTwoColorStructure();
    basicUI.showSelectAdd();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};