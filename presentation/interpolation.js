/* jshint esversion:6 */

VectorMap.prototype.drawFast = VectorMap.prototype.drawInterpolation;


Layout.setup("kaleidoscopeLens.html", "end.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

Make.createOutputImageNoColorSymmetry("outputCanvas");


Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

Make.highImageQuality = false;


Layout.adjustDimensions();

Make.setInitialOutputImageSpace(-0.1, 1.9, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.3;
threeMirrorsKaleidoscope.setKMN(5, 3, 2);

var hColor = new Color(0, 0, 0, 255);

Make.updateOutputImage = function() {
    Make.updateMapOutput();

    Make.outputImage.pixelCanvas.drawHorizontalLine(hColor, 0.33);
    Make.outputImage.pixelCanvas.drawHorizontalLine(hColor, 0.66);

};

Layout.createOpenImage();



Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
