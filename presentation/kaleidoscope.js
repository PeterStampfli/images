/* jshint esversion:6 */

Layout.setup("circleInversion.html", "kaleidoscopeLens.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

Make.createOutputImage("outputCanvas");
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

Layout.adjustDimensions();
Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let setKButton = Layout.createNumberButton("k");
setKButton.setRange(2, 10000);
setKButton.setValue(7);
setKButton.onChange = function(v) {
    Make.updateNewMap();
};

let setMButton = Layout.createNumberButton("m");
setMButton.setRange(2, 10000);
setMButton.setValue(3);
setMButton.onChange = function(v) {
    Make.updateNewMap();
};

let setNButton = Layout.createNumberButton("n");
setNButton.setRange(2, 10000);
setNButton.setValue(2);
setNButton.onChange = function(v) {
    Make.updateNewMap();
};

let sum = document.getElementById("sum");

// initializing things before calculating the map (uopdateKMN)
Make.initializeMap = function() {
    let k = setKButton.getValue();
    let m = setMButton.getValue();
    let n = setNButton.getValue();
    threeMirrorsKaleidoscope.setKMN(k, m, n);
    let angleSum = basicKaleidoscope.angleSum;
    angleSum = Math.round(180 * angleSum);
    sum.innerHTML = "" + angleSum;
};

Make.initializeMap();
// drawing the image with decos (updatekmn...)

Make.updateOutputImage = function() {
    Make.updateMapOutput();
    Draw.setLineWidth(0.5 * Layout.lineWidth);
    Draw.setColor(Layout.addMirrorColor);
    basicKaleidoscope.drawPolygon();
    // basicKaleidoscope.dihedral.drawAddMirrors();
    Draw.setLineWidth(Layout.lineWidth);
    Draw.setColor(Layout.mirrorColor);
    basicKaleidoscope.drawTriangle();
};

let zoomCenter = new Vector2();
let mousePosition = new Vector2();

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    let nullRadius = Make.outputImage.scale * Layout.nullRadius;
    Make.updateOutputImage();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    Draw.setLineWidth(0.7 * Layout.lineWidth);
    Draw.setColor(Layout.trajectoryColor);
    threeMirrorsKaleidoscope.drawTrajectory(mousePosition, nullRadius, Layout.pointColor);
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

// zoom at border of hyperbolic

Make.outputImage.mouseEvents.wheelAction = function(mouseEvents) {
    zoomCenter.setComponents(basicKaleidoscope.worldRadiusHyperbolic, 0);
    Make.outputImage.spaceToPixelCoordinates(zoomCenter);
    Make.outputImage.positionZoom(mouseEvents, zoomCenter.x, zoomCenter.y);
    Make.shiftScaleOutputImage();
};

Layout.createStructureImageButton("change");

// use another image ???
Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("Drottningholm.jpg");
