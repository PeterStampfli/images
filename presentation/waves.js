/* jshint esversion:6 */

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "help.html");
    // where is the home ??


    Make.imageQuality = "high";

    Make.map.discRadius = -1;


    sumWaves.setRotationalSymmetry(8);




    function wavesmap(position, furtherResults) {
        furtherResults.lyapunov = 1;
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;

        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);

        position.x = sumWaves.cosines1(1);
        position.y = sumWaves.cosines2Even(1, 1) + sumWaves.cosines2Even(1, 2);

    }


    Make.setMapping(wavesmap);



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
    Make.setInitialOutputImageSpace(-10, 10, -10);



    Make.initializeMap = function() {

    };

    Make.updateOutputImage = function() {
        console.log(Make.imageQuality);
        Make.updateMapOutput();

    };
}

window.onload = function() {
    "use strict";
    creation();
    basicUI.onload();
    basicUI.activateControls(true);
    Make.readImageWithFilePathAtSetup("roseBuilding.jpg");

};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
