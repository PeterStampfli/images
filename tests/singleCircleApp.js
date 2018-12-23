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

    let viewSelect = new Select("view");
    viewSelect.addOption("direct", function() {
        console.log("direct view");
        multiCircles.projection = multiCircles.doNothing;
        Make.updateNewMap();
    });
    viewSelect.addOption("circle inversion", function() {
        console.log("inverted view");
        multiCircles.projection = multiCircles.circleInversionProjection;
        Make.updateNewMap();
    });

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

    Make.initializeMap = function() {};

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidth);
        Draw.setColor("black");
        intersectionLine.draw();
        multiCircles.draw();
        Draw.setColor("red");
        multiCircles.inversionCircle.draw();
        c.draw();
        l.draw();
        il.draw();
    };

    multiCircles.setMapping();
    //  multiCircles.finishMap = multiCircles.limitMap;
    multiCircles.setInversionCircle(5, 2, 0);
    const circle = multiCircles.addCircleOutsideIn(8, -6, 0);
    var intersectionLine = multiCircles.inversionCircle.lineOfCircleIntersection(circle);
    intersectionLine.setLength(100);

    const c = new Circle(4, 5, 0);
    const l = new Line(2, -9, 2, 9);
    const il = c.invertLine(l);

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
