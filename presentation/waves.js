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

    Make.updateOutputImage = function() {
        Make.updateMapOutput();

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
