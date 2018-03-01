/**
 * linear transformation ov vectors: translate, rotate and scale
 * @constructor ScaleRotateShift
 */

/* jshint esversion:6 */

function ScaleRotateShift() {
    "use strict";
    this.shiftX = 0;
    this.shiftY = 0;
    this.angle = 0;
    this.scale = 1;
    this.scaleCosAngle = 1;
    this.scaleSinAngle = 0;
}


(function() {
    "use strict";

    /**
     * set the shift
     * @method ScaleRotateShift#setShift
     * @param {float} x - component of shift
     * @param {float} y - component of shift
     */
    ScaleRotateShift.prototype.setShift = function(x, y) {
        this.shiftX = x;
        this.shiftY = y;
    };

    /**
     * add to the shift
     * @method ScaleRotateShift#addShift
     * @param {float} x - component of additional shift
     * @param {float} y - component of additional shift
     */
    ScaleRotateShift.prototype.addShift = function(x, y) {
        this.shiftX += x;
        this.shiftY += y;
    };

    /**
     * multiply the shift by a factor
     * @method ScaleRotateShift#multiplyShift
     * @param {float} factor - of multipication
     */
    ScaleRotateShift.prototype.multiplyShift = function(factor) {
        this.shiftX *= factor;
        this.shiftY *= factor;
    };

    /*
     * update the combined factors from scale and angle
     * @method ScaleRotateShift.update
     */
    ScaleRotateShift.prototype.update = function() {
        this.scaleCosAngle = this.scale * Fast.cos(this.angle);
        this.scaleSinAngle = this.scale * Fast.sin(this.angle);
    };

    /**
     * set the scale
     * @method ScaleRotateShift#setScale
     * @param {float} scale
     */
    ScaleRotateShift.prototype.setScale = function(scale) {
        this.scale = scale;
        update();
    };

    /**
     * multiply the scale by a factor
     * @method ScaleRotateShift#setScale
     * @param {float} factor
     */
    ScaleRotateShift.prototype.multiplyScale = function(factor) {
        this.scale *= factor;
        update();
    };

    /**
     * set the angle
     * @method ScaleRotateShift#setAngle
     * @param {float} angle
     */
    ScaleRotateShift.prototype.setAngle = function(angle) {
        this.angle = angle;
        this.combineScaleRotation();
    };

    /**
     * scale rotate and then shift a vector position
     * @method ScaleRotateShift#scaleRotateShift
     * @param {Vector2} position
     */
    ScaleRotateShift.prototype.scaleRotateShift = function(position) {
        let h = this.scaleCosAngle * position.x - this.scaleSinAngle * position.y + this.shiftX;
        position.y = this.scaleSinAngle * position.x + this.scaleCosAngle * position.y + this.shiftY;
        position.x = h;
    };

}());
