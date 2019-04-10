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

    let viewSelect = new Select("view");
    var numberOfCircles = 3;




    viewSelect.addOption("three", function() {
        numberOfCircles = 3;
        Make.updateNewMap();
        DOM.style("#centerCircle", "display", "none");
    });



    circleScope.projection = circleScope.doNothing;
    var directView = true;

    let projectionSelect = new Select("projection");


    projectionSelect.addOption("direct", function() {
        circleScope.projection = circleScope.doNothing;
        directView = true;
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
    circleScope.setupMouseNoTrajectory();

    VectorMap.iterationGamma = 1.2;
    VectorMap.iterationSaturation = 10;
    VectorMap.iterationThreshold = 5;

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
        const r = 10;
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

        //??????????????????????????????
        multiCircles.inversionCircle = new Circle(10, 0, 5);



        let x1 = 0;
        let y1 = 0;
        let x2 = d12;
        let y2 = 0;
        let x3 = Math.cos(gamma) * d13;
        let y3 = -Math.sin(gamma) * d13;

        const xm = 0.333 * (x1 + x2 + x3);
        const ym = 0.333 * (y1 + y2 + y3);

        x1 -= xm;
        x2 -= xm;
        x3 -= xm;

        y1 -= ym;
        y2 -= ym;
        y3 -= ym;

        const m13 = (y3 - y1) / (x3 - x1);
        const m23 = (y3 - y2) / (x3 - x2);


        multiCircles.addCircleInsideOut(r1, x1, y1);
        multiCircles.addCircleInsideOut(r2, x2, y2);
        multiCircles.addCircleInsideOut(r3, x3, y3);

        multiCircles.finishMap = function(position, furtherResults) {
            const y = position.y - y1;
            if (y > 0) {
                furtherResults.colorSector = 3;
            } else {
                const x = position.x - x1;
                if (y < m13 * x) {
                    furtherResults.colorSector = 3;
                } else if (y < m23 * (x - d12)) {
                    furtherResults.colorSector = 3;
                } else {
                    furtherResults.colorSector = 0;
                }
            }
        };
    };

    // line width should relate to unit length

    const lineWidthToUnit = 0.15;

    const zero = new Vector2();

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if ((generators.getIndex() > 0) && canShowGenerators) {
            Draw.setLineWidth(1.5 * lineWidthToUnit);
            Draw.setColor(generatorColor);
            multiCircles.draw();

        }
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
