/**
 * linear transform for vector2 objects
 * @constructor LinearTransform
 */

/* jshint esversion:6 */

function LinearTransform() {
    this.shiftX = 0;
    this.shiftY = 0;
    this.scale = 1;
    this.angle = 0;
    this.cosAngleScale = 1;
    this.sinAngleScale = 0;
}


(function() {
    "use strict";

    const v = new Vector2();


    /**
     * set translation part of transform
     * @method LinearTransform#setShift
     * @param {float} shiftX
     * @param {float} shiftY
     */
    LinearTransform.prototype.setShift = function(shiftX, shiftY) {
        this.shiftX = shiftX;
        this.shiftY = shiftY;
    };

    /**
     * set angle and scale 
     * @method LinearTransform#setAngleScale
     * @param {float} angle
     * @param {float} scale
     */
    LinearTransform.prototype.setAngleScale = function(angle, scale) {
        this.scale = scale;
        this.cosAngleScale = scale * Fast.cos(angle);
        this.sinAngleScale = scale * Fast.sin(angle);
    };

    /*
     * update the combined cosAngel sinAngle factors
     * call if scale or angle changes 
     */
    LinearTransform.prototype.updateScaleAngle = function() {
        this.cosAngleScale = this.scale * Fast.cos(this.angle);
        this.sinAngleScale = this.scale * Fast.sin(this.angle);
    };

    /**
     * change the scale by a zoom factor,
     * @method LinearTransform#changeScale
     * @param {float} factor
     */
    LinearTransform.prototype.changeScale = function(factor) {
        this.scale *= factor;
        this.updateScaleAngle();
    };

    /**
     * change the scale by a zoom factor, at a fixed point
     * @method LinearTransform#changeScaleFixPoint
     * @param {float} factor
     */
    LinearTransform.prototype.changeScaleFixPoint = function(factor, fixPointX, fixPointY) {
        v.setComponents(fixPointX, fixPointY);
        this.inverse(v);
        this.changeScale(factor);
        this.do(v);
        this.shiftX += fixPointX - v.x;
        this.shiftY += fixPointY - v.y;
    };

    /**
     * change the angle,
     * @method LinearTransform#changeAngle
     * @param {float} amount
     */
    LinearTransform.prototype.changeAngle = function(amount) {
        this.angle += amount;
        this.updateScaleAngle();
    };

    /**
     * change the angle, rotate around a fix point
     * @method LinearTransform#changeAngleFixPoint
     * @param {float} amount
     */
    LinearTransform.prototype.changeAngleFixPoint = function(amount, fixPointX, fixPointY) {
        v.setComponents(fixPointX, fixPointY);
        this.inverse(v);
        this.changeAngle(amount);
        this.do(v);
        this.shiftX += fixPointX - v.x;
        this.shiftY += fixPointY - v.y;
    };

    /**
     * set the scale,
     * beware of fixed point
     * @method LinearTransform#setScale
     * @param {float} scale
     */
    LinearTransform.prototype.setScale = function(scale) {
        this.scale = scale;
        this.updateScaleAngle();
    };

    /**
     * do the transform: rotate and scale, then shift
     * @method LinearTransform#do
     * @param {Vector2} v
     */
    LinearTransform.prototype.do = function(v) {
        let h = this.cosAngleScale * v.x - this.sinAngleScale * v.y + this.shiftX;
        v.y = this.sinAngleScale * v.x + this.cosAngleScale * v.y + this.shiftY;
        v.x = h;
    };

    /**
     * inverse transform: undo the shift, then scale with inverse and rotate by opposite angle
     * not used often (efficiency not so important)
     * @method LinearTransform#inverse
     * @param {Vector2} v
     */
    LinearTransform.prototype.inverse = function(v) {
        v.x -= this.shiftX;
        v.y -= this.shiftY;
        let is2 = 1 / (this.scale * this.scale);
        let h = is2 * (this.cosAngleScale * v.x + this.sinAngleScale * v.y);
        v.y = is2 * (-this.sinAngleScale * v.x + this.cosAngleScale * v.y);
        v.x = h;
    };

}());
