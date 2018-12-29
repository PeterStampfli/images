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

    //choosing the symmetries, and set initial values

    let setNButton = NumberButton.create("n");
    setNButton.setRange(3, 10000);
    setNButton.setValue(4);
    setNButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(3, 10000);
    setMButton.setValue(12);
    setMButton.onChange = Make.updateNewMap;

    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(2);
    setKButton.onChange = Make.updateNewMap;

    let setPButton = NumberButton.create("p");
    setPButton.setRange(2, 10000);
    setPButton.setValue(30);
    setPButton.onChange = Make.updateNewMap;


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

    const solutions = new Vector2();

    Make.initializeMap = function() {
        console.log("init");
        const r1 = 8;
        multiCircles.reset();
        let n = setNButton.getValue();
        let m = setMButton.getValue();
        console.log(n);
        const alpha = Math.PI / n;
        const cosAlpha = Math.cos(alpha);
        const beta = Math.PI / m;
        const cosBeta = Math.cos(beta);
        multiCircles.addLineRightLeft(0, 0, 10, 0);
        multiCircles.addLineLeftRight(0, 0, 0, 10);
        multiCircles.addCircleOutsideIn(r1, 0, 0);
        const a = 1 - cosAlpha * cosAlpha;
        const b = -2 * r1 * cosBeta;

        const c = r1 * r1;
        console.log(a);
        console.log(b);
        console.log(c);
        if (Fast.quadraticEquation(a, b, c, solutions)) {
            solutions.log();
            const r2 = solutions.x;
            const d2 = r2 * cosAlpha;
            multiCircles.addCircleInsideOut(r2, 0, d2);
            const k = setKButton.getValue();
            const delta = Math.PI / k;
            const cosDelta = Math.cos(delta);
            const p = setPButton.getValue();
            const gamma = Math.PI / p;
            const cosGamma = Math.cos(gamma);
            const r = (d2 * d2 + r1 * r1 - r2 * r2) / 2 / (r2 * cosDelta + r1 * cosGamma);
            const d = Math.sqrt(r * r + r1 * r1 - 2 * r * r1 * cosGamma);
            multiCircles.addCircleInsideOut(r, d, 0);
        } else {
            console.log("**** no solution");
        }

    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidth);
        Draw.setColor("black");


        multiCircles.draw();
        Draw.solidLine();
        Draw.setColor("red");
    };

    multiCircles.setMapping();


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
