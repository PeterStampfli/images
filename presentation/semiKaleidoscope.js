/* jshint esversion:6 */

Layout.setup("titel.html", "kaleidoscope.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

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

let setKButton = Layout.createNumberButton("k");
setKButton.setRange(2, 10000);
setKButton.setValue(7);
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
setNButton.setValue(3);
setNButton.onChange = function(v) {
    Make.updateNewMap();
};

let sum = document.getElementById("sum");
let worldRadiusHyperbolic = 0.97;
let worldRadiusElliptic = 0.5;
triangleKaleidoscope.intersectionMirrorXAxis = 0.3;

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


Layout.createStructureImageButton("change");

// use another image ???
Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
