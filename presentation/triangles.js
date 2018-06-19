/* jshint esversion:6 */



Layout.setup("rosette.html", "circleInversion.html");

Make.createOutputImage("outputCanvas", window.innerHeight);
Draw.setOutputImage(Make.outputImage);
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "default");


Layout.activateFontSizeChanges();

Layout.adjustDimensions();
Layout.setFontSizes();
Make.setOutputSize(window.innerHeight);


Make.setInitialOutputImageSpace(-0.25, 1, -0.25);
Make.resetOutputImageSpace();

basicKaleidoscope.intersectionMirrorXAxis = 0.6;
text = new BigDiv("text", window.innerWidth - window.innerHeight, window.innerHeight, window.innerHeight);


let sum = document.getElementById("sum");

function updateKMN() {
    let k = setKButton.getValue();
    let m = setMButton.getValue();
    let n = setNButton.getValue();
    let angleSum = 180 * (1 / k + 1 / m + 1 / n);
    angleSum = Math.round(angleSum);
    sum.innerHTML = "" + angleSum;
    basicKaleidoscope.setKMN(k, m, n);
    basicKaleidoscope.adjustIntersection();

    yellow = new Color(255, 255, 128, 255);
    background = new Color(128, 128, 128, 0);

    Make.outputImage.drawPixel(function(position, color) {
        if (basicKaleidoscope.isInsideTriangle(position)) {
            color.set(yellow);
        } else {
            color.set(background);
        }
    });
    Draw.setColor(Layout.mirrorColor);
    Draw.setLineWidth(Layout.lineWidth);
    basicKaleidoscope.drawTriangle();
}

let setKButton = Layout.createNumberButton("k");
setKButton.setRange(2, 10000);
setKButton.setValue(6);
setKButton.onChange = function(v) {
    updateKMN();
};

let setMButton = Layout.createNumberButton("m");
setMButton.setRange(2, 10000);
setMButton.setValue(3);
setMButton.onChange = function(v) {
    updateKMN();
};

let setNButton = Layout.createNumberButton("n");
setNButton.setRange(2, 10000);
setNButton.setValue(2);
setNButton.onChange = function(v) {
    updateKMN();
};

updateKMN();
