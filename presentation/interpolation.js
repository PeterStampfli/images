/* jshint esversion:6 */

VectorMap.prototype.drawFast = VectorMap.prototype.drawInterpolation;


Layout.setup("kaleidoscopeLens.html", "end.html");
Layout.activateFontSizeChanges();

Make.createOutputImage("outputCanvas");
Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
Make.outputImage.setDivPosition(0, 0);
DOM.style("#outputCanvas", "cursor", "pointer");

Make.createControlImage("controlCanvas", false);
Make.controlImage.setDimensions(200, 200);
Make.controlImage.setPosition(0, 0);
Make.createArrowController("arrowController", false);
Make.arrowController.setSize(100);
Make.arrowController.setPosition(0, 0);
Make.createMap();
Make.setOutputSize(window.innerHeight);


Make.highImageQuality = false;
text = new BigDiv("text");
text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
text.setPosition(window.innerHeight, 0);
Layout.setFontSizes();



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



Make.readImageWithFilePathAtSetup("verySmall.jpg");
