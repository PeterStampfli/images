/* jshint esversion:6 */

// create the UI elements and their interactions

function creation() {
    "use strict";

    basicUI.setupGenerators();


    rotaScope.rotationGroup.setOrder(5);
    rotaScope.rotationGroup.setRadialPower(2);
    const rotationGroup = rotaScope.rotationGroup;

    const dihedral = new Dihedral();

    Make.map.drawSector = [true, true];



    let centerSymmetryMap = function(position) {
        rotationGroup.rosette(position);
    };


    let symmetrySelect = new Select("symmetry");
    symmetrySelect.addOption("rotational",
        function() {
            console.log(" rotational");
            DOM.display("radialPowerDiv");
            centerSymmetryMap = function(position) {
                rotationGroup.rosette(position);
            };
            Make.updateNewMap();
        });

    symmetrySelect.addOption("dihedral",
        function() {
            console.log(" dihedral");
            DOM.displayNone("radialPowerDiv");
            centerSymmetryMap = function(position) {
                dihedral.map(position);
            };
            Make.updateNewMap();
        });

    symmetrySelect.addOption("none",
        function() {
            console.log(" none");
            DOM.displayNone("radialPowerDiv");
            centerSymmetryMap = function(position) {};
            Make.updateNewMap();
        });



    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;


    let setRButton = NumberButton.create("r");
    setRButton.setRange(1, RotationGroup.radialPowerMax);
    setRButton.setValue(2);
    setRButton.onChange = Make.updateNewMap;



    let setRadius1 = Range.create("radius1");
    setRadius1.setStep(0.001);
    setRadius1.setRange(0.01, 3);
    setRadius1.setValue(0.5);
    setRadius1.onChange = Make.updateNewMap;


    DOM.displayNone("innerCircleDiv");
    rotaScope.doOuter = true;


    let concentricCircles = new Select("concentric");
    concentricCircles.addOption("off", function() {
        DOM.displayNone("innerCircleDiv");

        rotaScope.doInner = false;
        Make.updateNewMap();
    });
    concentricCircles.addOption("on", function() {
        DOM.display("innerCircleDiv");
        rotaScope.doInner = true;
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


    let projectionMap = function(position) {
        return 1;
    };


    // projection
    let projectionSelect = new Select("projection");

    projectionSelect.addOption("direct",
        function() {
            console.log(" stereo");
            Make.map.discRadius = -1;
            projectionMap = function(position) {
                return 1;
            };
            Make.updateNewMap();
        });

    projectionSelect.addOption("inverted",
        function() {
            console.log(" inverted");
            Make.map.discRadius = -1;
            projectionMap = function(position) {
                position.scale(worldradius2 / position.length2());
                return 1;
            };
            Make.updateNewMap();
        });

    const v = new Vector2();

    projectionSelect.addOption("log",
        function() {
            console.log(" log");
            Make.map.discRadius = -1;
            projectionMap = function(position) {
                const r = worldradius * Fast.exp(position.x / worldradius);
                Fast.cosSin(position.y / worldradius, v);
                position.x = v.x * r;
                position.y = v.y * r;
                return 1;
            };
            Make.updateNewMap();
        });



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




    Make.initializeMap = function() {
        rotaScope.reset();
        k = setKButton.getValue();
        let r = setRButton.getValue();

        rotaScope.setRosetteParameters(k, r);
        dihedral.setOrder(k);
        let r1MaxRatio = Math.sin(Math.PI / k);
        r1MaxRatio = Math.min(0.9, r1MaxRatio);
        let ratio = r1MaxRatio * setRadius1.getValue();
        d1 = worldradius / Math.sqrt(1 - ratio * ratio);
        let r1 = ratio * d1;
        rotaScope.circleInsideOut(r1, d1, 0);

        let innerSymmetry = setInnerButton.getValue();

        Fast.quadraticEquation(1, 2 * r1 * Math.cos(Math.PI / innerSymmetry), r1 * r1 - d1 * d1, data);
        rotaScope.setInnerRadius(data.y);
        console.log(data.y);

        let outerSymmetry = setOuterButton.getValue();

        Fast.quadraticEquation(1, -2 * r1 * Math.cos(Math.PI / outerSymmetry), r1 * r1 - d1 * d1, data);
        rotaScope.setOuterRadius(data.y);
        console.log(data.y);
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
        if (projectionMap(position) < -0.1) {
            furtherResults.lyapunov = -1;
            return;
        }
        rotaScope.map(position, furtherResults);

        centerSymmetryMap(position);
    }

    Make.setMapping(map);



    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if (basicUI.generators.getIndex() > 0) {
            Draw.setLineWidth(basicUI.lineWidthRange.getValue());
            Draw.setColor(basicUI.generatorColor);
            Draw.setSolidLine();
            rotaScope.drawCircles();
        }

    };
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
