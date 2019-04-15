/* jshint esversion:6 */

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "twoCirclesAppHelp.html");
    basicUI.setupGenerators();
    basicUI.setupIterationStyle();

    Make.imageQuality = "high";
    Make.map.discRadius = -1;

    Make.map.structureColorCollection = [];
    Make.map.addStructureColors(1, 120, 70);
    Make.map.addStructureColors(2, 120, 70);
    Make.map.addStructureColors(0, 120, 70);
    Make.map.addStructureColors(3.5, 120, 70);
    Make.map.addStructureColors(5, 120, 70);
    Make.map.rgbRotationInversionColorSymmetry();

    VectorMap.iterationGamma = 1.6;
    VectorMap.iterationSaturation = 6;
    VectorMap.iterationThreshold = 1;

    const rt2 = Math.sqrt(2);
    const rt3 = Math.sqrt(3);
    var worldradius, worldradius2;
    worldradius = 9.7;
    worldradius2 = worldradius * worldradius;

    triangleAppolonius();

    let geoSelect = new Select("geometry");

    geoSelect.addOption("triangle", function() {
        multiCircles.reset();
        triangle();
        Make.updateNewMap();
    });
    geoSelect.addOption("Apollonian gasket", function() {
        multiCircles.reset();
        triangleAppolonius();
        Make.updateNewMap();
    });
    geoSelect.addOption("Apollonian gasket plus", function() {
        multiCircles.reset();
        sevenAppolonius();
        Make.updateNewMap();
    });
    geoSelect.addOption("square", function() {
        multiCircles.reset();
        four();
        Make.updateNewMap();
    });

    geoSelect.addOption("Apollonian square gasket", function() {
        multiCircles.reset();
        fourAppolonius();
        Make.updateNewMap();
    });

    geoSelect.setIndex(1);

    let viewSelect = new Select("view");
    let invertedView = false;
    DOM.style("#generatorsDiv", "display", "initial");
    multiCircles.setupMouseForTrajectory();

    viewSelect.addOption("Poincaré disc", function() {
        console.log("direct view");
        Make.map.discRadius = -1;
        invertedView = false;
        multiCircles.projection = multiCircles.doNothing;
        basicUI.canShowGenerators = true;
        DOM.style("#generatorsDiv", "display", "initial");
        multiCircles.setupMouseForTrajectory();
        Make.updateNewMap();
    });

    function poincarePlane(position) {
        position.x /= worldradius;
        position.y /= worldradius;
        // cayley transform
        let r2 = position.x * position.x + position.y * position.y;
        let base = 1 / (r2 + 2 * position.y + 1.00001);
        position.y = -2 * position.x * base * worldradius;
        position.x = (r2 - 1) * base * worldradius;
        return 1;
    }

    viewSelect.addOption("Poincaré plane", function() {
        console.log("direct view");
        Make.map.discRadius = -1;
        invertedView = false;
        multiCircles.projection = poincarePlane;
        basicUI.canShowGenerators = false;
        DOM.style("#generatorsDiv", "display", "none");
        multiCircles.setupMouseNoTrajectory();
        Make.updateNewMap();
    });

    viewSelect.addOption("circle inversion", function() {
        console.log("inverted view");
        Make.map.discRadius = -1;
        invertedView = true;
        multiCircles.projection = multiCircles.circleInversionProjection;
        basicUI.canShowGenerators = true;
        DOM.style("#generatorsDiv", "display", "initial");
        multiCircles.setupMouseNoTrajectory();
        Make.updateNewMap();
    });

    function kleinDisc(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) / worldradius2;
        let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
        position.x *= mapFactor;
        position.y *= mapFactor;
        return 1;
    }

    viewSelect.addOption("klein disc", function() {
        console.log("klein view");
        Make.map.discRadius = worldradius;
        invertedView = true;
        multiCircles.projection = kleinDisc;
        basicUI.canShowGenerators = false;
        DOM.style("#generatorsDiv", "display", "none");
        multiCircles.setupMouseNoTrajectory();
        Make.updateNewMap();
    });

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-10, 10, -10);
    multiCircles.inversionCircle = new Circle(Math.sqrt(2) * worldradius, worldradius, 0);

    // building blocks
    function twoColorFinishMap(position, furtherResults) {
        let l2 = position.length2();
        if (l2 > worldradius2) {
            position.scale(worldradius2 / l2);
            furtherResults.colorSector = 3;
        } else {
            furtherResults.colorSector = 0;
        }
    }

    // basic triangle for simple poincare disc tiling with ideal triangle
    // includes fitting inversion circle
    function triangle() {
        const d = 2 * worldradius;
        const r = d / 2 * rt3;
        multiCircles.addCircleInsideOut(r, -d, 0);
        multiCircles.addCircleInsideOut(r, 0.5 * d, r);
        multiCircles.addCircleInsideOut(r, 0.5 * d, -r);
        multiCircles.finishMap = twoColorFinishMap;
    }

    // classical appolonius
    function triangleAppolonius() {
        triangle();
        const d = 2 * worldradius;
        const r = d / 2 * rt3;
        const rCenter = d - r;
        const rCenter05 = rCenter * 0.5;
        multiCircles.addCircleInsideOut(rCenter, 0, 0);
        multiCircles.finishMap = function(position, furtherResults) {
            let l2 = position.length2();
            if (l2 > worldradius2) {
                position.scale(worldradius2 / l2);
                furtherResults.colorSector = 3;
            } else {
                if (position.x > rCenter05) {
                    furtherResults.colorSector = 0;
                } else if (position.y > 0) {
                    furtherResults.colorSector = 1;
                } else {
                    furtherResults.colorSector = 2;
                }
            }
        };
    }

    // extra appolonius
    function sevenAppolonius() {
        triangleAppolonius();
        const d = 2 * worldradius;
        const r = d / 2 * rt3;
        const rCenter = d - r;
        const rho = (d * d - d * rCenter + rCenter * rCenter - r * r) / (2 * r + d - 2 * rCenter);
        const dd = rCenter + rho;
        multiCircles.addCircleInsideOut(rho, dd, 0);
        multiCircles.addCircleInsideOut(rho, -0.5 * dd, rt3 * 0.5 * dd);
        multiCircles.addCircleInsideOut(rho, -0.5 * dd, -rt3 * 0.5 * dd);
    }

    function four() {
        multiCircles.addCircleInsideOut(worldradius, worldradius, worldradius);
        multiCircles.addCircleInsideOut(worldradius, worldradius, -worldradius);
        multiCircles.addCircleInsideOut(worldradius, -worldradius, worldradius);
        multiCircles.addCircleInsideOut(worldradius, -worldradius, -worldradius);
        multiCircles.finishMap = twoColorFinishMap;
    }

    function fourAppolonius() {
        four();
        const rrr = (rt2 - 1) * worldradius;
        const c5 = multiCircles.addCircleInsideOut(rrr, 0, 0);
        multiCircles.finishMap = function(position, furtherResults) {
            let l2 = position.length2();
            if (l2 > worldradius2) {
                position.scale(worldradius2 / l2);
                furtherResults.colorSector = 3;
            } else {
                if (Math.abs(position.x) < Math.abs(position.y)) {
                    if (position.y > 0) {
                        furtherResults.colorSector = 0;
                    } else {
                        furtherResults.colorSector = 2;
                    }
                } else {
                    if (position.x > 0) {
                        furtherResults.colorSector = 1;
                    } else {
                        furtherResults.colorSector = 4;
                    }
                }
            }
        };
    }

    Make.initializeMap = function() {};

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(basicUI.lineWidthRange.getValue());
        if ((basicUI.generators.getIndex() > 0) && basicUI.canShowGenerators) {
            Draw.setColor(basicUI.generatorColor);
            Draw.setSolidLine();
            multiCircles.draw();
            Draw.setDashedLine(0.5);
            if (invertedView) {
                multiCircles.inversionCircle.draw();
            }
        }
        Draw.setSolidLine();
    };
    multiCircles.setMapping();
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
    basicUI.showSelectAdd();

};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
