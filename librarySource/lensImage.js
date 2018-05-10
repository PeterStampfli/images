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
    this.objectCenterX = 0;
    this.objectCenterY = 0;
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

    // set transform of object
    /**
     * set the transform of the object, position the lens and adjust magnification
     * clamp the lens position and magnification
     * @method LensImage#setObjectTransform
     */
    LensImage.prototype.setObjectTransform = function() {
        this.magnification = Math.max(2, this.magnification);
        let margin = 0.5 * this.pixelCanvas.width / this.magnification;
        this.objectCenterX = Math.max(margin, Math.min(this.object.width - margin, this.objectCenterX));
        let objectCornerX = this.objectCenterX - margin;
        margin = 0.5 * this.pixelCanvas.height / this.magnification;
        this.objectCenterY = Math.max(margin, Math.min(this.object.height - margin, this.objectCenterY));
        let objectCornerY = this.objectCenterY - margin;



        this.object.linearTransform.setShift(objectCornerX, objectCornerY);
        this.object.linearTransform.setAngleScale(0, 1 / this.magnification);
    };

    /**
     * set corner of lens such that its center is at given position
     * @method LensImage#setCenter
     * @param {Vector2} v
     */
    LensImage.prototype.setCenter = function(v) {
        this.objectCenterX = v.x;
        this.objectCenterY = v.y;
        this.setObjectTransform();
    };

    /**
     * get center of lens
     * @method LensImage#getCenter
     * @param {Vector2} v - will be set to center
     */
    LensImage.prototype.getCenter = function(v) {
        v.x = this.objectCornerX + 0.5 * this.pixelCanvas.width / this.magnification;
        v.y = this.objectCornerY + 0.5 * this.pixelCanvas.height / this.magnification;
    };

    let center = new Vector2();

    /**
     * change magnification, center stays
     * @method LensImage#changeMagnification
     * @param {float} amount
     */
    LensImage.prototype.changeMagnification = function(amount) {
        this.magnification += amount;
        this.setObjectTransform();
    };

    /**
     * draw the magnified image 
     * @method LensImage.draw
     */
    LensImage.prototype.draw = function() {
        this.setObjectTransform();

        let position = new Vector2();
        let color = new Color(0, 0, 0, 255);
        let width = this.pixelCanvas.width;
        let height = this.pixelCanvas.height;
        let index = 0;
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                position.setComponents(i, j);
                this.object.getNearest(color, position);
                this.pixelCanvas.setPixelAtIndex(color, index);
                index++;
            }
        }
        this.pixelCanvas.showPixel();



    };

}());
