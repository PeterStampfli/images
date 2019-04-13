/* jshint esversion:6 */


var sumAngles;

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


    VectorMap.iterationGamma = 1.6;
    VectorMap.iterationSaturation = 6;
    VectorMap.iterationThreshold = 1;

    let gammaRange = Range.create("gammaRange");
    gammaRange.setStep(0.001);
    gammaRange.setRange(0.5, 3);
    gammaRange.setValue(VectorMap.iterationGamma);
    gammaRange.onChange = function() {
        VectorMap.iterationGamma = gammaRange.getValue();
        Make.map.createIterationsColors();
        Make.updateOutputImage();
    };

    let threshold = NumberButton.create("threshold");
    threshold.setRange(1, 100);
    threshold.setValue(VectorMap.iterationThreshold);
    threshold.onChange = function() {
        VectorMap.iterationThreshold = threshold.getValue();
        Make.map.createIterationsColors();
        Make.updateOutputImage();
    };

    let saturation = NumberButton.create("saturation");
    saturation.setRange(1, 100);
    saturation.setValue(VectorMap.iterationSaturation);
    saturation.onChange = function() {
        VectorMap.iterationSaturation = saturation.getValue();
        Make.map.createIterationsColors();
        Make.updateOutputImage();
    };

    let viewSelect = new Select("view");
    var numberOfCircles = 3;

    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
    });

    viewSelect.addOption("two", function() {
        numberOfCircles = 2;
        Make.updateNewMap();
    });

    circleScope.projection = circleScope.doNothing;
    var directView = true;

    let projectionSelect = new Select("projection");
    multiCircles.setupMouseForTrajectory();

    projectionSelect.addOption("direct", function() {
        multiCircles.projection = circleScope.doNothing;
        directView = true;
        multiCircles.setupMouseForTrajectory();
        Make.updateNewMap();
    });

    projectionSelect.addOption("inverted", function() {
        circleScope.projection = circleScope.doNothing;
        multiCircles.projection = multiCircles.circleInversionProjection;
        directView = false;
        multiCircles.setupMouseNoTrajectory();
        Make.updateNewMap();
    });

    basicUI.setupGenerators();

    //choosing the symmetries, and set initial values
    // basic triangle
    let setN12Button = NumberButton.createInfinity("n12");
    setN12Button.setRange(2, 10000);
    setN12Button.setValue(5);
    setN12Button.onChange = Make.updateNewMap;

    let setN13Button = NumberButton.createInfinity("n13");
    setN13Button.setRange(2, 10000);
    setN13Button.setValue(4);
    setN13Button.onChange = Make.updateNewMap;

    let setN23Button = NumberButton.createInfinity("n23");
    setN23Button.setRange(2, 10000);
    setN23Button.setValue(2);
    setN23Button.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");

    let s1 = Range.create("size1");
    s1.setStep(0.001);
    s1.setRange(0.01, 2);
    s1.setValue(0.5);
    s1.onChange = Make.updateNewMap;

    let s2 = Range.create("size2");
    s2.setStep(0.001);
    s2.setRange(0.01, 2);
    s2.setValue(0.5);
    s2.onChange = Make.updateNewMap;

    let s3 = Range.create("size3");
    s3.setStep(0.001);
    s3.setRange(0.01, 2);
    s3.setValue(0.5);
    s3.onChange = Make.updateNewMap;

    let inversionSize = Range.create("inversionSize");
    inversionSize.setStep(0.001);
    inversionSize.setRange(0.01, 0.998);
    inversionSize.setValue(0.5);
    inversionSize.onChange = Make.updateNewMap;

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.structureColorCollection = [];
    Make.map.addStructureColors(1, 140, 100);
    Make.map.addStructureColors(3.5, 140, 100);
    // Make.map.addStructureColors(4, 140, 100);
    // Make.map.addStructureColors(5, 140, 100);

    Make.map.inversionColorSymmetry();

    circleScope.maxIterations = 200;

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

    Make.initializeMap = function() {
        multiCircles.reset();
        const r = 15;
        // get data for all circles (may be needed for all geometries)
        const n12 = setN12Button.getValue();
        const n13 = setN13Button.getValue();
        const n23 = setN23Button.getValue();
        sum.innerHTML = triangleGeometry(n12, n13, n23);
        sumAngles = 1 / n12 + 1 / n13 + 1 / n23;

        const r1 = r * s1.getValue();
        const r2 = r * s2.getValue();
        const r3 = r * s3.getValue();

        const d12 = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(Math.PI / n12));
        const d13 = Math.sqrt(r1 * r1 + r3 * r3 + 2 * r1 * r3 * Math.cos(Math.PI / n13));
        const d23 = Math.sqrt(r2 * r2 + r3 * r3 + 2 * r2 * r3 * Math.cos(Math.PI / n23));
        const gamma = Fast.triangleGammaOfABC(d12, d13, d23);

        let x1 = 0;
        let y1 = 0;
        let x2 = d12;
        let y2 = 0;
        let x3 = Math.cos(gamma) * d13;
        let y3 = -Math.sin(gamma) * d13;

        const delta = Fast.triangleGammaOfABC(d12, r1, r2);
        let xInv = Math.cos(delta) * r1;
        let yInv = -Math.sin(delta) * r1;

        const xm = 0.333 * (x1 + x2 + x3);
        const ym = 0.333 * (y1 + y2 + y3);

        x1 -= xm;
        x2 -= xm;
        x3 -= xm;

        y1 -= ym;
        y2 -= ym;
        y3 -= ym;

        xInv -= xm;
        yInv -= ym;

        multiCircles.addCircleInsideOut(r1, x1, y1);
        multiCircles.addCircleInsideOut(r2, x2, y2);
        if (numberOfCircles === 3) {
            multiCircles.addCircleInsideOut(r3, x3, y3);
            const triangle = new Polygon(new Vector2(x1, y1), new Vector2(x3, y3), new Vector2(x2, y2));
            multiCircles.finishMap = function(position, furtherResults) {
                if (triangle.contains(position)) {
                    furtherResults.colorSector = 1;
                } else {
                    furtherResults.colorSector = 0;
                }
            };
        } else {
            multiCircles.finishMap = function(position, furtherResults) {
                furtherResults.colorSector = 0;
            };
        }
        const inversionSizeValue = inversionSize.getValue();
        multiCircles.inversionCircle = new Circle(inversionSizeValue * r, xInv, yInv);
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidthRange.getValue()); // trajectory !!
        if ((basicUI.generators.getIndex() > 0) && basicUI.canShowGenerators) {
            Draw.setColor(basicUI.generatorColor);
            Draw.setSolidLine();
            multiCircles.draw();
            Draw.setDashedLine(0.5);
            if (!directView) {
                multiCircles.inversionCircle.draw();
            }
        }
        Draw.setSolidLine();
    };
    multiCircles.setMapping();
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
