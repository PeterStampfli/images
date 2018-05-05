/* jshint esversion:6 */

Layout.setup("setup.html", "triangles.html");
Layout.setFontSizes();
Layout.activateFontSizeChanges();

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();



Layout.adjustDimensions();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

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

let mousePosition = new Vector2();
let imagePosition = new Vector2();
let zero = new Vector2(0, 0);

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    let nullRadius = Make.outputImage.scale * Layout.nullRadius;
    Make.updateOutputImage();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    Draw.setColor(Layout.dotColor);
    Draw.setLineWidth(0.7 * Layout.lineWidth);
    Draw.circle(nullRadius, mousePosition);
    imagePosition.set(mousePosition);
    Draw.setColor(Layout.pathColor);
    if (twoMirrors.drawMap(imagePosition) != 0) {
        Draw.setColor(Layout.dotColor);
        Draw.circle(nullRadius, imagePosition);
    }
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

Layout.createStructureImageButton("change");

console.log(Make.map.getCombinedPixelScale());

Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
