/* jshint esversion:6 */

Layout.setup("circleInversion.html", "kaleidoscope.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

Make.createOutputImageNoColorSymmetry("outputCanvas");
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

const px = "px";

let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
Make.setOutputSize(windowHeight / 2, windowHeight);
DOM.style("#text", "left", windowHeight + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - windowHeight - 20) + px); // avoid horizontal scrollbar
DOM.style("#topRight", "right", (windowWidth - windowHeight) + px);

Make.setInitialOutputImageSpace(0, 1, -1);
Make.resetOutputImageSpace();

DOM.create("canvas", "lens", "body");
DOM.style("#lens", "position", "fixed", "left", Math.round(windowHeight / 2) + px, "top", "0px");
DOM.style("#lens", "backgroundColor", "red");




var lens = new LensImage("lens");

lens.setObject(Make.outputImage.pixelCanvas);

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

let worldRadiusHyperbolic = 0.97;
let worldRadiusElliptic = 0.5;
triangleKaleidoscope.intersectionMirrorXAxis = 0.3;
let sum = document.getElementById("sum");


// initializing things before calculating the map (uopdateKMN)
Make.initializeMap = function() {
    let k = setKButton.getValue();
    let m = setMButton.getValue();
    let n = setNButton.getValue();
    let angleSum = 180 * (1 / k + 1 / m + 1 / n);
    angleSum = Math.round(angleSum);
    sum.innerHTML = "" + angleSum;
    triangleKaleidoscope.setKMN(k, m, n);
    if (angleSum < 180) {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusHyperbolic);
    } else {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusElliptic);
    }
};

// drawing the image with decos (updatekmn...)

Make.updateOutputImage = function() {
    Make.updateMapOutput();

    // update lens??
};

let zoomCenter = new Vector2();
let mousePosition = new Vector2();

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {


};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

// zoom at border of hyperbolic

Make.outputImage.mouseEvents.wheelAction = function(mouseEvents) {


};

Layout.createStructureImageButton("change");

// use another image ???
Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
