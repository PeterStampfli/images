/* jshint esversion:6 */

VectorMap.prototype.drawFast = VectorMap.prototype.drawHalf;


Layout.setup("titel.html", "setup.html");
Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();
Layout.setFontSizes();

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();




Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

//Make.highImageQuality = true;


Layout.adjustDimensions();



Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

basicKaleidoscope.worldRadiusElliptic = 0.6;
cutCornersKaleidoscope.setKMN(3, 5, 2);

Layout.createOpenImage();




pix = Make.outputImage.pixelCanvas;
color = new Color();
limit = 50000000;

console.time("slow");
for (i = 0; i < limit; i++) {
    pix.getLinear(color, 100, 100);

}
console.timeEnd("slow");


console.time("fast");
for (i = 0; i < limit; i++) {
    pix.getLinearFast(color, 100, 100);

}
console.timeEnd("fast");


Make.readImageWithFilePathAtSetup("GamlaStan.jpg");
