/* jshint esversion:6 */

var wave;

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "wavesHelp.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");
    Button.createGoToLocation("details",
        "https://geometricolor.wordpress.com/2019/04/04/waves-a-browser-app-for-creating-quasiperiodic-wallpapers/");


    Make.imageQuality = "high";

    // modification for 2 colorSector 
    Make.drawImage = function() {
        if (Make.inputImage.width == 0) {
            console.log("*** Make.updateOutputImage: input image not loaded !");
            return;
        }
        Make.controlImage.semiTransparent();
        Make.map.draw2Colors();
    };

    Make.map.discRadius = -1;

    let drawGrid = drawNothing;
    var gridColor = "yellow";


    let gridSelect = new Select("grid");

    gridSelect.addOption("no",
        function() {
            drawGrid = drawNothing;
            Make.updateOutputImage();
        });

    gridSelect.addOption("white",
        function() {
            drawGrid = drawTiling;
            gridColor = "white";
            Make.updateOutputImage();
        });

    gridSelect.addOption("yellow",
        function() {
            drawGrid = drawTiling;
            gridColor = "yellow";
            Make.updateOutputImage();
        });

    gridSelect.addOption("red",
        function() {
            drawGrid = drawTiling;
            gridColor = "red";
            Make.updateOutputImage();
        });

    gridSelect.addOption("black",
        function() {
            drawGrid = drawTiling;
            gridColor = "black";
            Make.updateOutputImage();
        });

    var rot = 5;

    let rotSelect = new Select("rotSymmetry");

    rotSelect.addOption("5-fold",
        function() {
            rot = 5;
            Make.updateNewMap();
        });

    rotSelect.addOption("8-fold",
        function() {
            rot = 8;
            Make.updateNewMap();
        });


    rotSelect.addOption("10-fold",
        function() {
            rot = 10;
            Make.updateNewMap();
        });


    rotSelect.addOption("12-fold",
        function() {
            rot = 12;
            Make.updateNewMap();
        });



    let colorSymmetry = false;

    let colorSelect = new Select("colors");

    colorSelect.addOption("single color",
        function() {
            colorSymmetry = false;
            Make.updateNewMap();
        });

    colorSelect.addOption("two color",
        function() {
            colorSymmetry = true;
            Make.updateNewMap();
        });

    // defaults (no change by mapping function): 
    //furtherResults.reflections = 0;
    //  furtherResults.lyapunov = 1;   will be recalculated
    //   furtherResults.colorSector = 0;
    //    furtherResults.iterations = 0;


    function mapOdd(position, furtherResults) {
        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);
        position.x = sumWaves.cosines1(1);
        position.y = sumWaves.sines1(1);
    }

    function mapEven(position, furtherResults) {
        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);
        position.x = sumWaves.cosines1(1);
        position.y = sumWaves.cosines2Even(1, 1);
    }

    // 2-colorsymmetry furtherResults.colorSector
    const colorSymmetryAmplification = 4;

    function mapEvenOdd2Colors(position, furtherResults) {
        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);
        const x = sumWaves.alternatingSines1(1);
        position.x = Math.abs(x);
        position.y = sumWaves.cosines2Even(1, 1);
        furtherResults.colorSector = Math.max(0, Math.min(255, Math.floor(127.5 * (1 + colorSymmetryAmplification * x))));
    }

    function mapEvenEven2Colors(position, furtherResults) {
        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);
        const x = sumWaves.alternatingCosines1(1);
        position.x = Math.abs(x);
        position.y = sumWaves.cosines2Even(1, 1);
        furtherResults.colorSector = Math.max(0, Math.min(255, Math.floor(127.5 * (1 + colorSymmetryAmplification * x))));
    }


    Make.initializeMap = function() {
        sumWaves.setRotationalSymmetry(rot);
        if (sumWaves.oddRotSymmetry) {
            Make.setMapping(mapOdd);
        } else {
            if (colorSymmetry) {
                console.log("colorsymmetry");
                if (rot & 2) {
                    Make.setMapping(mapEvenOdd2Colors);
                } else {
                    Make.setMapping(mapEvenEven2Colors);
                }
            } else {
                Make.setMapping(mapEven);
            }
        }
    };

    const basicVectors = [];
    const lengths = [0, 0, 0, 8.35, 3.25, 28,
        4.3, -82, 18.3, 84, 17.3,
        160, 13.6, 13, 14, 15,
        16, 17, 18, 19, 20
    ];
    for (var i = 0; i < 20; i++) {
        basicVectors.push(new Vector2());
    }

    function drawNothing() {}

    const a = new Vector2();
    const b = new Vector2();

    function drawRosette() {
        const l = lengths[rot];
        const zPiDivRot = 2 * Math.PI / rot;
        var i, j;
        for (i = 0; i < rot; i++) {
            const angle = zPiDivRot * i;
            basicVectors[i].setComponents(l * Fast.cos(angle), l * Fast.sin(angle));
        }
        if (rot & 1) {
            for (i = 0; i < rot; i++) {
                a.setComponents(0, 0);
                for (j = 0; j < rot / 2; j++) {
                    b.set(a);
                    b.add(basicVectors[(j + i) % rot]);
                    Draw.line(a, b);
                    a.set(b);
                }
                for (j = 0; j < rot / 2; j++) {
                    b.set(a);
                    b.sub(basicVectors[(j + i) % rot]);
                    Draw.line(a, b);
                    a.set(b);
                }
            }
        } else {
            for (i = 0; i < rot; i++) {
                a.setComponents(0, 0);
                for (j = 0; j < rot; j++) {
                    b.set(a);
                    b.add(basicVectors[(j + i) % rot]);
                    Draw.line(a, b);
                    a.set(b);
                }
            }
        }
    }

    const tilings = [];

    // default for tiling: rosette
    for (i = 0; i <= 12; i++) {
        tilings.push(drawRosette);
    }

    ambe.set(257.6, 3);
    penroseRhombs.set(-808.95, 7); // use odd number!!
    stampfli.set(188.6, 2);

    tilings[5] = penroseRhombs.draw;
    tilings[8] = ambe.draw;
    tilings[12] = stampfli.draw;

    function drawTiling() {
        console.log("tiling");
        tilings[rot]();
    }


    // line width should relate to unit length

    const lineWidthToUnit = 1;

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(lineWidthToUnit);
        Draw.setColor(gridColor);
        drawGrid();
    };
}

function drawGreenMagenta() {
    xAbsMax = Math.max(Math.abs(Make.lowerLeft.x), Math.abs(Make.upperRight.x));
    yAbsMax = Math.max(Math.abs(Make.lowerLeft.y), Math.abs(Make.upperRight.y));
    Make.map.drawStructureGreenMagenta(Make.lowerLeft.x, Make.upperRight.x, Make.lowerLeft.y, Make.upperRight.y);
}

window.onload = function() {
    "use strict";
    creation();
    Make.draw = function() {
        drawGreenMagenta();
    };
    basicUI.onloadRectangular(50);


    basicUI.showSelect.actions[0] =
        function() {
            console.log("structure");
            Make.showingInputImage = false;
            Make.clearControlImage();
            basicUI.activateControls(false);
            Make.draw = function() {
                drawGreenMagenta();
            };
            Make.updateOutputImage();
        };


};

window.onresize = function() {
    "use strict";
    basicUI.onresizeRectangular();
};
