/**
 * a canvas shows the input image at reduced scale, indicate the region of sampled pixels, mouseEvents translate and scale
 * @constructor ControlImage
 * @param {String} idName - html identifier
 * @param {integer} sizeLimit - the larger width or height
 */

function ControlImage(idName, sizeLimit) {

    this.pixelCanvas = new PixelCanvas(idName);
    this.mouseEvents = new MouseEvents(idName);
    this.sizeLimit = sizeLimit;
    this.inputDivControlSize = 1;
    this.semiAlpha = 128;

}


(function() {
    "use strict";

    /**
     * attach an input image (call always after reading a new one), resizes, loads image
     * @method ControlImage#loadInputImage
     * @param {PixelCanvas} inputImage - the input image
     */
    ControlImage.prototype.loadInputImage = function(inputImage) {
        if (inputImage.width > inputImage.height) {
            this.inputDivControlSize = inputImage.width / this.sizeLimit;
        } else {
            this.inputDivControlSize = inputImage.height / this.sizeLimit;
        }
        this.pixelCanvas.setSize(inputImage.width / this.inputDivControlSize, inputImage.height / this.inputDivControlSize);
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

}());
