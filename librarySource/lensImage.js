/**
 * magnifying canvas 
 * @constructor LensImage
 * @param {String} idName - html identifier
 */

/* jshint esversion:6 */


function LensImage(idName) {
    "use strict";

    this.pixelCanvas = new PixelCanvas(idName);
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
        console.log("mag " + this.magnification);
        this.setCenter(center);
        this.clampPosition();
    };

    /**
     * draw the magnified image 
     * @method LensImage.draw
     */
    LensImage.prototype.draw = function() {
        let color = new Color(0, 0, 0, 255);
        let transparent = new Color(0, 0, 0, 0);
        let width = this.pixelCanvas.width;
        let height = this.pixelCanvas.height;
        var x, y;
        let scale = 1 / this.magnification;
        let index = 0;
        y = this.objectCornerY;
        for (var j = 0; j < height; j++) {
            x = this.objectCornerX;
            for (var i = 0; i < width; i++) {
                if (this.object.getNearest(color, x, y)) {
                    this.pixelCanvas.setPixelAtIndex(color, index);
                } else {
                    this.pixelCanvas.setPixelAtIndex(transparent, index);
                }
                index++;
                x += scale;
            }
            y += scale;
        }
        this.pixelCanvas.showPixel();
    };

}());
