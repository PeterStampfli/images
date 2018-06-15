/**
 * a canvas shows the input image at reduced scale, indicate the region of sampled pixels, mouseEvents translate and scale
 * It has a limited space given as maxWidth and maxHeight and limitLeft and limitTop (for fixed position)
 * negative limitLeft for no fixed position (scrolling canvas or invisible)
 * @constructor ControlImage
 * @param {String} idName - html identifier
 * @param {float} maxWidth - maximum width
 * @param {float} maxHeight - maximum height, default is maxWidth
 * @param {float} limitLeft - limit for the left side, default -1000
 * @param {float} limitTop - limit for the top side, default -1000
 */

/* jshint esversion:6 */

function ControlImage(idName, maxWidth, maxHeight = maxWidth, limitLeft = -1000, limitTop = -1000) {
    this.idName = idName;
    DOM.create("canvas", idName, "body");
    if (limitLeft >= 0) { // visible as position fixed
        DOM.style("#" + this.idName, "zIndex", "4", "position", "fixed");
    } else {
        DOM.style("#" + this.idName, "display", "none");
    }
    this.maxWidth = Math.round(maxWidth);
    this.maxHeight = Math.round(maxHeight);
    this.limitLeft = limitLeft;
    this.limitTop = limitTop;
    this.pixelCanvas = new PixelCanvas(idName);
    this.mouseEvents = new MouseEvents(idName);
    this.controlDivInputSize = 1;
    this.semiAlpha = 128;
    this.linearTransform = null;
    this.zoomFactor = 1.05;


    /**
     * what to do for move or wheel events (redraw image)
     * @method ControlImage#action
     */
    this.action = function() {};

    const controlImage = this;

    // mouse wheel changes scale, zoom around origin of map data
    this.mouseEvents.wheelAction = function(mouseEvents) {
        if (mouseEvents.wheelDelta > 0) {
            controlImage.linearTransform.changeScale(controlImage.zoomFactor);
            this.scale *= controlImage.zoomFactor;
        } else {
            controlImage.linearTransform.changeScale(1.0 / controlImage.zoomFactor);
            this.scale /= controlImage.zoomFactor;

        }
        controlImage.action();
    };

    // mouse move shifts image
    this.mouseEvents.dragAction = function(mouseEvents) {
        controlImage.linearTransform.shiftX += mouseEvents.dx / controlImage.controlDivInputSize;
        controlImage.linearTransform.shiftY += mouseEvents.dy / controlImage.controlDivInputSize;
        controlImage.action();
    };
}

(function() {
    "use strict";


    /**
     * show the maximum area for debugging layout
     * @method ControlImage#showArea
     */
    ControlImage.prototype.showArea = function() {
        let id = "border" + this.idName;
        DOM.create("div", id, "body", "area for " + this.idName);
        DOM.style("#" + id, "zIndex", "3");
        DOM.style("#" + id, "backgroundColor", "rgba(100,255,100,0.3", "color", "green");
        DOM.style("#" + id, "position", "fixed", "left", this.limitLeft + px, "top", this.limitTop + px);
        DOM.style("#" + id, "width", this.maxWidth + px, "height", this.maxHeight + px);
    };

    /**
     * attach an input image (call always after reading a new one), resizes, loads image
     * @method ControlImage#loadInputImage
     * @param {PixelCanvas} inputImage - the input image
     */
    ControlImage.prototype.loadInputImage = function(inputImage) {
        // check for relative widths and height 
        if (inputImage.width / inputImage.height > this.maxWidth / this.maxHeight) {
            // the width dominates and fills entirely the space for the control canvas
            this.controlDivInputSize = this.maxWidth / inputImage.width;
        } else {
            this.controlDivInputSize = this.maxHeight / inputImage.height;
        }
        let trueWidth = inputImage.width * this.controlDivInputSize;
        let trueHeight = inputImage.height * this.controlDivInputSize;
        // see if position is fixed
        if (this.mouseEvents.elementPositionFixed) {
            let left = this.limitLeft + 0.5 * (this.maxWidth - trueWidth);
            let top = this.limitTop + Math.round(0.5 * (this.maxHeight - trueHeight));
            DOM.style("#" + this.idName, "left", left + px, "top", top + px);
        }
        this.pixelCanvas.setSize(trueWidth, trueHeight);
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
        let scale = fillFactor * Math.min(inputImage.width / xWidth, inputImage.height / yWidth);
        this.linearTransform.setScale(scale);
        //put the scaled map into the center
        this.linearTransform.shiftX = inputImage.width / 2 - scale * centerX;
        this.linearTransform.shiftY = inputImage.height / 2 - scale * centerY;
    };

}());
