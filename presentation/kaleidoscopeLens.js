/* jshint esversion:6 */

VectorMap.prototype.drawFast = VectorMap.prototype.drawHalf;

Layout.setup("kaleidoscope.html", "interpolation.html");
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
DOM.style("#lens", "border", Layout.lineWidth + "px solid " + Layout.mirrorColor);




var lens = new LensImage("lens");

lens.setObject(Make.outputImage.pixelCanvas);

lens.pixelCanvas.setupOnscreen(windowHeight / 2 - 2 * Layout.lineWidth, windowHeight - 2 * Layout.lineWidth);



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

let lensObjectCorner = new Vector2();
let hColor = new Color(0, 0, 0, 255);

Make.updateOutputImage = function() {
    Make.updateMapOutput();

    Make.outputImage.pixelCanvas.drawHorizontalLine(hColor, 0.5);
    lens.draw();
    // attention: transform to space coordiantes
    lensObjectCorner.setComponents(lens.objectCornerX, lens.objectCornerY);
    Make.outputImage.pixelToSpaceCoordinates(lensObjectCorner);
    let lensObjectWidth = lens.pixelCanvas.width / lens.magnification * Make.outputImage.scale;
    let lensObjectHeight = lens.pixelCanvas.height / lens.magnification * Make.outputImage.scale;
    Draw.setColor(Layout.mirrorColor);
    Draw.setLineWidth(Layout.lineWidth / 2);
    Draw.rectangle(lensObjectCorner.x, lensObjectCorner.y, lensObjectWidth, lensObjectHeight);
};

let center = new Vector2();

center.setComponents(windowWidth, windowHeight / 2);

lens.setCenter(center);

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {

    center.setComponents(mouseEvents.x, mouseEvents.y);
    lens.setCenter(center);
    Make.updateOutputImage();

};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};


Make.outputImage.mouseEvents.wheelAction = function(mouseEvents) {
    if (mouseEvents.wheelDelta > 0) {
        lens.changeMagnification(1);
    } else {
        lens.changeMagnification(-1);


    }
    Make.updateOutputImage();

};

Layout.createStructureImageButton("change");

Make.initializeMap();




Layout.createOpenImage();




// use another image ???
Make.readImageWithFilePathAtSetup("Drottningholm.jpg");
