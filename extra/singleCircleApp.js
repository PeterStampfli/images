/* jshint esversion:6 */

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "singleCircleAppHelp.html");
    // where is the home ??

    basicUI.activateControls(true);

    Make.imageQuality = "high";

    let invertedView = false;
    let normalView = false;

    function ellipticNormalMap(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iRStereo2;
        let rt = (1 - r2worldRadius2);
        if (rt > 0.00001) {
            let mapFactor = 1 / (1 + Math.sqrt(rt));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        } else {
            return -1;
        }
    }

    let viewSelect = new Select("view");
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
    viewSelect.addOption("normal view", function() {
        invertedView = false;
        normalView = true;
        Make.map.discRadius = rStereo;
        multiCircles.projection = function(position) {
            ellipticNormalMap(position);
            position.scale(rStereo2 / position.length2());

        };
        Make.updateNewMap();
    });
    viewSelect.addOption("inverted normal view", function() {
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


    // line width should relate to unit length

    const lineWidthToUnit = 0.008;

    Make.updateOutputImage = function() {
        console.log(Make.imageQuality);
        Make.updateMapOutput();
        //Draw.setLineWidth(basicUI.lineWidth);
        let lineWidth = lineWidthToUnit / Make.outputImage.scale;
        if (!normalView) {
            Draw.setLineWidth(lineWidth);
            Draw.setColor("grey");
            //  equator.draw();
            Draw.setSolidLine();
            Draw.setColor("blue");
            multiCircles.draw();

            Draw.setDashedLine(0, 1);
            Draw.circle(rStereo, new Vector2());
            Draw.setSolidLine();

            if (invertedView) {
                Draw.setColor("orange");
                intersectionLine.draw();
                Draw.setColor("red");
                multiCircles.inversionCircle.draw();
            }
        }
    };

    multiCircles.setMapping();
    //  multiCircles.finishMap = multiCircles.limitMap;

    const r = 5;
    const d = 4;
    const border = 0.1;
    const delta = 2 * r * border;

    const rStereo = Math.sqrt(r * r - d * d);
    const rStereo2 = rStereo * rStereo;
    const iRStereo2 = 1 / rStereo2;
    const rInv = Math.sqrt(2) * rStereo;
    multiCircles.setInversionCircle(Math.sqrt(rStereo2 + (d + r) * (d + r)), d + r, 0);
    const circle = multiCircles.addCircleOutsideIn(r, d, 0);
    var intersectionLine = multiCircles.inversionCircle.lineOfCircleIntersection(circle);

    var equator = new Circle(intersectionLine.a.clone().sub(intersectionLine.b).length() / 2, intersectionLine.a.clone().add(intersectionLine.b).scale(0.5));


    intersectionLine.setLength(100);
}

window.onload = function() {
    "use strict";
    creation();
    basicUI.onload();
    Make.readImageWithFilePathAtSetup("schachbrett.jpg");
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
