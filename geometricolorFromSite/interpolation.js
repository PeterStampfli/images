/* jshint esversion:6 */

// test interpolation

/**
 * draw on a pixelcanvas use a map 
 * if map is expanding use smoothing, if contracting use interpolation
 * "invalid" points have a negative lyapunov value
 * @method VectorMap#drawSimple
 * returns true if colors are correct, else false
 */
VectorMap.prototype.drawInterpolation = function() {
    let baseLyapunov = this.inputTransform.scale * this.outputImage.scale;
    var lyapunov;
    // image objects
    let pixelCanvas = this.outputImage.pixelCanvas;
    let pixel = pixelCanvas.pixel;
    let inputImage = this.inputImage;
    // input image data
    // input transform data
    let shiftX = this.inputTransform.shiftX;
    let shiftY = this.inputTransform.shiftY;
    let cosAngleScale = this.inputTransform.cosAngleScale;
    let sinAngleScale = this.inputTransform.sinAngleScale;
    // map dimensionsheight
    let height = this.height;
    let width = this.width;
    // map data
    let xArray = this.xArray;
    let yArray = this.yArray;
    let lyapunovArray = this.lyapunovArray;
    // color data
    let offColor = new Color();

    inputImage.averageImageColor(offColor);
    let intOffColor = PixelCanvas.integerOf(offColor);
    const color = new Color();
    var success;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        lyapunov = lyapunovArray[index];
        if (lyapunov >= -0.001) {
            let x = xArray[index];
            let y = yArray[index];
            let h = shiftX + cosAngleScale * x - sinAngleScale * y;
            let k = shiftY + sinAngleScale * x + cosAngleScale * y;
            // beware of byte order
            if (index < 0.33 * length) {
                success = inputImage.getNearest(color, h, k);
            } else if (index < 0.66 * length) {
                success = inputImage.getLinear(color, h, k);
            } else {
                success = inputImage.getCubic(color, h, k);
            }
            if (success) {
                pixelCanvas.setPixelAtIndex(color, index);
            } else { // invalid points: use off colortrue
                pixel[index] = intOffColor;
            }
        } else {
            pixel[index] = intOffColor;
        }
    }
    pixelCanvas.showPixel();
};


if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

    VectorMap.prototype.drawFast = VectorMap.prototype.drawInterpolation;


    Layout.setup("kaleidoscopeLens.html", "end.html");
    Layout.activateFontSizeChanges();

    Make.createOutputImage("outputCanvas");
    Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
    Make.outputImage.setDivPosition(0, 0);
    DOM.style("#outputCanvas", "cursor", "pointer");

    Make.createControlImage("controlCanvas", false);
    Make.controlImage.setDimensions(200, 200);
    Make.controlImage.setPosition(0, 0);
    Make.createArrowController("arrowController", false);
    Make.arrowController.setSize(100);
    Make.arrowController.setPosition(0, 0);
    projection.ellipticMap = projection.identityMap;

    Make.createMap();
    Make.setOutputSize(window.innerHeight);


    Make.highImageQuality = false;
    text = new BigDiv("text");
    text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
    text.setPosition(window.innerHeight, 0);
    Layout.setFontSizes();



    Make.setInitialOutputImageSpace(-0.1, 1.9, -1);
    Make.resetOutputImageSpace();

    basicKaleidoscope.worldRadiusElliptic = 0.3;
    threeMirrorsKaleidoscope.setKMN(5, 3, 2);

    var hColor = new Color(0, 0, 0, 255);

    Make.updateOutputImage = function() {
        Make.updateMapOutput();

        Make.outputImage.pixelCanvas.drawHorizontalLine(hColor, 0.33);
        Make.outputImage.pixelCanvas.drawHorizontalLine(hColor, 0.66);

    };

    Layout.createOpenImage();



    Make.readImageWithFilePathAtSetup("verySmall.jpg");
}
