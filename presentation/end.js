/* jshint esversion:6 */

Layout.setup("interpolation.html", "");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

Make.createOutputImage("outputCanvas", window.innerHeight);
DOM.style("#outputCanvas", "cursor", "pointer");


Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();
Make.setOutputSize(window.innerHeight);


Make.imageQuality = "high";

text = new BigDiv("text", window.innerWidth - window.innerHeight, window.innerHeight, window.innerHeight);

Layout.adjustDimensions();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.65;
cutCornersKaleidoscope.setKMN(4, 5, 2);

Layout.createOpenImage();



Make.readImageWithFilePathAtSetup("pride.jpg");
