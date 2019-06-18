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

    basicUI.setupIterationStyle();

    let viewSelect = new Select("view");
    var numberOfCircles;

    function four() {
        numberOfCircles = 4;
        DOM.style("#centerCircle", "display", "initial");
        DOM.style("#inversion", "display", "initial");
    }

    // startup configuration
    four();

    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
        DOM.style("#centerCircle", "display", "none");
        DOM.style("#inversion", "display", "none");
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
    const hyperbolicInversionRadiusFactor = 0.5;
    var hyperbolicInversionRadius2;

    projectionHyperbolic.addOption("Poincaré disc", function() {
        hyperbolicCanShowGenerators = true;
        hyperbolicProjection = circleScope.doNothing;
        hyperbolicRadius = -1;
        Make.updateNewMap();
    });

    projectionHyperbolic.addOption("inverted Poincaré disc", function() {
        hyperbolicCanShowGenerators = false;
        hyperbolicInversionRadius2 = worldradius2 * hyperbolicInversionRadiusFactor * hyperbolicInversionRadiusFactor;
        hyperbolicProjection = function(position) {
            position.scale(hyperbolicInversionRadius2 / position.length2());
            return 1;
        };
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
    const euklidicInversionRadiusFactor = 0.5;
    var euklidicInversionRadius2;

    projectionEuklidic.addOption("Normal", function() {
        euklidicCanShowGenerators = true;
        euklidicProjection = circleScope.doNothing;
        euklidicRadius = -1;
        Make.updateNewMap();
    });

    projectionEuklidic.addOption("Inverted", function() {
        euklidicCanShowGenerators = false;
        euklidicInversionRadius2 = worldradius2 * euklidicInversionRadiusFactor * euklidicInversionRadiusFactor;
        euklidicProjection = function(position) {
            position.scale(euklidicInversionRadius2 / position.length2());
            return 1;
        };
        euklidicRadius = -1;
        Make.updateNewMap();
    });

    projectionEuklidic.addOption("Spiral", function() {
        euklidicCanShowGenerators = false;
        euklidicProjection = basicEuclidicSpiral;
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

    projectionElliptic.addOption("inverted Stereographic", function() {
        ellipticCanShowGenerators = false;
        ellipticProjection = function(position) {
            position.scale(worldradius2 / position.length2());
            return 1;
        };
        ellipticRadius = -1;
        Make.updateNewMap();
    });

    projectionElliptic.addOption("Orthographic (above)", function() {
        ellipticCanShowGenerators = false;
        ellipticProjection = kleinDisc;
        ellipticRadius = worldradius;
        Make.updateNewMap();
    });

    projectionElliptic.addOption("Orthographic (below)", function() {
        ellipticCanShowGenerators = false;
        ellipticProjection = ellipticProjection = function(position) {
            const ok = kleinDisc(position);
            if (ok >= 0) {
                position.scale(worldradius2 / position.length2());
            }
            return ok;
        };
        ellipticRadius = worldradius;
        Make.updateNewMap();
    });

    basicUI.setupGenerators();

    //choosing the symmetries, and set initial values
    // basic triangle
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 1000);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.createInfinity("m");
    setMButton.setRange(2, 1000);
    setMButton.setValue(4);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.createInfinity("n");
    setNButton.setRange(2, 1000);
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
    setK2Button.setRange(2, 1000);
    setK2Button.setValue(3);
    setK2Button.onChange = Make.updateNewMap;

    let setM2Button = NumberButton.createInfinity("m2");
    setM2Button.setRange(2, 1000);
    setM2Button.setValue(4);
    setM2Button.onChange = function() {
        Make.updateNewMap();
    };

    let setN2Button = NumberButton.createInfinity("n2");
    setN2Button.setRange(2, 1000);
    setN2Button.setValue(3);
    setN2Button.onChange = function() {
        Make.updateNewMap();
    };

    // symmetries
    const rotationButton = new Button("rotation");
    rotationButton.onClick = function() {
        console.log("rotate");
        let h = setKButton.getValue();
        setKButton.setValue(setMButton.getValue());
        setMButton.setValue(setNButton.getValue());
        setNButton.setValue(h);
        h = setM2Button.getValue();
        setM2Button.setValue(setK2Button.getValue());
        setK2Button.setValue(setN2Button.getValue());
        setN2Button.setValue(h);
        Make.updateNewMap();
    };

    function exchangeButtonValues(a, b) {
        let h = a.getValue();
        a.setValue(b.getValue());
        b.setValue(h);
    }

    Button.createAction("mirror", function() {
        console.log("mirror");
        exchangeButtonValues(setMButton, setNButton);
        exchangeButtonValues(setM2Button, setN2Button);
        Make.updateNewMap();
    });

    const inversionButton = new Button("inversion");
    inversionButton.onClick = function() {
        console.log("inversion");
        exchangeButtonValues(setMButton, setM2Button);
        exchangeButtonValues(setNButton, setN2Button);
        Make.updateNewMap();
    };


    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.structureColorCollection = [];
    Make.map.structureColorObjectCollection = [];
    let attenuation = 100;
    let zeroWhite = 140;
    Make.map.addStructureColors(1, zeroWhite, attenuation);
    Make.map.addStructureColors(2, zeroWhite, attenuation);
    Make.map.addStructureColors(0, zeroWhite, attenuation);
    Make.map.addStructureColors(3.5, zeroWhite, attenuation);
    Make.map.structureColorObjectCollection = [];
    attenuation = 100;
    zeroWhite = 130;
    Make.map.addStructureColors(1, zeroWhite, attenuation);
    zeroWhite = 120;
    Make.map.addStructureColors(2, zeroWhite, attenuation);
    zeroWhite = 80;
    Make.map.addStructureColors(0, zeroWhite, attenuation);
    zeroWhite = 80;
    Make.map.addStructureColors(3.5, zeroWhite, attenuation);
    // all yellow
    /* 
        Make.map.structureColorObjectCollection = [];

   attenuation = 100;
    zeroWhite = 130;
    //Make.map.addStructureColors(1, zeroWhite, attenuation);
    zeroWhite = 120;
    Make.map.addStructureColors(1, zeroWhite, attenuation);
    Make.map.addStructureColors(1, zeroWhite, attenuation);
    Make.map.addStructureColors(1, zeroWhite, attenuation);
    Make.map.addStructureColors(1, zeroWhite, attenuation);
    Make.map.addStructureColors(1, zeroWhite, attenuation);
  */

    // Make.map.addStructureColors(4, 140, 100);
    // Make.map.addStructureColors(5, 140, 100);

    Make.map.rgbRotationInversionColorSymmetry();

    circleScope.maxIterations = 200;
    circleScope.setupMouseForTrajectory();

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
        numbers2.innerHTML = "(" + infty(m1) + ", " + infty(k2) + ", " + infty(m2) + "),";
        numbers3.innerHTML = "(" + infty(n1) + ", " + infty(n2) + ", " + infty(k2) + "),";
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
            basicUI.canShowGenerators = hyperbolicCanShowGenerators;
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
            makeSpiralVector(k1, m1, n1);
            DOM.style("#projectionEuklidicDiv", "display", "initial");
            DOM.style("#projectionHyperbolicDiv,#projectionEllipticDiv", "display", "none");
            circleScope.projection = euklidicProjection;
            Make.map.discRadius = euklidicRadius;
            basicUI.canShowGenerators = euklidicCanShowGenerators;

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
            basicUI.canShowGenerators = ellipticCanShowGenerators;
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
        if (basicUI.canShowGenerators) {
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

    const lineWidthToUnit = 0.2;

    const zero = new Vector2();

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if ((basicUI.generators.getIndex() > 0) && basicUI.canShowGenerators) {
            Draw.setLineWidth(basicUI.lineWidthRange.getValue());
            Draw.setColor(basicUI.generatorColor);
            Draw.setSolidLine();
            circleScope.dihedral.drawMirrors();
            circleScope.circle1.draw();
            circleScope.circle2.draw();
            if ((sumAngles > 1.001)) {
                Draw.setDashedLine(0.5);
                Draw.circle(worldradius, zero);
            }
        }
        Draw.setSolidLine();
    };
    circleScope.setMapping();
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
    basicUI.showSelectAdd();
    basicUI.showSelectAddTwoColorStructure();
    basicUI.showSelectAddNothing();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
