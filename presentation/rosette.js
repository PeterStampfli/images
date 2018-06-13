/* jshint esversion:6 */

Layout.setup("setup.html", "triangles.html");
Layout.setFontSizes();
Layout.activateFontSizeChanges();

Make.createOutputImage("outputCanvas");
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

dihedral = new Dihedral();

Make.setMapping(dihedral.vectorMapping, dihedral.reflectionsMapping);

let setKButton = Layout.createNumberButton("n");
setKButton.setRange(2, 10000);

setKButton.setValue(5);
setKButton.onChange = function() {
    Make.updateNewMap();
};

Make.initializeMap = function() {
    dihedral.setOrder(setKButton.getValue());
};
Make.initializeMap();

Make.updateOutputImage = function() {
    Make.updateMapOutput();
    Draw.setLineWidth(0.5 * Layout.lineWidth);
    Draw.setColor(Layout.addMirrorColor);
    dihedral.drawAddMirrors();
    Draw.setColor(Layout.mirrorColor);
    Draw.setLineWidth(Layout.lineWidth);
    dihedral.drawMirrors();
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
    Draw.setColor(Layout.pointColor);
    Draw.setLineWidth(0.7 * Layout.lineWidth);
    Draw.circle(nullRadius, mousePosition);
    imagePosition.set(mousePosition);
    Draw.setColor(Layout.trajectoryColor);
    dihedral.drawMap(imagePosition);
    Draw.setColor(Layout.pointColor);
    Draw.circle(nullRadius, imagePosition);

};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

Layout.createStructureImageButton("change");
Layout.createOpenImage();


Make.readImageWithFilePathAtSetup("guard.jpg");
