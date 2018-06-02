/* jshint esversion:6 */

Layout.setup("interpolation.html", "end.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.65;
cutCornersKaleidoscope.setKMN(4, 5, 2);

Layout.createOpenImage();



Make.readImageWithFilePathAtSetup("pride.jpg");
