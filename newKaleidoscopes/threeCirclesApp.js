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
        circleScope.projection = circleScope.circleInversionProjection;
        Make.updateNewMap();
    });
    viewSelect.addOption("circle inversion", function() {
        console.log("inverted view");
        circleScope.projection = circleScope.doNothing;
        Make.updateNewMap();
    });
    circleScope.projection = circleScope.circleInversionProjection;

    //choosing the symmetries, and set initial values
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(3);
    setNButton.onChange = Make.updateNewMap;

    // show the sum of angles
    let sum = document.getElementById("sum");

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
    Make.setInitialOutputImageSpace(-15, 15, -15);

    Make.map.makeColorCollection(2, 1, 2, 64);
    Make.map.hueInversionColorSymmetry();

    const worldRadius = 9.7;
    const worldRadius2 = worldRadius * worldRadius;

    const angle = Math.PI / 12;
    const radius = 7;
    const d = Math.hypot(radius, worldRadius);
    circleScope.setInversionCircle(radius, d * Fast.cos(angle), d * Fast.sin(angle));

    var circle1, circle2, circle3;


    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n)) + "<sup>o</sup>";
        circleScope.triangleKaleidoscope(k, m, n);
        circle1 = circleScope.inversionCircle.invertLine(circleScope.dihedral.getLowerLine());
        circle2 = circleScope.inversionCircle.invertLine(circleScope.dihedral.getUpperLine());
        if (circleScope.geometry === "euklidic") {
            circle3 = circleScope.inversionCircle.invertLine(circleScope.circle1);
        } else {
            circle3 = circleScope.inversionCircle.invertCircle(circleScope.circle1);
        }
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidth);
        Draw.setColor("black");
        Draw.dashedLine(4, 6);
        circleScope.draw();
        Draw.solidLine();
        circle1.draw();
        circle2.draw();
        circle3.draw();
        Draw.setColor("red");
        circleScope.inversionCircle.draw();
    };

    circleScope.setMapping();


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
