/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.3;
let windowWidth = window.innerWidth - 20;
let basicLenght = Math.round(sizeFraction * window.innerWidth);
const px = "px";


Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();

Make.createControlImage("controlCanvas", windowWidth * sizeFraction);
Make.createArrowController("arrowController", 200);
Make.createMap();

Layout.adjustDimensions();

DOM.style("#controlCanvas", "display", "initial"); // make visible with "initial"
DOM.style("#controlCanvas", "zIndex", "1");
DOM.style("#controlCanvas", "position", "absolute", "right", "20px");
DOM.style("#outputCanvas,#controlCanvas", "top", 3 * Layout.basicFontSize + px);
DOM.style("#text", "left", basicLenght + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - basicLenght) + px); // avoid horizontal scrollbar
DOM.style("#topRight", "right", "0px");

Make.setOutputSize(basicLenght, basicLenght);

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let worldRadiusHyperbolic = 0.97;
let worldRadiusElliptic = 0.65;
triangleKaleidoscope.intersectionMirrorXAxis = 0.3;

// initializing things before calculating the map (uopdateKMN)
Make.initializeMap = function() {
    let k = 5;
    let m = 2;
    let n = 4;
    let angleSum = 180 * (1 / k + 1 / m + 1 / n);
    angleSum = Math.round(angleSum);
    triangleKaleidoscope.setKMN(k, m, n);
    triangleKaleidoscope.cutSides();
    if (angleSum < 180) {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusHyperbolic);
    } else {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusElliptic);
    }
};


Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
