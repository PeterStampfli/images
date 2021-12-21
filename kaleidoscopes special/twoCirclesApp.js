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
    let normalView = false;

    function ellipticNormalMap(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iRStereo2;
        let rt = (1 - r2worldRadius2);
        if (rt > 0.00001) {
            let mapFactor = 1 / (1 + Math.sqrt(rt));
            position.x *= mapFactor;
            position.y *= mapFactor;
            position.scale(rStereo2 / position.length2());
            return 1;
        } else {
            return -1;
        }
    }

    viewSelect.addOption("direct", function() {
        invertedView = false;
        normalView = false;
        Make.map.discRadius = -1;
        multiCircles.projection = multiCircles.doNothing;
        Make.updateNewMap();
    });
    viewSelect.addOption("circle inversion", function() {
        invertedView = true;
        normalView = false;
        Make.map.discRadius = -1;
        multiCircles.projection = multiCircles.circleInversionProjection;
        Make.updateNewMap();
    });


    viewSelect.addOption("normal view below", function() {
        invertedView = false;
        normalView = true;
        Make.map.discRadius = rStereo;
        multiCircles.projection = function(position) {
            ellipticNormalMap(position);
            // position.scale(rStereo2 / position.length2());

        };
        Make.updateNewMap();
    });
    viewSelect.addOption("normal view above", function() {
        invertedView = false;
        normalView = true;
        Make.map.discRadius = rStereo;
        multiCircles.projection = function(position) {
            ellipticNormalMap(position);
            position.scale(rStereo2 / position.length2());

        };
        Make.updateNewMap();
    });
    viewSelect.addOption("inverted normal view below", function() {
        invertedView = false;
        normalView = true;
        Make.map.discRadius = rStereo;
        multiCircles.projection = function(position) {
            ellipticNormalMap(position);
            // position.scale(rStereo2 / position.length2());
            multiCircles.circleInversionProjection(position);
        };
        Make.updateNewMap();
    });
    viewSelect.addOption("inverted normal view above", function() {
        invertedView = false;
        normalView = true;
        Make.map.discRadius = rStereo;
        multiCircles.projection = function(position) {
            ellipticNormalMap(position);
            position.scale(rStereo2 / position.length2());
            multiCircles.circleInversionProjection(position);
        };
        Make.updateNewMap();
    });

    let setNButton = NumberButton.create("n");
    setNButton.setFloat(0.1);
    setNButton.setRange(2, 100);
    setNButton.setValue(4);
    setNButton.onChange = Make.updateNewMap;


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

    var rStereo, rStereo2, iRStereo2;

    Make.initializeMap = function() {
        let n = setNButton.getValue();
        const alpha = Math.PI / n;
        const cosAlpha = Fast.cos(alpha);
        const r1 = 10;
        const r2 = r1;
        const d = Math.sqrt(r1 * r1 + r2 * r2 + 2 * r1 * r2 * cosAlpha);
        multiCircles.reset();

        const c1 = multiCircles.addCircleOutsideIn(r1, d / 2, 0);
        const c2 = multiCircles.addCircleOutsideIn(r2, -d / 2, 0);

        rStereo = Math.sqrt(r1 * r1 - d * d / 4);
        rStereo2 = rStereo * rStereo;
        iRStereo2 = 1 / rStereo2;
        multiCircles.inversionCircle = new Circle(Math.sqrt(2) * rStereo, 0, rStereo);

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
        // Draw.setDashedLine(0);
        if (!normalView) {

            Draw.setColor("black");
            // equator.draw();
            Draw.setColor("blue");
            multiCircles.draw();
            Draw.setDashedLine(0, 1);
            Draw.circle(rStereo, new Vector2());
            Draw.setSolidLine();
            if (invertedView) {
                Draw.setColor("red");
                multiCircles.inversionCircle.draw();

                Draw.setColor("#aa6622");
                //  xAxis.draw();
                Draw.setColor("orange");
                intersectionLine1.draw();
                intersectionLine2.draw();
            }
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
