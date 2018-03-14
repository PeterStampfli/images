/**
 * a canvas shows the input image at reduced scale, indicate the region of sampled pixels, mouseEvents translate and scale
 * @constructor ControlImage
 * @param {String} idName - html identifier
 * @param {integer} sizeLimit - the larger width or height
 */

/* jshint esversion:6 */

function ControlImage(idName, sizeLimit) {
    "use strict";

    this.pixelCanvas = new PixelCanvas(idName);
    this.mouseEvents = new MouseEvents(idName);
    this.sizeLimit = sizeLimit;
    this.controlDivInputSize = 1;
    this.semiAlpha = 128;
    this.scale = 1;
    this.zoomFactor = 1.05;
    this.shiftX = 0;
    this.shiftY = 0;

    // make it visible
    this.pixelCanvas.setSize(sizeLimit, sizeLimit);
    this.pixelCanvas.blueScreen();

    /**
     * what to do for move or wheel events (redraw image)
     * @method ControlImage#action
     */
    this.action = function() {};

    /*
     * add standard down, up and out actions
     */
    this.mouseEvents.addDownAction();
    this.mouseEvents.addUpAction();
    this.mouseEvents.addOutAction();

    const controlImage = this;

    // mouse wheel changes scale, zoom around origin of map data
    this.mouseEvents.addWheelAction(function(mouseEvents) {
        if (mouseEvents.wheelDelta > 0) {
            controlImage.scale *= controlImage.zoomFactor;
        } else {
            controlImage.scale /= controlImage.zoomFactor;
        }
        controlImage.action();
    });

    // mouse move shifts image
    this.mouseEvents.addMoveAction(function(mouseEvents) {
        controlImage.shiftX += mouseEvents.dx / controlImage.controlDivInputSize;
        controlImage.shiftY += mouseEvents.dy / controlImage.controlDivInputSize;
        controlImage.action();
    });
}

(function() {
    "use strict";

    // drawing on the canvas

    /**
     * attach an input image (call always after reading a new one), resizes, loads image
     * @method ControlImage#loadInputImage
     * @param {PixelCanvas} inputImage - the input image
     */
    ControlImage.prototype.loadInputImage = function(inputImage) {
        if (inputImage.width > inputImage.height) {
            this.controlDivInputSize = this.sizeLimit / inputImage.width;
        } else {
            this.controlDivInputSize = this.sizeLimit / inputImage.height;
        }
        this.pixelCanvas.setSize(inputImage.width * this.controlDivInputSize, inputImage.height * this.controlDivInputSize);
        this.pixelCanvas.canvasContext.drawImage(inputImage.canvas, 0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
        this.pixelCanvas.createPixel();
    };

    /**
     * make semitransparent
     * @mathod ControlImage#semiTransparent
     */
    ControlImage.prototype.semiTransparent = function() {
        this.pixelCanvas.setAlpha(this.semiAlpha);
    };

    /**
     * set a pixel to opaque, given by input image coordinates, microoptization possible
     * @method ControlImage#setOpaque
     * @param {Vector2} v - position of pixel
     */
    ControlImage.prototype.setOpaque = function(v) {
        this.pixelCanvas.setOpaque(v.x * this.controlDivInputSize, v.y * this.controlDivInputSize);
    };

    /**
     * set the action() - function for this controller, called at each position or scale change for instant following
     * @method ControlImage#setAction
     * @param {function} action
     */
    ControlImage.prototype.setAction = function(action) {
        this.action = action;
    };

    /**
     * adjust scales and offset such that the map fills reasonably the input image after scaling and shift
     * @method ControlImage
     * @param {Vector2} lowerLeft - coordinates of lower left corner (xMin,yMin) of the map output
     * @param {float} fillFactor - how much of the input image is sampled
     * @param {PixelCanvas} inputImage
     */
    ControlImage.prototype.adjustScaleShift = function(lowerLeft, upperRight, fillFactor, inputImage) {
        let xWidth = upperRight.x - lowerLeft.x;
        let yWidth = upperRight.y - lowerLeft.y;
        let centerX = 0.5 * (upperRight.x + lowerLeft.x);
        let centerY = 0.5 * (upperRight.y + lowerLeft.y);
        // multiply map by this.scale to get a reasonable fill by the map range
        this.scale = fillFactor * Math.min(inputImage.width / xWidth, inputImage.height / yWidth);
        //put the scaled map into the center
        this.shiftX = inputImage.width / 2 - this.scale * centerX;
        this.shiftY = inputImage.height / 2 - this.scale * centerY;
    };

}());
