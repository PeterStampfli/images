/* jshint esversion:6 */


// test smoothing
/**
 * draw on a pixelcanvas use a map 
 * if map is expanding use smoothing, if contracting use interpolation
 * "invalid" points have a negative lyapunov value
 * @method VectorMap#drawSimple
 * returns true if colors are correct, else false
 */
VectorMap.prototype.drawHalf = function() {
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
    // map dimensions
    let height = this.height;
    let width = this.width;
    // map data
    let xArray = this.xArray;
    let yArray = this.yArray;
    let lyapunovArray = this.lyapunovArray;
    let alphaArray = this.alphaArray;
    // color data
    let offColor = new Color();
    inputImage.averageImageColor(offColor);
    let intOffColor = PixelCanvas.integerOf(offColor);
    const color = new Color();
    var x, y, h, k;
    var success;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        lyapunov = lyapunovArray[index] * baseLyapunov;
        let x = xArray[index];
        let y = yArray[index];
        let h = shiftX + cosAngleScale * x - sinAngleScale * y;
        let k = shiftY + sinAngleScale * x + cosAngleScale * y;
        if (index > 0.5 * length) {
            // determine the rgb color part
            // background or image ?
            if (lyapunov >= -0.001) {
                if (!inputImage.getHighQuality(color, h, k, lyapunov)) {
                    color.set(offColor);
                }
            } else { // invalid points: use off color
                color.set(offColor);
            }
            // add alpha part
            color.alpha = alphaArray[index];
        } else {
            color.alpha = 255;
            if (lyapunov >= -0.001) {
                if (!inputImage.getNearest(color, h, k, lyapunov)) {
                    color.set(offColor);
                    color.alpha = 0;
                }
            } else { // invalid points: use off color
                color.set(offColor);
                color.alpha = 0;
            }
        }
        // and show
        pixelCanvas.setPixelAtIndex(color, index);
    }
    pixelCanvas.showPixel();
};


if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

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

    Make.outputImage.move = function(mouseEvents) {
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

    Make.outputImage.touchEvents.moveAction = function(touchEvents) {
        if (touchEvents.touches.length === 1) {
            Make.outputImage.move(touchEvents);
        } else if (touchEvents.touches.length === 2) {
            lens.changeMagnification(20 * touchEvents.dDistance / (touchEvents.distance + touchEvents.lastDistance));
            Make.updateOutputImage();
        }
    };



    Make.initializeMap();

    Layout.createOpenImage();

    // use another image ???
    Make.readImageWithFilePathAtSetup("Drottningholm.jpg");
}
