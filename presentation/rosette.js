/* jshint esversion:6 */

Layout.setup("titel.html", "triangles.html");
Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);

Layout.activateFontSizeChanges();
//Layout.activateFontSizeChangesButtons();

Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let twoMirrors = new TwoMirrors();
Make.setMapping(twoMirrors.vectorMapping, twoMirrors.reflectionsMapping);

let setKButton = Layout.createNumberButton("n");
setKButton.setRange(2, 10000);

setKButton.setValue(5);
setKButton.onChange = function() {
    Make.updateNewMap();
};

Make.initializeMap = function() {
    twoMirrors.setK(setKButton.getValue());
};


Make.updateOutputImage = function() {
    Make.updateMapOutput();
    Draw.setColor(Layout.mirrorColor);
    Draw.setLineWidth(Layout.lineWidth);
    twoMirrors.drawLines();
};

let nullRadius = 0.03;

let mousePosition = new Vector2();
let imagePosition = new Vector2();
let zero = new Vector2(0, 0);
let mouseColor = "#ff8800ff";

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    Make.updateOutputImage();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    Draw.setColor(mouseColor);
    Draw.setLineWidth(0.7 * Layout.lineWidth);
    Draw.circle(nullRadius, mousePosition);
    imagePosition.set(mousePosition);
    if (twoMirrors.map(imagePosition) != 0) {

        Draw.circle(nullRadius, imagePosition);
        Draw.arcWithoutEnds(mousePosition, imagePosition, nullRadius, nullRadius, zero);
    }
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

Layout.createStructureImageButton("change");

Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
