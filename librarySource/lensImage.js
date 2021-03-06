/**
 * magnifying canvas 
 * @constructor LensImage
 * @param {String} idName - html identifier
 * @param {float} width -  width
 * @param {float} height -  height, default is maxWidth
 * @param {float} left -  left side, default 0
 * @param {float} top -  top side, default 0*/

/* jshint esversion:6 */


function LensImage(idName, width, height = width, left = 0, top = 0) {
    this.idName = idName;
    DOM.create("canvas", idName, "body");
    DOM.style("#" + idName, "position", "fixed", "left", left + px, "top", top + px);
    this.pixelCanvas = new PixelCanvas(idName);
    this.pixelCanvas.setupOnscreen(width, height);
    this.object = null;
    this.objectCornerX = 0;
    this.objectCornerY = 0;
    this.magnification = 4;
}

(function() {
    "use strict";

    /**
     * set object of the lens 
     * @method LensImage#setObject
     * @param {PixelCanvas} pixelCanvas
     */
    LensImage.prototype.setObject = function(pixelCanvas) {
        this.object = pixelCanvas;
    };

    /**
     * clamp the lens position to inside the object pixel canvas
     * @method LensImage#clampPosition
     */
    LensImage.prototype.clampPosition = function() {
        this.objectCornerX = Fast.clamp(0, this.objectCornerX, (this.object.width - 1) - (this.pixelCanvas.width - 1) / this.magnification);
        this.objectCornerY = Fast.clamp(0, this.objectCornerY, (this.object.height - 1) - (this.pixelCanvas.height - 1) / this.magnification);
    };

    /**
     * set corner of lens such that its center is at given position
     * @method LensImage#setCenter
     * @param {Vector2} v
     */
    LensImage.prototype.setCenter = function(v) {
        this.objectCornerX = v.x - 0.5 * (this.pixelCanvas.width - 1) / this.magnification;
        this.objectCornerY = v.y - 0.5 * (this.pixelCanvas.height - 1) / this.magnification;
        this.clampPosition();
    };

    /**
     * get center of lens
     * @method LensImage#getCenter
     * @param {Vector2} v - will be set to center
     */
    LensImage.prototype.getCenter = function(v) {
        v.x = this.objectCornerX + 0.5 * (this.pixelCanvas.width - 1) / this.magnification;
        v.y = this.objectCornerY + 0.5 * (this.pixelCanvas.height - 1) / this.magnification;
    };

    let center = new Vector2();

    /**
     * change magnification, center stays
     * @method LensImage#changeMagnification
     * @param {float} amount
     */
    LensImage.prototype.changeMagnification = function(amount) {
        this.getCenter(center);
        this.magnification = Math.max(2, this.magnification + amount);
        this.setCenter(center);
        this.clampPosition();
    };

    /**
     * draw the magnified image 
     * @method LensImage.draw
     */
    LensImage.prototype.draw = function() {
        let width = this.pixelCanvas.width;
        let height = this.pixelCanvas.height;
        let objectWidth = this.object.width;
        let objectPixel = this.object.pixel;
        let lensPixel = this.pixelCanvas.pixel;
        var objectX, objectY;
        var objectBaseIndex;
        let scale = 1 / this.magnification;
        let index = 0;
        objectY = this.objectCornerY;
        for (var j = 0; j < height; j++) {
            objectBaseIndex = Math.floor(objectY) * objectWidth;
            objectX = this.objectCornerX;
            for (var i = 0; i < width; i++) {
                lensPixel[index++] = objectPixel[Math.floor(objectX) + objectBaseIndex];
                objectX += scale;
            }
            objectY += scale;
        }
        this.pixelCanvas.showPixel();
    };

}());
