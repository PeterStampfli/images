/* jshint esversion:6 */

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "circleInTriangleHelp.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");

    let viewSelect = new Select("view");
    let numberOfCircles = 4;
    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
    });
    viewSelect.addOption("four", function() {
        numberOfCircles = 4;
        Make.updateNewMap();
    });
    viewSelect.addOption("five", function() {
        numberOfCircles = 5;
        Make.updateNewMap();
    });
    viewSelect.setIndex(1);

    Make.map.discRadius = -1;
    circleScope.projection = circleScope.doNothing;

    let projection = new Select("projection");
    projection.addOption("Poincaré disc surrounded", function() {
        circleScope.projection = circleScope.doNothing;
        Make.map.discRadius = -1;
        Make.updateNewMap();
    });
    projection.addOption("Poincaré disc only", function() {
        circleScope.projection = circleScope.doNothing;
        Make.map.discRadius = worldradius;
        Make.updateNewMap();
    });
    projection.addOption("Poincaré plane both", function() {
        circleScope.projection = function(position) {
            position.y = worldradius - position.y;
            position.x /= worldradius;
            position.y /= worldradius;
            // cayley transform
            let r2 = position.x * position.x + position.y * position.y;
            let base = 1 / (r2 + 2 * position.y + 1.00001);
            position.y = -2 * position.x * base * worldradius;
            position.x = (r2 - 1) * base * worldradius;
            return 1;
        };
        Make.map.discRadius = -1;
        Make.updateNewMap();
    });
    projection.addOption("Poincaré plane single", function() {
        circleScope.projection = function(position) {
            position.y = worldradius - position.y;
            if (position.y < 0) {
                return -1;
            }
            position.x /= worldradius;
            position.y /= worldradius;
            // cayley transform
            let r2 = position.x * position.x + position.y * position.y;
            let base = 1 / (r2 + 2 * position.y + 1.00001);
            position.y = -2 * position.x * base * worldradius;
            position.x = (r2 - 1) * base * worldradius;
            return 1;
        };
        Make.map.discRadius = -1;
        Make.updateNewMap();
    });


    projection.addOption("Klein disc surrounded", function() {
        circleScope.projection = function(position) {
            let r2worldRadius2 = (position.x * position.x + position.y * position.y) / worldradius2;
            if (r2worldRadius2 < 1) {
                let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
                position.x *= mapFactor;
                position.y *= mapFactor;
            }
            return 1;
        };
        Make.map.discRadius = -1;
        Make.updateNewMap();
    });
    projection.addOption("Klein disc only", function() {
        circleScope.projection = function(position) {
            let r2worldRadius2 = (position.x * position.x + position.y * position.y) / worldradius2;
            let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        };
        Make.map.discRadius = worldradius;
        Make.updateNewMap();
    });

    var v = new Vector2();

    projection.addOption("Bulatov band", function() {
        let bandScale = Math.PI * 0.5 / worldradius;
        circleScope.projection = function(position) {
            if (Math.abs(position.y) > worldradius) {
                return -1;
            }
            position.scale(bandScale);
            let exp2u = Fast.exp(position.x);
            let expm2u = 1 / exp2u;
            Fast.cosSin(position.y, v);
            let base = worldradius / (exp2u + expm2u + 2 * v.x);
            position.x = (exp2u - expm2u) * base;
            position.y = 2 * v.y * base;
            return 1;
        };
        Make.map.discRadius = -1;
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
    setKButton.setValue(3);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(3);
    setMButton.onChange = Make.updateNewMap;


    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(6);
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
    setM2Button.setValue(2);
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
    Make.setInitialOutputImageSpace(-11, 11, -11);

    Make.map.makeColorCollection(6, 1, 0.8, 140, 100);
    Make.map.rgbRotationInversionColorSymmetry();

    circleScope.maxIterations = 200;
    circleScope.setupMouseForTrajectory();

    VectorMap.iterationGamma = 1.2;
    VectorMap.iterationSaturation = 10;
    VectorMap.iterationThreshold = 5;

    const worldradius = 9.7;
    const worldradius2 = worldradius * worldradius;
    circleScope.setWorldradius(worldradius);
    const solutions = new Vector2();

    var sumAngles;
    // the first circle
    var r1, x1, y1;
    var cosAlpha1, sinAlpha1, cosBeta1, sinBeta1, cosGamma1, sinGamma1;
    // the second circle
    var r2, x2, y2;
    var cosAlpha2, sinAlpha2, cosBeta2, sinBeta2, cosGamma2, sinGamma2;
    // the three sectors
    //going from center of circle 1 to circle 2 
    // going from center of circle2 to the line
    var m12, m2;
    // the translation vectors to make scanned region more compact
    var transSector0X, transSector1X, transSector1Y;

    function setupSeparators() {
        m2 = -cosGamma1 / sinGamma1;
        m12 = (y2 - y1) / (x2 - x1);
        transSector0X = x2 + Math.sqrt(r2 * r2 - y2 * y2);
        const d = -x2 * sinGamma1 + y2 * cosGamma1;
        const l = Math.sqrt(r2 * r2 - d * d);
        const displacement = (x2 * cosGamma1 + y2 * sinGamma1 + l);
        transSector1X = cosGamma1 * displacement;
        transSector1Y = sinGamma1 * displacement;
    }


    // setting up the first circle/line, making the triangle, always hyperbolic
    function setupFirstCircle() {
        r1 = 1;
        x1 = (cosAlpha1 * cosGamma1 + cosBeta1) / sinGamma1;
        y1 = cosAlpha1;
        const scale = Math.sqrt(worldradius2 / (x1 * x1 + y1 * y1 - 1));
        r1 *= scale;
        x1 *= scale;
        y1 *= scale;
        circleScope.circle1.setRadiusCenterXY(r1, x1, y1);
        circleScope.circle1.map = circleScope.circle1.invertInsideOut;
    }

    // calculate the second circle for intersecting with all three sides
    function secondCircleThreeIntersections() {
        // for the line containing the center of the second circle
        const u = (cosBeta2 + cosAlpha2 * cosGamma1) / sinGamma1;
        const v = cosAlpha2;
        const a = u * u + v * v - 1;
        const b = -2 * (x1 * u + y1 * v + r1 * cosGamma2);
        const c = x1 * x1 + y1 * y1 - r1 * r1;
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            r2 = solutions.x;
            x2 = r2 * u;
            y2 = r2 * v;
            circleScope.circle2.setRadiusCenterXY(r2, x2, y2);
            circleScope.circle2.map = circleScope.circle2.invertInsideOut;
            setupSeparators();
            // the finishing function to mark the different triangles
            circleScope.finishMap = function(position, furtherResults) {
                let l2 = position.length2();
                if (l2 > worldradius2) {
                    position.scale(0.33 * worldradius2 / l2);
                    furtherResults.colorSector = 3;
                } else {
                    threeTriangleSectors(position, furtherResults);
                }
            };
        }
    }

    // separate the three triangles in the big triangle
    // make three sectors
    // sector 2 is close to origin, sector 0 is at x-axis, sector 1 at "diagonal" line
    function threeTriangleSectors(position, furtherResults) {
        const dx = position.x - x2;
        const dy = position.y - y2;
        if (dx < 0) {
            if (dy < m2 * dx) {
                furtherResults.colorSector = 1;
            } else {
                furtherResults.colorSector = 0;
                position.x -= transSector1X;
                position.y -= transSector1Y;
            }
        } else {
            if (dy < m12 * dx) {
                furtherResults.colorSector = 2;
                position.x -= transSector0X;
            } else {
                furtherResults.colorSector = 0;
                position.x -= transSector1X;
                position.y -= transSector1Y;
            }
        }
    }


    // separate inside/outside of worlddisc
    function insideOutsideSectors(position, furtherResults) {
        let l2 = position.length2();
        if (l2 > worldradius2) {
            position.scale(worldradius2 / l2);
            furtherResults.colorSector = 3;
        } else {
            furtherResults.colorSector = 0;
        }
    }

    Make.initializeMap = function() {

        // get data
        let k1 = setKButton.getValue();
        let m1 = setMButton.getValue();
        let n1 = setNButton.getValue();
        cosAlpha1 = Fast.cos(Math.PI / m1);
        sinAlpha1 = Fast.sin(Math.PI / m1);
        cosBeta1 = Fast.cos(Math.PI / n1);
        sinBeta1 = Fast.sin(Math.PI / n1);
        cosGamma1 = Fast.cos(Math.PI / k1);
        sinGamma1 = Fast.sin(Math.PI / k1);
        let k2 = setK2Button.getValue();
        let m2 = setM2Button.getValue();
        let n2 = setN2Button.getValue();
        cosAlpha2 = Fast.cos(Math.PI / m2);
        sinAlpha2 = Fast.sin(Math.PI / m2);
        cosBeta2 = Fast.cos(Math.PI / n2);
        sinBeta2 = Fast.sin(Math.PI / n2);
        cosGamma2 = Fast.cos(Math.PI / k2);
        sinGamma2 = Fast.sin(Math.PI / k2);
        // the triangle
        sumAngles = 1 / k1 + 1 / m1 + 1 / n1;
        sum.innerHTML = "" + Math.round(180 * sumAngles) + "<sup>o</sup>";
        circleScope.reset();
        circleScope.setDihedral(k1);
        circleScope.startMap = circleScope.noMap;
        // do nothing, no elements, if not hyperbolic, updateOutputImage shows error message
        if (sumAngles < 0.99) {
            setupFirstCircle();
            circleScope.finishMap = insideOutsideSectors; // for three circles everything done
            if (numberOfCircles === 4) {
                secondCircleThreeIntersections();
            } else if (numberOfCircles === 5) {
                secondCircleThreeIntersections();

                circleScope.circle2.map = function(position) {
                    let first = this.invertInsideOut(position);
                    if (first > 0) {
                        const length2 = position.x * position.x + position.y * position.y;
                        if (length2 > worldradius2) {
                            const scale = worldradius2 / length2;
                            circleScope.reflectionsAtWorldradius++;
                            first *= scale;
                            position.x *= scale;
                            position.y *= scale;
                        }
                    }
                    return first;
                };


                circleScope.startMap = function(position) {
                    const length2 = position.x * position.x + position.y * position.y;
                    if (length2 > worldradius2) {
                        const scale = worldradius2 / length2;
                        circleScope.reflectionsAtWorldradius++;
                        position.x *= scale;
                        position.y *= scale;
                    }
                    circleScope.finishMap = function(position, furtherResults) {
                        threeTriangleSectors(position, furtherResults);
                        if (circleScope.reflectionsAtWorldradius & 1) {
                            furtherResults.colorSector += 3;
                        }
                    };
                };
            }
        }
    };

    // line width should relate to output image size!!
    const lineWidthToImageSize = 0.005;

    const zero = new Vector2();

    Make.updateOutputImage = function() {
        if (sumAngles < 0.99) {
            Make.updateMapOutput();
            if (showGenerators) {
                Draw.setLineWidth(lineWidthToImageSize * Make.outputImage.pixelCanvas.width);
                Draw.setColor("black");
                circleScope.dihedral.drawMirrors();
                circleScope.circle1.draw();
                if (numberOfCircles > 3) {
                    circleScope.circle2.draw();
                }
                if (numberOfCircles === 5) {
                    Draw.circle(worldradius, zero);
                }
            }
        } else {
            Make.outputImage.pixelCanvas.errorMessage("The basic triangle is",
                "not hyperbolic.", "Please increase its", "rotational symmetries.");
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
    basicUI.showSelectAdd();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
