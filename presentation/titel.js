/* jshint esversion:6 */

Layout.setup("", "setup.html");
Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();
Layout.setFontSizes();

Make.createOutputImage("outputCanvas", window.innerHeight);
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
                DOM.style("#outputCanvas", "cursor", "default");


text = new BigDiv("text", window.innerWidth - window.innerHeight, window.innerHeight, window.innerHeight);
Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

Make.setOutputSize(window.innerHeight);

Make.highImageQuality = true;


Layout.adjustDimensions();



Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.6;
cutCornersKaleidoscope.setKMN(3, 5, 2);

Layout.createOpenImage();



Make.readImageWithFilePathAtSetup("GamlaStan.jpg");
