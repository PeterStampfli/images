/**
 * a canvas shows the input image at reduced scale, indicate the region of sampled pixels, mouseEvents translate and scale
 * It has a limited space given as maxWidth and maxHeight and limitLeft and limitTop (for fixed position)
 * at first it is transparent until an input image is loaded
 * @constructor ControlImage
 * @param {String} idName - html identifier
 * @param {boolean} is visible - default true
 */

/* jshint esversion:6 */

function ControlImage(idName, isVisible = true) {
    this.idName = idName;
    this.isVisible = isVisible;
    if (document.getElementById(idName) == null) {
        DOM.create("canvas", idName, "body");
    }
    // first it is not visible
    DOM.style("#" + idName, "zIndex", "4", "position", "fixed");
    DOM.style("#" + idName, "cursor", "pointer");
    DOM.style("#" + idName, "display", "none");
    // choose centering of image in available place
    // the image may be centered vertically or placed at the top
    this.centerVertical = true;
    // the image may be centered horizontally or placed at the left
    this.centerHorizontal = true;
    this.pixelCanvas = new PixelCanvas(idName);
    this.controlDivInputSize = 1;
    this.semiAlpha = 128;
    this.zoomFactor = 1.05;

    // this is the linear transform for reading pixels of the input image
    // has to be set after creation
    this.linearTransform = null;

    /**
     * what to do for move or wheel events (redraw image)
     * @method ControlImage#action
     */
    this.action = function() {};

    const controlImage = this;


    // changing the shift of the input image transform. events object with dx and dy fields
    function changeShift(events) {
        controlImage.linearTransform.shiftX += events.dx / controlImage.controlDivInputSize;
        controlImage.linearTransform.shiftY += events.dy / controlImage.controlDivInputSize;
        controlImage.action();
    }


    if (this.isVisible) { //create mouse and touch events only if the image is visible

        this.mouseEvents = new MouseEvents(idName);
        this.touchEvents = new TouchEvents(idName);

        // mouse wheel changes scale, zoom around origin of map data
        this.mouseEvents.wheelAction = function(mouseEvents) {
            var zoomFactor;
            if (mouseEvents.wheelDelta > 0) {
                zoomFactor = controlImage.zoomFactor;
            } else {
                zoomFactor = 1 / controlImage.zoomFactor;
            }
            // changing the input image transform
            controlImage.linearTransform.changeScaleFixPoint(zoomFactor, mouseEvents.x / controlImage.controlDivInputSize, mouseEvents.y / controlImage.controlDivInputSize);

            controlImage.action();
        };

        // mouse move shifts image
        this.mouseEvents.dragAction = changeShift;

        // touch can move, rotate and scale
        this.touchEvents.moveAction = function(touchEvents) {
            if (touchEvents.touches.length === 1) {
                changeShift(touchEvents);
            } else if (touchEvents.touches.length === 2) {

            }
        };
    }
}

(function() {
    "use strict";

    /**
     * set position (of reserved space)
     * @method ControlImage#setPosition
     * @param {float} limitLeft - limit for the left side
     * @param {float} limitTop - limit for the top side
     */
    ControlImage.prototype.setPosition = function(limitLeft, limitTop) {
        this.limitLeft = limitLeft;
        this.limitTop = limitTop;
    };

    /**
     * set dimensions (of reserved space)
     * @method ControlImage#setDimensions
     * @param {float} maxWidth - maximum width
     * @param {float} maxHeight - maximum height
     */
    ControlImage.prototype.setDimensions = function(maxWidth, maxHeight) {
        this.maxWidth = Math.round(maxWidth);
        this.maxHeight = Math.round(maxHeight);
    };

    /**
     * show the maximum area for debugging layout
     * @method ControlImage#showArea
     */
    ControlImage.prototype.showArea = function() {
        let id = "border" + this.idName;
        DOM.create("div", id, "body", "area for " + this.idName);
        DOM.style("#" + id, "zIndex", "3");
        DOM.style("#" + id, "backgroundColor", "rgba(100,255,100,0.3)", "color", "green");
        DOM.style("#" + id, "position", "fixed", "left", this.limitLeft + px, "top", this.limitTop + px);
        DOM.style("#" + id, "width", this.maxWidth + px, "height", this.maxHeight + px);
    };

    /**
     * attach an input image PIXELCANVAS (call always after reading a new one), resizes, loads image
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
        // adjust position if it is visible
        if (this.isVisible) {
            let left = this.limitLeft;
            let top = this.limitTop;
            if (this.centerHorizontal) {
                left += 0.5 * (this.maxWidth - trueWidth);
            }
            if (this.centerVertical) {
                top += 0.5 * (this.maxHeight - trueHeight);
            }
            DOM.style("#" + this.idName, "left", left + px, "top", top + px);
            DOM.style("#" + this.idName, "display", "initial");
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
