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
    basicUI.setupGenerators();
    basicUI.setupIterationStyle();

    var numberOfCircles = 3;



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

    // inverse stereographic projection, radius rs, particularly for elliptic case


    //choosing the symmetries, and set initial values
    // basic triangle
    let setN12Button = NumberButton.createInfinity("n12");
    setN12Button.setFloat();
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

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

    Make.map.structureColorCollection = [];
    Make.map.addStructureColors(1, 200, 100);
    Make.map.addStructureColors(3.5, 200, 100);
    // Make.map.addStructureColors(4, 140, 100);
    // Make.map.addStructureColors(5, 140, 100);

    Make.map.hueInversionColorSymmetry();

    circleScope.maxIterations = 200;

    const length = 2;
    const length2 = length * length;

    function triangleGeometry(k, m, n) {
        let sumAngles = 1 / k + 1 / m + 1 / n;
        let result = "sum of angles = " + Math.round(180 * sumAngles) + "<sup>o</sup>, ";
        if (sumAngles < 0.99) {
            return "hyperbolic";
        } else if (sumAngles < 1.01) {
            return "euklidic";
        } else {
            return "elliptic";
        }
    }

    var intersectionLine1, intersectionLine2, invertedCircle3, geometry;
    var ys, rs;

    Make.initializeMap = function() {
        multiCircles.reset();
        const r = 15;
        // get data for all circles (may be needed for all geometries)
        const n12 = setN12Button.getValue();
        const n13 = setN13Button.getValue();
        const n23 = setN23Button.getValue();
        sum.innerHTML = triangleGeometry(n12, n13, n23);
        sumAngles = 1 / n12 + 1 / n13 + 1 / n23;

        const r1 = r;
        const r2 = r;
        const r3 = r;

        const d12 = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(Math.PI / n12));
        const d13 = Math.sqrt(r1 * r1 + r3 * r3 + 2 * r1 * r3 * Math.cos(Math.PI / n13));
        const d23 = Math.sqrt(r2 * r2 + r3 * r3 + 2 * r2 * r3 * Math.cos(Math.PI / n23));
        const gamma = Fast.triangleGammaOfABC(d12, d13, d23);

        let x1 = -d12 / 2;
        let y1 = 0;
        let x2 = d12 / 2;
        let y2 = 0;
        let x3 = x1 + Math.cos(gamma) * d13;
        let y3 = -Math.sin(gamma) * d13;


        let xInv = 0;
        let yInv = Math.sqrt(r * r - d12 * d12 / 4);

        const d = d12;

        ys = (x3 * x3 + y3 * y3 - d * d / 4) / 2 / y3;


        y1 -= ys;
        y2 -= ys;
        y3 -= ys;


        const triangle = new Polygon(new Vector2(x1, y1), new Vector2(x3, y3), new Vector2(x2, y2));
        const c1 = multiCircles.addCircleInsideOut(r1, x1, y1);
        const c2 = multiCircles.addCircleInsideOut(r2, x2, y2);
        const circle3 = multiCircles.addCircleInsideOut(r3, x3, y3);


        geometry = triangleGeometry(n13, n23, n12);
        console.log(geometry);
        if (geometry == "elliptic") {
            console.log("e");
            rs = Math.sqrt(r * r - d * d / 4 - ys * ys);

            const rInv = Math.sqrt(rs * rs + (yInv - ys) * (yInv - ys));
            multiCircles.inversionCircle = new Circle(rInv, xInv, yInv - ys);
            intersectionLine1 = multiCircles.inversionCircle.lineOfCircleIntersection(c1);
            intersectionLine1.setLength(100);
            intersectionLine2 = multiCircles.inversionCircle.lineOfCircleIntersection(c2);
            intersectionLine2.setLength(100);
            invertedCircle3 = multiCircles.inversionCircle.invertCircle(circle3);
            multiCircles.finishMap = function(position, furtherResults) {
                furtherResults.colorSector = 0;
                position.scale(length2 / position.length2());
            };
        }
        if (geometry == "euklidic") {
            console.log("eu");
            rs = 0;
            const inversionRadiusFactor = 0.3;
            multiCircles.inversionCircle = new Circle(inversionRadiusFactor * r, xInv, -yInv - ys);
            intersectionLine1 = multiCircles.inversionCircle.lineOfCircleIntersection(c1);
            intersectionLine1.setLength(100);
            intersectionLine2 = multiCircles.inversionCircle.lineOfCircleIntersection(c2);
            intersectionLine2.setLength(100);
            invertedCircle3 = multiCircles.inversionCircle.lineOfCircleIntersection(circle3);
            invertedCircle3.setLength(100);
            multiCircles.finishMap = function(position, furtherResults) {
                furtherResults.colorSector = 0;
                position.scale(length2 / position.length2());

            };
        }
        if (geometry == "hyperbolic") {
            console.log("hy");
            rs = Math.sqrt(-r * r + d * d / 4 + ys * ys);

            const rInv = Math.sqrt(-rs * rs + (yInv - ys) * (yInv - ys));

            multiCircles.inversionCircle = new Circle(rInv, xInv, yInv - ys);
            intersectionLine1 = multiCircles.inversionCircle.lineOfCircleIntersection(c1);
            intersectionLine1.setLength(100);
            intersectionLine2 = multiCircles.inversionCircle.lineOfCircleIntersection(c2);
            intersectionLine2.setLength(100);
            invertedCircle3 = multiCircles.inversionCircle.invertCircle(circle3);
            multiCircles.finishMap = function(position, furtherResults) {
                if (triangle.contains(position)) {
                    furtherResults.colorSector = 0;
                } else {
                    furtherResults.colorSector = 1;
                    position.scale(length2 / position.length2());
                }
            };
        }
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidthRange.getValue()); // trajectory !!
        if ((basicUI.generators.getIndex() > 0) && basicUI.canShowGenerators) {
            Draw.setColor(basicUI.generatorColor);
            Draw.setSolidLine();
            multiCircles.draw();
            Draw.setDashedLine(0, 1);
            Draw.circle(rs, new Vector2(0, 0));
            Draw.setSolidLine();

            if (!directView) {
                Draw.setColor("orange");
                intersectionLine1.draw();
                intersectionLine2.draw();
                invertedCircle3.draw();
                Draw.setColor("red");

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
