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
    var numberOfCircles;


    function four() {
        numberOfCircles = 4;
        DOM.style("#centerCircle", "display", "initial");
        DOM.style("#innerCircle", "display", "none");
    }

    four();

    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
        DOM.style("#centerCircle,#innerCircle", "display", "none");
    });
    viewSelect.addOption("four", function() {
        four();
        Make.updateNewMap();
    });

    viewSelect.addOption("five", function() {
        numberOfCircles = 5;
        Make.updateNewMap();
        DOM.style("#centerCircle,#innerCircle", "display", "initial");
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
    setKButton.setValue(6);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(4);
    setMButton.onChange = Make.updateNewMap;


    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(6);
    setNButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");


    //choosing the symmetries, and set initial values
    // second circle
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


    //choosing the symmetries, and set initial values
    // third circle
    let setK3Button = NumberButton.create("k3");
    setK3Button.setRange(2, 10000);
    setK3Button.setValue(3);
    setK3Button.onChange = Make.updateNewMap;

    let setM3Button = NumberButton.create("m3");
    setM3Button.setRange(2, 10000);
    setM3Button.setValue(3);
    setM3Button.onChange = Make.updateNewMap;

    let setN3Button = NumberButton.create("n3");
    setN3Button.setRange(2, 10000);
    setN3Button.setValue(3);
    setN3Button.onChange = Make.updateNewMap;

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
    // the third circle
    var r3, x3, y3;
    var cosAlpha3, sinAlpha3, cosBeta3, sinBeta3, cosGamma3, sinGamma3;
    // the three sectors
    //going from center of circle 1 to circle 2 
    // going from center of circle2 to the line
    var m12, m2;



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
            // separators
            m2 = -cosGamma1 / sinGamma1;
            m12 = (y2 - y1) / (x2 - x1);

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

    // calculate the third circle for intersecting with all three sides
    // they are the two straight lines and the second circle
    // same for all geometries
    function thirdCircleThreeIntersections() {
        // for the line containing the center of the second circle
        const u = (cosBeta3 + cosAlpha3 * cosGamma1) / sinGamma1;
        const v = cosAlpha3;
        const a = u * u + v * v - 1;
        const b = -2 * (x2 * u + y2 * v + r2 * cosGamma3);
        const c = x2 * x2 + y2 * y2 - r2 * r2;
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            r3 = solutions.x;
            x3 = r3 * u;
            y3 = r3 * v;
            circleScope.circle3.setRadiusCenterXY(r3, x3, y3);
            circleScope.circle3.map = circleScope.circle3.invertInsideOut;
        }
    }

    // separate the three triangles in the big triangle
    // make three sectors
    // sector 1 is close to origin, sector 2 is at x-axis, sector 0 at "diagonal" line
    function threeTriangleSectors(position, furtherResults) {
        const dx = position.x - x2;
        const dy = position.y - y2;
        if (dx < 0) {
            if (dy < m2 * dx) {
                furtherResults.colorSector = 1;
            } else {
                furtherResults.colorSector = 0;
                position.x -= x2;
                position.y -= y2 + y2;
            }
        } else {
            if (dy < m12 * dx) {
                furtherResults.colorSector = 2;
                position.x -= x2;
            } else {
                furtherResults.colorSector = 0;
                position.x -= x2;
                position.y -= y2 + y2;
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
            if (numberOfCircles >= 4) {
                let k2 = setK2Button.getValue();
                let m2 = setM2Button.getValue();
                let n2 = setN2Button.getValue();
                cosAlpha2 = Fast.cos(Math.PI / m2);
                sinAlpha2 = Fast.sin(Math.PI / m2);
                cosBeta2 = Fast.cos(Math.PI / n2);
                sinBeta2 = Fast.sin(Math.PI / n2);
                cosGamma2 = Fast.cos(Math.PI / k2);
                sinGamma2 = Fast.sin(Math.PI / k2);
                secondCircleThreeIntersections();
                if (numberOfCircles === 5) { // general case
                    let k3 = setK3Button.getValue();
                    let m3 = setM3Button.getValue();
                    let n3 = setN3Button.getValue();
                    cosAlpha3 = Fast.cos(Math.PI / m3);
                    sinAlpha3 = Fast.sin(Math.PI / m3);
                    cosBeta3 = Fast.cos(Math.PI / n3);
                    sinBeta3 = Fast.sin(Math.PI / n3);
                    cosGamma3 = Fast.cos(Math.PI / k3);
                    sinGamma3 = Fast.sin(Math.PI / k3);
                    thirdCircleThreeIntersections();
                    const m23 = (y3 - y2) / (x3 - x2);

                    circleScope.finishMap = function(position, furtherResults) {
                        let l2 = position.length2();
                        if (l2 > worldradius2) {
                            position.scale(0.25 * worldradius2 / l2);
                            furtherResults.colorSector = 3;
                        } else {
                            if (position.x < x3) {
                                if (position.y < y3 + (x3 - position.x) * m2) {
                                    furtherResults.colorSector = 0;
                                } else {
                                    furtherResults.colorSector = 1;
                                    position.x -= x3;
                                    position.y -= y3 + y3;
                                }
                            } else if (position.x < x2) {
                                if (position.y < y3 + (position.x - x3) * m23) {
                                    furtherResults.colorSector = 2;
                                    position.x -= x3;
                                } else if (position.y < y2 + (x2 - position.x) * m2) {
                                    furtherResults.colorSector = 1;
                                    position.x -= x3;
                                    position.y -= y3 + y3;
                                } else {
                                    furtherResults.colorSector = 4;
                                    position.x -= x2;
                                    position.y -= y2 + y2;
                                }
                            } else {
                                if (position.y < y2 + (position.x - x2) * m12) {
                                    furtherResults.colorSector = 5;
                                    position.x -= x2;
                                } else {
                                    furtherResults.colorSector = 4;
                                    position.x -= x2;
                                    position.y -= y2 + y2;
                                }
                            }
                        }
                    };
                }
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
                const lineWidth = lineWidthToImageSize * Make.outputImage.pixelCanvas.width;
                Draw.setLineWidth(1.5 * lineWidth);
                Draw.setColor("black");
                circleScope.dihedral.drawMirrors();
                circleScope.circle1.draw();
                if (numberOfCircles > 3) {
                    Draw.setLineWidth(lineWidth);
                    circleScope.circle2.draw();
                }
                if (numberOfCircles === 5) {
                    Draw.setLineWidth(0.7 * lineWidth);
                    circleScope.circle3.draw();
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
