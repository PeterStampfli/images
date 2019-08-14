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

    let setNButton = NumberButton.createInfinity("n");
    setNButton.setRange(2, 100);
    setNButton.setValue(4);
    setNButton.onChange = Make.updateNewMap;

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


    Make.initializeMap = function() {
        rotaScope.reset();
        let k = setKButton.getValue();
        let r = setRButton.getValue();
        let n = setNButton.getValue();

        rotaScope.setRosetteParameters(k, r);

        const ratio = Math.sin(Math.PI / k) / Math.cos(Math.PI / 2 / n);
        if (ratio > 1.001) { // elliptic
            dBase = worldradius / Math.sqrt(ratio * ratio - 1);
        } else if (ratio > 0.999) { //euklidic
            dBase = worldradius;
        } else { // hyperbolic
            dBase = worldradius / Math.sqrt(1 - ratio * ratio);
        }
        rBase = ratio * dBase;
        rotaScope.circleInsideOut(rBase, dBase, 0);
        // for line between color sectors:
        mBase = Math.sin(2 * Math.PI / k) / (1 - Math.cos(2 * Math.PI / k));

        let innerSymmetry = setInnerButton.getValue();

        Fast.quadraticEquation(1, 2 * rBase * Math.cos(Math.PI / innerSymmetry), rBase * rBase - dBase * dBase, data);
        rotaScope.setInnerRadius(data.y);
        console.log(data.y);

        let outerSymmetry = setOuterButton.getValue();

        Fast.quadraticEquation(1, -2 * rBase * Math.cos(Math.PI / outerSymmetry), rBase * rBase - dBase * dBase, data);
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
        rotaScope.map(position, furtherResults);
        // distinction between inside and outside
        if (position.y > mBase * (dBase - position.x)) {
            // outside, different color sector, invert position
            furtherResults.colorSector = 0;
            position.scale(worldradius2 / position.length2());
        } else {
            furtherResults.colorSector = 1;
        }
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
