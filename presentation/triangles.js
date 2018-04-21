/* jshint esversion:6 */



Layout.setup("rosette.html", "triangles.html");

Make.createOutputImageNoMap("outputCanvas");
/*
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
*/

Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();



Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-0.25, 1, -0.25);
Make.resetOutputImageSpace();

let kaleidoscope = new TriangleKaleidoscope();



let sum = document.getElementById("sum");

console.log(sum);

function updateKMN() {
    console.log("update");
    let k = setKButton.getValue();
    let m = setMButton.getValue();
    let n = setNButton.getValue();
    let angleSum = 180 * (1 / k + 1 / m + 1 / n);
    angleSum = Math.round(angleSum);

    sum.innerHTML = "" + angleSum;

    kaleidoscope.setKMN(k, m, n);

    kaleidoscope.adjustIntersection();


    yellow = new Color(255, 255, 128, 255);
    background = new Color(255, 255, 240, 255);


    Make.outputImage.drawPixel(function(position, color) {
        if (kaleidoscope.isInside(position)) {
            color.set(yellow);
        } else {
            color.set(background);
        }
    });
    kaleidoscope.drawLines(Layout.mirrorColor, Layout.lineWidth, Make.outputImage);
}

let setKButton = Layout.createNumberButton("k");
setKButton.setRange(2, 10000);
setKButton.setValue(7);
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
