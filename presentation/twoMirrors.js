/* jshint esversion:6 */



Layout.setup("titel.html", "twoMirrors.html");


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

let r = 5;
let zero = new Vector2(0, 0);
let a = new Vector2(r, 0);
let b = new Vector2(r, 0);
let line1 = new Line(zero, a);
let line2 = new Line(zero, b);
line1.setColor(Layout.mirrorColor);
line2.setColor(Layout.mirrorColor);

Make.updateOutputImage = function() {
    Make.updateMapOutput();
    b.setPolar(r, -Math.PI / setKButton.getValue());
    line1.setLineWidth(Layout.lineWidth);
    line1.draw(Make.outputImage);
    line2.setLineWidth(Layout.lineWidth);
    line2.draw(Make.outputImage);

};



Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
