/* jshint esversion:6 */

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
var m12, m22, m23;
var secondCircleExists, lineIntersection, circleSize;

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
        DOM.style("#innerCircle,#centerCircleSmall", "display", "none");
    }

    // startup configuration
    four();


    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
        DOM.style("#centerCircle,#innerCircle,#centerCircleSmall", "display", "none");
    });
    viewSelect.addOption("four I", function() {
        four();
        Make.updateNewMap();
    });
    viewSelect.addOption("four II", function() {
        numberOfCircles = -4;
        Make.updateNewMap();
        DOM.style("#centerCircleSmall", "display", "initial");
        DOM.style("#centerCircle,#innerCircle", "display", "none");
    });
    viewSelect.addOption("five", function() {
        numberOfCircles = 5;
        Make.updateNewMap();
        DOM.style("#centerCircle,#innerCircle", "display", "initial");
        DOM.style("#centerCircleSmall", "display", "none");
    });

    viewSelect.setIndex(1);

    Make.map.discRadius = -1;
    circleScope.projection = circleScope.doNothing;

    let projectionHyperbolic = new Select("projectionHyperbolic");
    var hyperbolicProjection = circleScope.doNothing;
    var hyperbolicRadius = -1;

    projectionHyperbolic.addOption("Poincaré disc surrounded", function() {
        hyperbolicProjection = circleScope.doNothing;
        hyperbolicRadius = -1;
        Make.updateNewMap();
    });
    projectionHyperbolic.addOption("Poincaré disc only", function() {
        hyperbolicProjection = circleScope.doNothing;
        hyperbolicRadius = worldradius;
        Make.updateNewMap();
    });
    projectionHyperbolic.addOption("Poincaré plane both", function() {
        hyperbolicProjection = poincarePlaneBoth;
        hyperbolicRadius = -1;
        Make.updateNewMap();
    });
    projectionHyperbolic.addOption("Poincaré plane single", function() {
        hyperbolicProjection = poincarePlaneSingle;
        hyperbolicRadius = -1;
        Make.updateNewMap();
    });


    projectionHyperbolic.addOption("Klein disc", function() {
        hyperbolicProjection = kleinDisc;
        hyperbolicRadius = worldradius;
        Make.updateNewMap();
    });

    let generators = new Select("generators");
    let showGenerators = true;
    let generatorColor = "black";

    generators.addOption("show in black",
        function() {
            showGenerators = true;
            generatorColor = "black";
            Make.updateOutputImage();
        });


    generators.addOption("show in white",
        function() {
            showGenerators = true;
            generatorColor = "white";
            Make.updateOutputImage();
        });

    generators.addOption("show in red",
        function() {
            showGenerators = true;
            generatorColor = "red";
            Make.updateOutputImage();
        });

    generators.addOption("hide",
        function() {
            showGenerators = false;
            Make.updateOutputImage();
        });

    //choosing the symmetries, and set initial values
    // basic triangle
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(4);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(4);
    setMButton.onChange = Make.updateNewMap;


    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(2);
    setNButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");


    //choosing the symmetries, and set initial values
    // second circle, three intersections
    let setK2Button = NumberButton.create("k2");
    setK2Button.setRange(2, 10000);
    setK2Button.setValue(3);
    setK2Button.onChange = Make.updateNewMap;

    let setM2Button = NumberButton.create("m2");
    setM2Button.setRange(2, 10000);
    setM2Button.setValue(4);
    setM2Button.onChange = function() {
        setM2sButton.setValue(setM2Button.getValue());
        Make.updateNewMap();
    };

    let setN2Button = NumberButton.create("n2");
    setN2Button.setRange(2, 10000);
    setN2Button.setValue(3);
    setN2Button.onChange = function() {
        setN2sButton.setValue(setN2Button.getValue());
        Make.updateNewMap();
    };

    // second circle, two intersections
    let circleSizeRange = Range.create("circleSizeChoice");
    circleSizeRange.setStep(0.001);
    circleSizeRange.setRange(0.0, 1);
    circleSizeRange.setValue(0.7);
    circleSizeRange.onChange = Make.updateNewMap;


    let setM2sButton = NumberButton.create("m2s");
    setM2sButton.setRange(2, 10000);
    setM2sButton.setValue(setM2Button.getValue());
    setM2sButton.onChange = function() {
        setM2Button.setValue(setM2sButton.getValue());
        Make.updateNewMap();
    };

    let setN2sButton = NumberButton.create("n2s");
    setN2sButton.setRange(2, 10000);
    setN2sButton.setValue(setN2Button.getValue());
    setN2sButton.onChange = function() {
        setN2Button.setValue(setN2sButton.getValue());
        Make.updateNewMap();
    };

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
        sum.innerHTML = "" + Math.round(180 * sumAngles) + "<sup>o</sup>";
        let k2 = setK2Button.getValue();
        let m2 = setM2Button.getValue();
        let n2 = setN2Button.getValue();
        cosAlpha2 = Fast.cos(Math.PI / m2);
        sinAlpha2 = Fast.sin(Math.PI / m2);
        cosBeta2 = Fast.cos(Math.PI / n2);
        sinBeta2 = Fast.sin(Math.PI / n2);
        cosGamma2 = Fast.cos(Math.PI / k2);
        sinGamma2 = Fast.sin(Math.PI / k2);
        circleSize = circleSizeRange.getValue();
        let k3 = setK3Button.getValue();
        let m3 = setM3Button.getValue();
        let n3 = setN3Button.getValue();
        cosAlpha3 = Fast.cos(Math.PI / m3);
        sinAlpha3 = Fast.sin(Math.PI / m3);
        cosBeta3 = Fast.cos(Math.PI / n3);
        sinBeta3 = Fast.sin(Math.PI / n3);
        cosGamma3 = Fast.cos(Math.PI / k3);
        sinGamma3 = Fast.sin(Math.PI / k3);
        // same for all
        circleScope.reset();
        circleScope.setDihedral(k1);
        circleScope.startMap = circleScope.nothingMap;
        // do nothing, no elements, if not hyperbolic, updateOutputImage shows error message
        if (sumAngles < 0.99) { // hyperbolic
            DOM.style("#projectionHyperbolicDiv", "display", "initial");
            DOM.style("#projectionEuklidicDiv,#projectionEllipticDiv", "display", "none");
            circleScope.projection = hyperbolicProjection;
            Make.map.discRadius = hyperbolicRadius;

            switch (numberOfCircles) {
                case 3:
                    firstCircleHyperbolic();
                    break;
                case 4:
                    firstCircleHyperbolic();
                    secondCircleHyperbolicAllIntersections();
                    break;
                case -4:
                    firstCircleHyperbolic();
                    secondCircleHyperbolicFourSmall();
                    break;
                case 5:
                    firstCircleHyperbolic();
                    secondCircleHyperbolicAllIntersections();
                    thirdCircleHyperbolic();
                    break;
            }
        } else if (sumAngles < 1.01) {
            console.log("euklid");
            DOM.style("#projectionEuklidicDiv", "display", "initial");
            DOM.style("#projectionHyperbolicDiv,#projectionEllipticDiv", "display", "none");

            switch (numberOfCircles) {
                case 3:
                    firstLineEuklidic();
                    break;
                case 4:
                    firstLineEuklidic();
                    secondCircleEuklidicAllIntersections();
                    break;
                case -4:
                    firstLineEuklidic();
                    secondCircleEuklidicFourSmall();
                    break;
                case 5:
                    firstLineEuklidic();
                    secondCircleEuklidicAllIntersections();
                    thirdCircleHyperbolic();
                    break;
            }
        } else {
            console.log(" elliptic");
            DOM.style("#projectionEllipticDiv", "display", "initial");
            DOM.style("#projectionHyperbolicDiv,#projectionEuklidicDiv", "display", "none");
            switch (numberOfCircles) {
                case 3:
                    firstCircleElliptic();
                    break;
                case 4:
                    firstCircleElliptic();
                    secondCircleEllipticAllIntersections();
                    break;
                case -4:
                    firstCircleElliptic();
                    secondCircleEllipticFourSmall();
                    break;
                case 5:
                    firstCircleElliptic();
                    secondCircleEllipticAllIntersections();
                    thirdCircleHyperbolic();
                    break;
            }
        }
    };

    // line width should relate to output image size!!
    const lineWidthToImageSize = 0.005;

    const zero = new Vector2();

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if (showGenerators) {
            const lineWidth = lineWidthToImageSize * Make.outputImage.pixelCanvas.width;
            Draw.setLineWidth(1.5 * lineWidth);
            Draw.setColor(generatorColor);
            console.log(generatorColor);
            circleScope.dihedral.drawMirrors();
            circleScope.circle1.draw();
            Draw.setLineWidth(lineWidth);
            circleScope.circle2.draw();
            Draw.setLineWidth(0.7 * lineWidth);
            circleScope.circle3.draw();
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
