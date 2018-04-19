/* jshint esversion:6 */



Layout.setup("titel.html", "rosette.html");

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);


Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();



Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-0.25, 1, -0.25);
Make.resetOutputImageSpace();

let kaleidoscope = new TriangleKaleidoscope();
kaleidoscope.setKMN(7, 2, 4);
console.log(kaleidoscope.worldRadius);

kaleidoscope.adjustIntersection();


console.log(kaleidoscope.worldRadius);

kaleidoscope.adjustWorldRadius(0.95);
console.log(kaleidoscope.worldRadius);

yellow = new Color(255, 255, 0, 255);

Make.outputImage.drawPixel(function(position, color) {
    color.set(yellow);

    return (position.y < 0);
});


kaleidoscope.drawLines(Layout.mirrorColor, Layout.lineWidth, Make.outputImage);
