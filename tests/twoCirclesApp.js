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
        //      intersectionLine.draw();
        multiCircles.draw();
        Draw.setColor("red");
        multiCircles.inversionCircle.draw();
    };

    multiCircles.setMapping();

    const n = 5;
    const alpha = Math.PI / n;
    const cosAlpha = Fast.cos(alpha);
    const r1 = 11;
    const r2 = 8;
    const d = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * cosAlpha);

    const circle1 = multiCircles.addCircleOutsideIn(r1, d / 2, 0);
    const circle2 = multiCircles.addCircleOutsideIn(r2, -d / 2, 0);
    const i1 = new Vector2();
    const i2 = new Vector2();

    circle1.intersectsCircle(circle2, i1, i2);


    multiCircles.inversionCircle = new Circle(Vector2.difference(i1, i2).length(), i1);

    //  var intersectionLine = multiCircles.inversionCircle.lineOfCircleIntersection(circle);
    // intersectionLine.setLength(100);
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
