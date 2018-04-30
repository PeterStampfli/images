/* jshint esversion:6 */

Layout.setup("titel.html", "kaleidoscope.html");
Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);

Layout.activateFontSizeChanges();
Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let sum = document.getElementById("sum");
let worldRadiusHyperbolic = 0.97;
let worldRadiusElliptic = 0.5;
triangleKaleidoscope.intersectionMirrorXAxis = 0.3;

let setKButton = Layout.createNumberButton("k");
setKButton.setRange(2, 10000);
setKButton.setValue(4);
setKButton.onChange = function(v) {
    Make.updateNewMap();
};

let setMButton = Layout.createNumberButton("m");
setMButton.setRange(2, 10000);
setMButton.setValue(2);
setMButton.onChange = function(v) {
    Make.updateNewMap();
};

let setNButton = Layout.createNumberButton("n");
setNButton.setRange(2, 10000);
setNButton.setValue(4);
setNButton.onChange = function(v) {
    Make.updateNewMap();
};

// initializing things before calculating the map (uopdateKMN)
Make.initializeMap = function() {
    let k = setKButton.getValue();
    let m = setMButton.getValue();
    let n = setNButton.getValue();
    let angleSum = 180 * (1 / k + 1 / m + 1 / n);
    angleSum = Math.round(angleSum);
    sum.innerHTML = "" + angleSum;
    triangleKaleidoscope.setKMN(k, m, n);
    triangleKaleidoscope.cutCorners();
    if (angleSum < 180) {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusHyperbolic);
    } else {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusElliptic);
    }
};

// drawing the image with decos (updatekmn...)

Make.updateOutputImage = function() {
    Make.updateMapOutput();
    Draw.setColor(Layout.mirrorColor);
    Draw.setLineWidth(Layout.lineWidth);
    triangleKaleidoscope.drawLines();
    Draw.setColor(Layout.lineColor);
    Draw.circle(triangleKaleidoscope.worldRadius, new Vector2(0, 0));
};

let nullRadius = 0.025;

let mousePosition = new Vector2();
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
    triangleKaleidoscope.drawTrajectory(nullRadius, mousePosition);
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

Layout.createStructureImageButton("change");

// use another image ???
Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
