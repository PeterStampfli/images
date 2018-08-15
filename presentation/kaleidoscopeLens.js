/* jshint esversion:6 */

let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
VectorMap.prototype.drawFast = VectorMap.prototype.drawHalf;

Layout.setup("kaleidoscope.html", "interpolation.html");
Layout.activateFontSizeChanges();
text = new BigDiv("text");
text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
text.setPosition(window.innerHeight, 0);


Make.createOutputImage("outputCanvas");
Make.outputImage.setDivDimensions(window.innerHeight / 2 + 1, window.innerHeight);
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


Make.setOutputSize(windowHeight / 2, windowHeight);

DOM.style("#topRight", "right", (windowWidth - windowHeight) + px);

Make.setInitialOutputImageSpace(0, 1, -1);
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


var lens = new LensImage("lens", windowHeight / 2 - 2 * Layout.lineWidth, windowHeight - 2 * Layout.lineWidth, windowHeight / 2, 0);
DOM.style("#lens", "border", Layout.lineWidth + "px solid " + Layout.mirrorColor);
DOM.style("#lens", "backgroundColor", "#bbbbbb");

lens.setObject(Make.outputImage.pixelCanvas);

// initializing things before calculating the map (uopdateKMN)
Make.initializeMap = function() {
    let k = setKButton.getValue();
    let m = setMButton.getValue();
    let n = setNButton.getValue();
    threeMirrorsKaleidoscope.setKMN(k, m, n);
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


Make.initializeMap();




Layout.createOpenImage();




// use another image ???
Make.readImageWithFilePathAtSetup("Drottningholm.jpg");
