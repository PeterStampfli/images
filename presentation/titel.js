/* jshint esversion:6 */

Layout.setup("", "setup.html");
Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();

Make.createOutputImage("outputCanvas");
Make.outputImage.setDivPosition(0, 0);
Make.outputImage.setDivDimensions(window.innerHeight);
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "default");


text = new BigDiv("text");
text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
text.setPosition(window.innerHeight, 0);
Make.createControlImage("controlCanvas", false);
Make.controlImage.setDimensions(200, 200);
Make.createArrowController("arrowController", false);
Layout.setFontSizes();

Make.createMap();

Make.setOutputSize(window.innerHeight);

Make.imageQuality = "high";


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.6;
cutCornersKaleidoscope.setKMN(3, 5, 2);

Layout.createOpenImage();



Make.readImageWithFilePathAtSetup("GamlaStan.jpg");
