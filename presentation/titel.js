/* jshint esversion:6 */

Layout.setup("titel.html", "setup.html");
Layout.activateFontSizeChanges();
Layout.activateFontSizeChangesButtons();
Layout.setFontSizes();

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();

Layout.adjustDimensions();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let worldRadiusHyperbolic = 0.97;
let worldRadiusElliptic = 0.65;
triangleKaleidoscope.intersectionMirrorXAxis = 0.3;

// initializing things before calculating the map (uopdateKMN)
Make.initializeMap = function() {
    let k = 3;
    let m = 2;
    let n = 5;
    let angleSum = 180 * (1 / k + 1 / m + 1 / n);
    angleSum = Math.round(angleSum);
    triangleKaleidoscope.setKMN(k, m, n);
    triangleKaleidoscope.cutCorners();
    if (angleSum < 180) {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusHyperbolic);
    } else {
        triangleKaleidoscope.adjustWorldRadius(worldRadiusElliptic);
    }
};


Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
