/* jshint esversion:6 */

const worldradius = 11.9;
const worldradius2 = worldradius * worldradius;
var quincuncinalRadius = worldradius;
circleScope.setWorldradius(worldradius);
const solutions = new Vector2();
const v = new Vector2();

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
var m12, m22, m23;
var secondCircleExists, lineIntersection;

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
    }

    // startup configuration
    four();

    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
        DOM.style("#centerCircle", "display", "none");
    });

    viewSelect.addOption("four", function() {
        four();
        Make.updateNewMap();
    });

    viewSelect.setIndex(1);

    let projectionHyperbolic = new Select("projectionHyperbolic");
    var hyperbolicProjection = circleScope.doNothing;
    var hyperbolicRadius = -1;
    var hyperbolicCanShowGenerators = true;

    projectionHyperbolic.addOption("Poincaré disc", function() {
        hyperbolicCanShowGenerators = true;
        hyperbolicProjection = circleScope.doNothing;
        hyperbolicRadius = -1;
        Make.updateNewMap();
    });

    projectionHyperbolic.addOption("Poincaré plane", function() {
        hyperbolicCanShowGenerators = false;
        hyperbolicProjection = poincarePlane;
        hyperbolicRadius = -1;
        Make.updateNewMap();
    });


    projectionHyperbolic.addOption("Klein disc", function() {
        hyperbolicCanShowGenerators = false;
        hyperbolicProjection = kleinDisc;
        hyperbolicRadius = worldradius;
        Make.updateNewMap();
    });

    let projectionEuklidic = new Select("projectionEuklidic");
    var euklidicProjection = circleScope.doNothing;
    var euklidicRadius = -1;
    var euklidicCanShowGenerators = true;

    projectionEuklidic.addOption("Normal", function() {
        euklidicCanShowGenerators = true;
        euklidicProjection = circleScope.doNothing;
        euklidicRadius = -1;
        Make.updateNewMap();
    });


    projectionEuklidic.addOption("Inverted", function() {
        euklidicCanShowGenerators = false;
        euklidicProjection = function(position) {
            position.scale(worldradius2 / position.length2());
            return 1;
        };
        euklidicRadius = -1;
        Make.updateNewMap();
    });

    let projectionElliptic = new Select("projectionElliptic");
    var ellipticProjection = circleScope.doNothing;
    var ellipticRadius = -1;
    var ellipticCanShowGenerators = true;

    projectionElliptic.addOption("Stereographic", function() {
        ellipticCanShowGenerators = true;
        ellipticProjection = circleScope.doNothing;
        ellipticRadius = -1;
        Make.updateNewMap();
    });

    projectionElliptic.addOption("Orthographic", function() {
        ellipticCanShowGenerators = false;
        ellipticProjection = kleinDisc;
        ellipticRadius = worldradius;
        Make.updateNewMap();
    });


    let generators = new Select("generators");
    let generatorColor = "black";
    let canShowGenerators = true;



    generators.addOption("hide",
        function() {
            Make.updateOutputImage();
        });

    generators.addOption("show in black",
        function() {
            generatorColor = "black";
            Make.updateOutputImage();
        });


    generators.addOption("show in white",
        function() {
            generatorColor = "white";
            Make.updateOutputImage();
        });

    generators.addOption("show in red",
        function() {
            generatorColor = "red";
            Make.updateOutputImage();
        });
    generators.setIndex(1);

    let noGenerators = new Select("noGenerators");
    noGenerators.addOption(" - - - ", function() {});

    //choosing the symmetries, and set initial values
    // basic triangle
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.createInfinity("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(4);
    setMButton.onChange = Make.updateNewMap;


    let setNButton = NumberButton.createInfinity("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(2);
    setNButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");
    let sum1 = document.getElementById("sum1");
    let sum2 = document.getElementById("sum2");
    let sum3 = document.getElementById("sum3");
    let numbers1 = document.getElementById("numbers1");
    let numbers2 = document.getElementById("numbers2");
    let numbers3 = document.getElementById("numbers3");


    //choosing the symmetries, and set initial values
    // second circle, three intersections
    let setK2Button = NumberButton.createInfinity("k2");
    setK2Button.setRange(2, 10000);
    setK2Button.setValue(3);
    setK2Button.onChange = Make.updateNewMap;

    let setM2Button = NumberButton.createInfinity("m2");
    setM2Button.setRange(2, 10000);
    setM2Button.setValue(4);
    setM2Button.onChange = function() {
        Make.updateNewMap();
    };

    let setN2Button = NumberButton.createInfinity("n2");
    setN2Button.setRange(2, 10000);
    setN2Button.setValue(3);
    setN2Button.onChange = function() {
        Make.updateNewMap();
    };



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
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.structureColorCollection = [];
    Make.map.addStructureColors(1, 140, 100);
    Make.map.addStructureColors(2, 140, 100);
    Make.map.addStructureColors(0, 140, 100);
    Make.map.addStructureColors(3.5, 140, 100);
    // Make.map.addStructureColors(4, 140, 100);
    // Make.map.addStructureColors(5, 140, 100);



    Make.map.rgbRotationInversionColorSymmetry();

    circleScope.maxIterations = 200;
    circleScope.setupMouseForTrajectory();

    VectorMap.iterationGamma = 1.2;
    VectorMap.iterationSaturation = 8;
    VectorMap.iterationThreshold = 4;

    function triangleGeometry(k, m, n) {
        let sumAngles = 1 / k + 1 / m + 1 / n;
        let result = "sum of angles = " + Math.round(180 * sumAngles) + "<sup>o</sup>, ";
        if (sumAngles < 0.99) {
            result += "hyperbolic";
        } else if (sumAngles < 1.01) {
            result += "euklidic";
        } else {
            result += "elliptic";
        }
        return result + " geometry";
    }

    function infty(i) {
        if (i < 10000) {
            return i;
        } else {
            return "∞";
        }
    }


    Make.initializeMap = function() {
        // get data for all circles (may be needed for all geometries)
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
        sum.innerHTML = triangleGeometry(k1, m1, n1);
        let k2 = setK2Button.getValue();
        let m2 = setM2Button.getValue();
        let n2 = setN2Button.getValue();
        cosAlpha2 = Fast.cos(Math.PI / m2);
        sinAlpha2 = Fast.sin(Math.PI / m2);
        cosBeta2 = Fast.cos(Math.PI / n2);
        sinBeta2 = Fast.sin(Math.PI / n2);
        cosGamma2 = Fast.cos(Math.PI / k2);
        sinGamma2 = Fast.sin(Math.PI / k2);
        numbers1.innerHTML = "(" + infty(k1) + ", " + infty(m2) + ", " + infty(n2) + "),";
        numbers2.innerHTML = "(" + infty(k2) + ", " + infty(m2) + ", " + infty(m1) + "),";
        numbers3.innerHTML = "(" + infty(k2) + ", " + infty(n1) + ", " + infty(n2) + "),";
        sum1.innerHTML = "&nbsp " + triangleGeometry(k1, n2, m2);
        sum2.innerHTML = "&nbsp " + triangleGeometry(k2, m1, m2);
        sum3.innerHTML = "&nbsp " + triangleGeometry(k2, n1, n2);
        // same for all
        circleScope.reset();
        circleScope.setDihedral(k1);
        circleScope.startMap = circleScope.nothingMap;
        quincuncinalRadius = worldradius;
        if (sumAngles < 0.99) { // hyperbolic
            DOM.style("#projectionHyperbolicDiv", "display", "initial");
            DOM.style("#projectionEuklidicDiv,#projectionEllipticDiv", "display", "none");
            circleScope.projection = hyperbolicProjection;
            Make.map.discRadius = hyperbolicRadius;
            canShowGenerators = hyperbolicCanShowGenerators;
            switch (numberOfCircles) {
                case 3:
                    firstCircleHyperbolic();
                    break;
                case 4:
                    firstCircleHyperbolic();
                    secondCircleHyperbolicAllIntersections();
                    break;
            }
        } else if (sumAngles < 1.01) {
            DOM.style("#projectionEuklidicDiv", "display", "initial");
            DOM.style("#projectionHyperbolicDiv,#projectionEllipticDiv", "display", "none");
            circleScope.projection = euklidicProjection;
            Make.map.discRadius = euklidicRadius;
            canShowGenerators = euklidicCanShowGenerators;

            switch (numberOfCircles) {
                case 3:
                    firstLineEuklidic();
                    break;
                case 4:
                    firstLineEuklidic();
                    secondCircleEuklidicAllIntersections();
                    break;
            }
        } else {
            DOM.style("#projectionEllipticDiv", "display", "initial");
            DOM.style("#projectionHyperbolicDiv,#projectionEuklidicDiv", "display", "none");
            circleScope.projection = ellipticProjection;
            Make.map.discRadius = ellipticRadius;
            canShowGenerators = ellipticCanShowGenerators;
            switch (numberOfCircles) {
                case 3:
                    firstCircleElliptic();
                    break;
                case 4:
                    firstCircleElliptic();
                    secondCircleEllipticAllIntersections();
                    break;
            }
        }
        if (canShowGenerators) {
            DOM.style("#generatorsDiv", "display", "initial");
            DOM.style("#noGeneratorsDiv", "display", "none");
            circleScope.setupMouseForTrajectory();
        } else {
            DOM.style("#generatorsDiv", "display", "none");
            DOM.style("#noGeneratorsDiv", "display", "initial");
            circleScope.setupMouseNoTrajectory();
        }
    };

    // line width should relate to unit length

    const lineWidthToUnit = 0.15;

    const zero = new Vector2();

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if ((generators.getIndex() > 0) && canShowGenerators) {
            Draw.setLineWidth(1.5 * lineWidthToUnit);
            Draw.setColor(generatorColor);
            circleScope.dihedral.drawMirrors();
            circleScope.circle1.draw();
            Draw.setLineWidth(lineWidthToUnit);
            circleScope.circle2.draw();
        }
    };
    circleScope.setMapping();
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
    basicUI.showSelectAdd();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
