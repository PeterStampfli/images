/* jshint esversion:6 */

Layout.setup("circleInversion.html", "kaleidoscopeLens.html");
Layout.createStructureImageButton("change");

Layout.activateFontSizeChanges();

Make.createOutputImage("outputCanvas");
Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
Make.outputImage.setDivPosition(0, 0);
DOM.style("#outputCanvas", "cursor", "crosshair");
DOM.style("#outputCanvas", "backgroundColor", "#bbbbbb");

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

Layout.setFontSizes();

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
let zero = new Vector2(0, 0);

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.move = function(mouseEvents) {
    let nullRadius = Make.outputImage.scale * Layout.nullRadius;
    Make.updateOutputImage();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    Draw.setLineWidth(0.7 * Layout.lineWidth);
    Draw.setColor(Layout.trajectoryColor);
    threeMirrorsKaleidoscope.drawTrajectory(mousePosition, nullRadius, Layout.pointColor);
    let circle = basicKaleidoscope.circles[basicKaleidoscope.dihedral.getSectorIndex(mousePosition)];
    if (circle.contains(mousePosition)) {
        Draw.setColor("white");
        Draw.line(zero, mousePosition);
        circle.draw();
    }
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

// zoom at border of hyperbolic

Make.outputImage.mouseEvents.wheelAction = function(mouseEvents) {
    zoomCenter.setComponents(basicKaleidoscope.worldRadiusHyperbolic, 0);
    Make.outputImage.spaceToPixelCoordinates(zoomCenter);


    if (mouseEvents.wheelDelta > 0) {
        Make.outputImage.zoom(Make.outputImage.zoomFactor, zoomCenter.x, zoomCenter.y);
    } else {
        Make.outputImage.zoom(1 / Make.outputImage.zoomFactor, zoomCenter.x, zoomCenter.y);
    }
    //Make.outputImage.zoom(mouseEvents, zoomCenter.x, zoomCenter.y);
    Make.shiftScaleOutputImage();
};


// use another image ???
Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("Drottningholm.jpg");
