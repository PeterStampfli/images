Layout.setup("titel.html", "rosette.html");

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);


Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();



Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let kaleidoscope = new TriangleKaleidoscope();
kaleidoscope.setKMN(4, 3, 2);


kaleidoscope.drawLines(Layout.mirrorColor, Layout.lineWidth, Make.outputImage);
