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


    Make.imageQuality = "high";

    Make.map.discRadius = -1;

        let drawGrid = drawNothing;
            var gridColor = "yellow";


    let gridSelect = new Select("grid");

    gridSelect.addOption("none",
        function() {
            drawGrid = drawNothing;
                        Make.updateOutputImage();
        });

    gridSelect.addOption("rosette (white)",
        function() {
            drawGrid = drawRosette;
            gridColor = "white";
            Make.updateOutputImage();

        });

    gridSelect.addOption("rosette (yellow)",
        function() {
            drawGrid = drawRosette;
            gridColor = "yellow";
            Make.updateOutputImage();

        });

    gridSelect.addOption("rosette (red)",
        function() {
            drawGrid = drawRosette;
            gridColor = "red";
            Make.updateOutputImage();

        });

    gridSelect.addOption("rosette (black)",
        function() {
            drawGrid = drawRosette;
            gridColor = "black";
            Make.updateOutputImage();

        });




    let setRotButton = NumberButton.create("rot");
    setRotButton.setRange(3, 20);
    setRotButton.setValue(5);
    setRotButton.onChange = Make.updateNewMap;

    



    function mapOdd(position, furtherResults) {
        furtherResults.lyapunov = 1;
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);
        position.x = sumWaves.cosines1(1);
        position.y = sumWaves.sines1(1);
    }

    function mapEven(position, furtherResults) {
        furtherResults.lyapunov = 1;
        furtherResults.reflections = 0;
        furtherResults.iterations = 0;
        sumWaves.calculatePositionTimesUnitvectors(position.x, position.y);
        position.x = sumWaves.cosines1(1);
        position.y = sumWaves.cosines2Even(1, 1);
    }

    Make.initializeMap = function() {
        let rot = setRotButton.getValue();
        sumWaves.setRotationalSymmetry(rot);
        if (sumWaves.oddRotSymmetry) {
            Make.setMapping(mapOdd);
        } else {
            Make.setMapping(mapEven);
        }
    };

    const basicVectors = [];
    const lengths = [0, 0, 0, 8.35, 4.5, 28,
    7.5, -82, 9.8, 84, 20.5,
        160, 26, 13, 14, 15,
        16, 17, 18, 19, 20
    ];
    for (var i = 0; i < 20; i++) {
        basicVectors.push(new Vector2());
    }

    function drawNothing() {}

    const a = new Vector2();
    const b = new Vector2();

    function drawRosette() {
        console.log("rosette");
        const rot = setRotButton.getValue();
        const l = lengths[rot];
        const zPiDivRot = 2 * Math.PI / rot;
        var i, j;
        for (i = 0; i < rot; i++) {
            const angle = zPiDivRot * i ;
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


    drawGrid = drawRosette;

    // line width should relate to output image size!!
    const lineWidthToImageSize = 0.003;



    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        const lineWidth = lineWidthToImageSize * Math.sqrt(Make.outputImage.pixelCanvas.width * Make.outputImage.pixelCanvas.width);

        Draw.setLineWidth(1.5 * lineWidth);
        Draw.setColor(gridColor);
        drawGrid();

    };
}

function drawGreenMagenta() {
    xAbsMax = Math.max(Math.abs(Make.lowerLeft.x), Math.abs(Make.upperRight.x));
    yAbsMax = Math.max(Math.abs(Make.lowerLeft.y), Math.abs(Make.upperRight.y));
    Make.map.drawStructureGreenMagenta(xAbsMax, yAbsMax);
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
