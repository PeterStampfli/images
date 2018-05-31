/* jshint esversion:6 */

VectorMap.prototype.drawFast = VectorMap.prototype.drawInterpolation;


Layout.setup("titel.html", "setup.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

Make.createOutputImageNoColorSymmetry("outputCanvas");


Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

Make.highImageQuality = false;


Layout.adjustDimensions();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.3;
//cutCornersKaleidoscope.setKMN(5, 5, 2);
threeMirrorsKaleidoscope.setKMN(5, 3, 2);

Layout.createOpenImage();



Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
