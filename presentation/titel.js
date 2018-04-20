/* jshint esversion:6 */



Layout.setup("titel.html", "rosette.html");

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);


Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();



Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-0.25, 1, -0.25);
Make.resetOutputImageSpace();
