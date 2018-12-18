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
    Button.createGoToLocation("home", "home.html");

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
    imageTiles.dimensions(-10, 10, -10, 10, 0.5);

    imageTiles.allSymmetric = false;

    imageTiles.setMapping();

    Make.initializeMap = function() {

    };

    Make.updateOutputImage = function() {


        Make.updateMapOutput();

        Draw.setLineWidth(basicUI.lineWidth);

        Draw.setColor("red");


        circleScope.draw();
        //  multiCircles.draw();


    };






    //  Make.map.makeColorCollection(5, 0, 1, 40);


    Make.map.noColorSymmetry();


    //   Make.map.hueShiftInversionColorSymmetry(4);


    circleScope.setMapping();
    circleScope.setDihedral(5);
    circleScope.setupMouseForTrajectory();

    //    circleScope.circle2=circleScope.circleInsideOut(0.33,0.44,0);
    // circleScope.circle1=circleScope.lineLeftRight(0.43,0,0.4,1);
    //  circleScope.triangleCentralCircle(5, 2, 4, 3000, 5, 5);
    //  multiCircles.setMapping();
    //   apollinius.start(0, 6);

    //  circleScope.hyperbolicQuadranglek222(3,0.6);
    //circleScope.hyperbolicKite(3, 8, 2);

    circleScope.hyperbolicQuadrangle(2, 3, 3, 3, 0.3);

    console.log(document.getElementById("quality"));
    console.log(DOM.idExists("quality"));
}





window.onload = function() {
    "use strict";
    creation();
    basicUI.onload();
    basicUI.showSelectAddConvergence();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
