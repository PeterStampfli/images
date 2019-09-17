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


    let projectionMap = function(position) {
        return 1;
    };



    // projection
    let projectionSelect = new Select("projection");

    projectionSelect.addOption("stereographic/Poincaré disc",
        function() {
            console.log(" stereo");
            Make.map.discRadius = -1;
            projectionMap = function(position) {
                return 1;
            };
            Make.updateNewMap();
        });

    projectionSelect.addOption("Poincaré disc only",
        function() {
            console.log(" stereo");
            Make.map.discRadius = worldradius;
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

    projectionSelect.addOption("Poincaré plane",
        function() {
            console.log(" plane");
            Make.map.discRadius = -1;
            projectionMap = function(position) {
                position.x /= worldradius;
                position.y /= worldradius;
                // cayley transform
                let r2 = position.x * position.x + position.y * position.y;
                let base = 1 / (r2 + 2 * position.y + 1.00001);
                position.y = -2 * position.x * base * worldradius;
                position.x = (r2 - 1) * base * worldradius;
                return 1;
            };
            Make.updateNewMap();
        });

    projectionSelect.addOption("Klein disc/orthographic (above)",
        function() {
            console.log(" klein");
            Make.map.discRadius = worldradius;
            projectionMap = function(position) {
                let r2worldRadius2 = (position.x * position.x + position.y * position.y) / worldradius2;
                let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
                position.x *= mapFactor;
                position.y *= mapFactor;
                return 1;
            };
            Make.updateNewMap();
        });

    projectionSelect.addOption("Klein disc/orthographic (below)",
        function() {
            console.log(" klein below");
            Make.map.discRadius = worldradius;
            projectionMap = function(position) {
                let r2worldRadius2 = (position.x * position.x + position.y * position.y) / worldradius2;
                let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
                position.x *= mapFactor;
                position.y *= mapFactor;
                position.scale(worldradius2 / position.length2());
                return 1;
            };
            Make.updateNewMap();
        });

    // symmetries

    let centerSymmetryMap = function(position) {
        rotationGroup.rosette(position);
    };
    DOM.display("radialPowerDiv");

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

    let setNButton = NumberButton.createInfinity("n");
    setNButton.setRange(2, 100);
    setNButton.setValue(4);
    setNButton.onChange = Make.updateNewMap;

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
    const testPosition = new Vector2();
    var isHyperbolic;

    DOM.display("partsDiv");

    Make.initializeMap = function() {
        rotaScope.reset();
        let k = setKButton.getValue();
        let r = setRButton.getValue();
        let n = setNButton.getValue();
        rotaScope.setRosetteParameters(k, r);
        dihedral.setOrder(k);
        const ratio = Math.sin(Math.PI / k) / Math.cos(Math.PI / 2 / n);
        if (ratio > 1.001) { // elliptic
            dBase = worldradius / Math.sqrt(ratio * ratio - 1);
            isHyperbolic = false;
            DOM.displayNone("partsDiv");
        } else if (ratio > 0.999) { //euklidic
            dBase = worldradius;
            isHyperbolic = false;
            DOM.displayNone("partsDiv");
        } else { // hyperbolic
            dBase = worldradius / Math.sqrt(1 - ratio * ratio);
            isHyperbolic = true;
            DOM.display("partsDiv");
        }
        rBase = ratio * dBase;
        rotaScope.circleInsideOut(rBase, dBase, 0);
        // for line between color sectors:
        mBase = Math.sin(2 * Math.PI / k) / (1 - Math.cos(2 * Math.PI / k));
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
        // determine sector independent of symmtry at center
        testPosition.set(position);
        rotationGroup.rotateToFirstFromValidAngle(testPosition);

        // distinction between inside and outside
        if (testPosition.y > mBase * (dBase - testPosition.x)) {
            // outside, different color sector, invert position
            furtherResults.colorSector = 0;
            position.scale(worldradius2 / position.length2());
        } else {
            furtherResults.colorSector = 1;
        }
        if (isHyperbolic) {
            furtherResults.colorSector = 1 - furtherResults.colorSector;
        }
        // symmegtry at center
        centerSymmetryMap(position);
    }

    Make.setMapping(map);



    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidthRange.getValue());
        Draw.setColor(basicUI.generatorColor);
        Draw.setSolidLine();
        //  rotaScope.drawSector();
        rotaScope.drawCircles();
    };
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
    basicUI.showSelectAdd();
    basicUI.showSelectAddNothing();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
