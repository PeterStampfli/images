/* jshint esversion:6 */

Layout.setup("setup.html", "triangles.html");
Layout.createStructureImageButton("change");

Layout.activateFontSizeChanges();

Make.createOutputImage("outputCanvas");
Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
Make.outputImage.setDivPosition(0, 0);
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", false);
Make.controlImage.setDimensions(200, 200);
Make.controlImage.setPosition(0, 0);
Make.createArrowController("arrowController", false);
Make.arrowController.setSize(100);
Make.arrowController.setPosition(0, 0);
Make.createMap();

Make.setOutputSize(window.innerHeight);



text = new BigDiv("text");
text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
text.setPosition(window.innerHeight, 0);


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

dihedral = new Dihedral();

basicKaleidoscope.geometry = basicKaleidoscope.euclidic;
Make.setMapping(dihedral.vectorMapping, dihedral.reflectionsMapping);

let setKButton = Layout.createNumberButton("n");
setKButton.setRange(2, 10000);

setKButton.setValue(5);
setKButton.onChange = function() {
    Make.updateNewMap();
};

Layout.setFontSizes();



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

Make.outputImage.move = function(mouseEvents) {
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

Layout.createOpenImage();


Make.readImageWithFilePathAtSetup("guard.jpg");
