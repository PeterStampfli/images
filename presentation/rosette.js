/* jshint esversion:6 */

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




let twoMirrors = new TwoMirrors();



let setKButton = Layout.createNumberButton("n");

setKButton.setValue(5);
setKButton.onChange = function(v) {
    Make.updateNewMap();

};


Make.initializeMap = function() {
    twoMirrors.setK(setKButton.getValue());
};


Make.setMapping(twoMirrors.vectorMapping, twoMirrors.reflectionsMapping);



Make.updateOutputImage = function() {
    Make.updateMapOutput();
    twoMirrors.drawLines(Layout.mirrorColor, Layout.lineWidth, Make.outputImage);

};



Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
