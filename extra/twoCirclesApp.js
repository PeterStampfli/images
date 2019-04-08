/* jshint esversion:6 */

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "twoCirclesAppHelp.html");
    // where is the home ??

    Make.imageQuality = "high";


    let viewSelect = new Select("view");
    let invertedView = false;

    viewSelect.addOption("direct", function() {
        console.log("direct view");
        invertedView = false;
        multiCircles.projection = multiCircles.doNothing;
        Make.updateNewMap();
    });
    viewSelect.addOption("circle inversion", function() {
        console.log("inverted view");
        invertedView = true;
        multiCircles.projection = multiCircles.circleInversionProjection;
        Make.updateNewMap();
    });


    let setNButton = NumberButton.create("n");
    setNButton.setFloat(0.1);
    setNButton.setRange(2, 100);
    setNButton.setValue(4);
    setNButton.onChange = Make.updateNewMap;

    let secondCircle = Range.create("secondCircle");
    secondCircle.setRange(0.1, 1);
    secondCircle.setValue(1);
    secondCircle.onChange = Make.updateNewMap;

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

    var intersectionLine1, intersectionLine2;

    var h = 3.5;
    var equator;
    const xAxis = new Line(-1000, 0, 1000, 0);

    Make.initializeMap = function() {
        let n = setNButton.getValue();
        const alpha = Math.PI / n;
        const cosAlpha = Fast.cos(alpha);
        const r1 = 10;
        const r2 = r1 * secondCircle.getValue();
        const d = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * cosAlpha);
        multiCircles.reset();

        const c1 = multiCircles.addCircleOutsideIn(r1, d, 0);
        const c2 = multiCircles.addCircleOutsideIn(r2, 0, 0);
        const i1 = new Vector2();
        const i2 = new Vector2();

        c1.intersectsCircle(c2, i1, i2);
        c1.center.x -= i1.x;
        c2.center.x -= i1.x;
        c1.scale(h / Math.abs(i1.y));
        c2.scale(h / Math.abs(i1.y));

        multiCircles.inversionCircle = new Circle(Math.sqrt(2) * h, 0, h);

        intersectionLine1 = multiCircles.inversionCircle.lineOfCircleIntersection(c1);
        intersectionLine1.setLength(100);
        intersectionLine2 = multiCircles.inversionCircle.lineOfCircleIntersection(c2);
        intersectionLine2.setLength(100);
        equator = new Circle(h, 0, 0);
    };

    // line width should relate to unit length

    const lineWidthToUnit = 0.3;


    Make.updateOutputImage = function() {
        console.log(Make.imageQuality);
        Make.updateMapOutput();
        Draw.setLineWidth(lineWidthToUnit);
        Draw.setDashedLine(0);
        Draw.setColor("black");
        equator.draw();
        Draw.setColor("#bbbbff");
        multiCircles.draw();
        if (invertedView) {
            Draw.setColor("red");
            multiCircles.inversionCircle.draw();
            Draw.setColor("#aa6622");
            xAxis.draw();
            Draw.setColor("#ff8844");
            intersectionLine1.draw();
            intersectionLine2.draw();

        }
    };
    multiCircles.setMapping();
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
