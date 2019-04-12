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

    viewSelect.addOption("Poincaré disc", function() {
        console.log("direct view");
        Make.map.discRadius = -1;
        invertedView = false;
        multiCircles.projection = multiCircles.doNothing;
        canShowGenerators = true;
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
        canShowGenerators = false;
        Make.updateNewMap();
    });

    viewSelect.addOption("circle inversion", function() {
        console.log("inverted view");
        Make.map.discRadius = -1;
        invertedView = true;
        multiCircles.projection = multiCircles.circleInversionProjection;
        canShowGenerators = false;
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
        canShowGenerators = false;
        Make.updateNewMap();
    });

    let generators = new Select("generators");
    let generatorColor = "black";
    let canShowGenerators = true;

    generators.addOption("hide",
        function() {
            Make.updateOutputImage();
        });

    generators.addOption("show in black",
        function() {
            generatorColor = "black";
            Make.updateOutputImage();
        });

    generators.addOption("show in white",
        function() {
            generatorColor = "white";
            Make.updateOutputImage();
        });

    generators.addOption("show in red",
        function() {
            generatorColor = "red";
            Make.updateOutputImage();
        });
    generators.setIndex(1);

    let noGenerators = new Select("noGenerators");
    noGenerators.addOption(" - - - ", function() {});

    let width = Range.create("lineWidth");
    width.setStep(0.001);
    width.setRange(0.01, 0.6);
    width.setValue(0.25);
    width.onChange = function() {
        Make.updateOutputImage();
    };

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-10, 10, -10);

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
        multiCircles.addCircleInsideOut(r, 0, d);
        multiCircles.addCircleInsideOut(r, r, -0.5 * d);
        multiCircles.addCircleInsideOut(r, -r, -0.5 * d);
        multiCircles.inversionCircle = new Circle(d / 2, 0, -d * 0.5);
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
                if (position.y < -rCenter05) {
                    furtherResults.colorSector = 0;
                } else if (position.x > 0) {
                    furtherResults.colorSector = 1;
                } else {
                    furtherResults.colorSector = 2;
                }
            }
        };
    }

    function four() {
        multiCircles.addCircleInsideOut(worldradius, worldradius, worldradius);
        multiCircles.addCircleInsideOut(worldradius, worldradius, -worldradius);
        multiCircles.addCircleInsideOut(worldradius, -worldradius, worldradius);
        multiCircles.addCircleInsideOut(worldradius, -worldradius, -worldradius);
        multiCircles.finishMap = twoColorFinishMap;
        multiCircles.inversionCircle = new Circle(worldradius, 0, -worldradius);
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

    Make.initializeMap = function() {
        if (canShowGenerators) {
            DOM.style("#generatorsDiv", "display", "initial");
            DOM.style("#noGeneratorsDiv", "display", "none");
            multiCircles.setupMouseForTrajectory();
        } else {
            DOM.style("#generatorsDiv", "display", "none");
            DOM.style("#noGeneratorsDiv", "display", "initial");
            multiCircles.setupMouseNoTrajectory();
        }
    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        if ((generators.getIndex() > 0) && canShowGenerators) {
            Draw.setColor(generatorColor);
            Draw.setLineWidth(width.getValue());
            multiCircles.draw();
        }
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
