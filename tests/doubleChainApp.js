/* jshint esversion:6 */

// create the UI elements and their interactions

function creation() {
    "use strict";

    basicUI.setupGenerators();


    rotaScope.rotationGroup.setOrder(5);
    rotaScope.rotationGroup.setRadialPower(2);

    Make.map.drawSector = [true, true];

    let visibleSelect = new Select("visible");
    visibleSelect.addOption("all",
        function() {
            Make.map.drawSector = [true, true];
            Make.updateOutputImage();
        });

    visibleSelect.addOption("inner",
        function() {
            Make.map.drawSector = [true, false];
            Make.updateOutputImage();
        });

    visibleSelect.addOption("outer",
        function() {
            Make.map.drawSector = [false, true];
            Make.updateOutputImage();
        });

    visibleSelect.addOption("none",
        function() {
            Make.map.drawSector = [false, false];
            Make.updateOutputImage();
        });


    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;


    let setRButton = NumberButton.create("r");
    setRButton.setRange(1, RotationGroup.radialPowerMax);
    setRButton.setValue(2);
    setRButton.onChange = Make.updateNewMap;

    let setN1Button = NumberButton.createInfinity("n1");
    setN1Button.setRange(2, 100);
    setN1Button.setValue(4);
    setN1Button.onChange = Make.updateNewMap;


    let setN2Button = NumberButton.createInfinity("n2");
    setN2Button.setRange(2, 100);
    setN2Button.setValue(4);
    setN2Button.onChange = Make.updateNewMap;


    let setRadius1 = Range.create("radius1");
    setRadius1.setStep(0.001);
    setRadius1.setRange(0.1, 1);
    setRadius1.setValue(0.5);
    setRadius1.onChange = Make.updateNewMap;

    let setRadius2 = Range.create("radius2");
    setRadius2.setStep(0.001);
    setRadius2.setRange(0.0, 1);
    setRadius2.setValue(0.5);
    setRadius2.onChange = Make.updateNewMap;


    let concentricCircles = new Select("concentric");
    concentricCircles.addOption("none", function() {
        rotaScope.doInner = false;
        rotaScope.doOuter = false;
        Make.updateNewMap();
    });
    concentricCircles.addOption("inner", function() {
        rotaScope.doInner = true;
        rotaScope.doOuter = false;
        Make.updateNewMap();
    });
    concentricCircles.addOption("outer", function() {
        rotaScope.doInner = false;
        rotaScope.doOuter = true;
        Make.updateNewMap();
    });
    concentricCircles.addOption("both", function() {
        rotaScope.doInner = true;
        rotaScope.doOuter = true;
        Make.updateNewMap();
    });


    let setInnerButton = NumberButton.createInfinity("inner");
    setInnerButton.setRange(2, 100);
    setInnerButton.setValue(4);
    setInnerButton.onChange = Make.updateNewMap;

    let setOuterButton = NumberButton.createInfinity("outer");
    setOuterButton.setRange(2, 100);
    setOuterButton.setValue(4);
    setOuterButton.onChange = Make.updateNewMap;



    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-12, 12, -12);

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

    Make.map.discRadius = -1; // not required, default
    Make.map.makeColorCollection(2, 1, 2.5, 140, 100);
    Make.map.hueInversionColorSymmetry();
    Make.map.inversionColorSymmetry();


    const worldradius = 10;

    const worldradius2 = worldradius * worldradius;

    var dBase, rBase, mBase;

    const data = new Vector2();

    var d1, x2, y2, dx1, dx2, dy1, dy2;

    var a, b, k;

    var circleA = new Circle();
    var circleB = new Circle();
    var centerA = new Vector2();
    var centerB = new Vector2();
    var intersection1 = new Vector2();
    var intersection2 = new Vector2();


    Make.initializeMap = function() {
        rotaScope.reset();
        k = setKButton.getValue();
        let r = setRButton.getValue();
        let n1 = setN1Button.getValue();
        let n2 = setN2Button.getValue();

        rotaScope.setRosetteParameters(k, r);

        let r1MaxRatio = Math.sin(Math.PI / k);
        r1MaxRatio = Math.min(0.9, r1MaxRatio);
        let ratio = r1MaxRatio * setRadius1.getValue();
        d1 = worldradius / Math.sqrt(1 - ratio * ratio);
        let r1 = ratio * d1;
        rotaScope.circleInsideOut(r1, d1, 0);

        let r2Min = d1 * Math.sin(Math.PI / k) - r1;
        let r2Max = d1 * Math.sin(Math.PI / k);
        let r2 = r2Min + setRadius2.getValue() * (r2Max - r2Min);

        a = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(Math.PI / n1));
        b = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * Math.cos(Math.PI / n2));
        let d = 2 * d1 * Math.sin(Math.PI / k);
        let beta = Fast.triangleGammaOfABC(a, d, b);
        let gamma = Math.PI * 0.5 - Math.PI / k - beta;
        x2 = d1 - a * Math.cos(gamma);
        y2 = a * Math.sin(gamma);

        centerA.setComponents(d1, 0);
        console.log(centerA);
        circleA.setRadiusCenter(a, centerA);
        centerB.setComponents(d1 * Math.cos(2 * Math.PI / k), d1 * Math.sin(2 * Math.PI / k));
        circleB.setRadiusCenter(b, centerB);


        rotaScope.circleInsideOut(r2, x2, y2);


        // values for the border
        dx1 = x2 - d1;
        dy1 = y2;
        dx2 = d1 * Math.cos(2 * Math.PI / k) - x2;
        dy2 = d1 * Math.sin(2 * Math.PI / k) - y2;


        /*
        let innerSymmetry = setInnerButton.getValue();

        Fast.quadraticEquation(1, 2 * rBase * Math.cos(Math.PI / innerSymmetry), rBase * rBase - dBase * dBase, data);
        rotaScope.setInnerRadius(data.y);
        console.log(data.y);

        let outerSymmetry = setOuterButton.getValue();

        Fast.quadraticEquation(1, -2 * rBase * Math.cos(Math.PI / outerSymmetry), rBase * rBase - dBase * dBase, data);
        rotaScope.setOuterRadius(data.y);
        console.log(data.y);
*/
    };


    /**
     * map the position for using an input image
     * @function map
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, iterations, lyapunov and colorSector
     */
    function map(position, furtherResults) {
        furtherResults.lyapunov = 1;
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        rotaScope.map(position, furtherResults);
        // distinction between inside and outside


        rotaScope.rotationGroup.rosette(position);
    }

    Make.setMapping(map);



    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidthRange.getValue());
        Draw.setColor(basicUI.generatorColor);
        Draw.setSolidLine();
        rotaScope.drawSector();
        rotaScope.drawCircles();


        circleA.draw();
        circleB.draw();
    };
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
