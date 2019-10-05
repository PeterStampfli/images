/* jshint esversion:6 */

// create the UI elements and their interactions

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "sphericalKaleidoscopeHelp.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-1, 1, -1);

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

    /**
     * map the position for using an input image
     * @function map
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections, iterations, lyapunov and colorSector
     */
    const v = new Vector2();

    function map(position, furtherResults) {
        furtherResults.lyapunov = 1;
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        const r = Fast.exp(position.x);
        Fast.cosSin(position.y, v);
        position.x = v.x * r;
        position.y = v.y * r;
    }

    Make.setMapping(map);

    Make.initializeMap = function() {



    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();

        // SOME DRAWING

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
