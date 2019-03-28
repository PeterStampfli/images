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

    var gridColor = "red";

    Make.setMapping(function() {});


    const testLines = new DrawingLines();


    console.log(testLines.isEmpty());
    testLines.addParallelogram(Math.PI / 3, new Vector2(0, 0), new Vector2(8, 0));
    testLines.add(new Vector2(0, 0.0001), new Vector2(8, 0));
    testLines.add(new Vector2(8, 10.0001), new Vector2(0.001, 0));
    console.log(testLines.isEmpty());

    testLines.addRegularPolygon(7, new Vector2(-4, -8), new Vector2(4, -8));
    testLines.addRegularHalfPolygon(12, new Vector2(-10, -8), new Vector2(10, -8));
    testLines.addPolyline(new Vector2(-10, -10), new Vector2(-10, 10), new Vector2(10, -10));

    ambe.set(20, 3);

    // line width should relate to output image size!!
    const lineWidthToImageSize = 0.003;



    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        const lineWidth = lineWidthToImageSize * Math.sqrt(Make.outputImage.pixelCanvas.width * Make.outputImage.pixelCanvas.width);

        Draw.setLineWidth(1.5 * lineWidth);
        Draw.setColor(gridColor);
        ambe.draw();

    };
}





window.onload = function() {
    "use strict";
    creation();

    basicUI.onloadRectangular(50);
};

window.onresize = function() {
    "use strict";
    basicUI.onresizeRectangular();
};
