/**
 * linear transform for vector2 objects
 * @constructor LinearTransform
 */

/* jshint esversion:6 */

function LinearTransform() {
    this.shiftX = 0;
    this.shiftY = 0;
    this.cosAngleScale = 1;
    this.sinAngleScale = 0;
}


(function() {
    "use strict";

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
        this.cosAngleScale = scale * Fast.cos(angle);
        this.sinAngleScale = scale * Fast.sin(angle);
    };

    /**
     * do the transform
     * @method LinearTransform#do
     * @param {Vector2} v
     */
    LinearTransform.prototype.do = function(v) {
        let h = this.cosAngleScale * v.x - this.sinAngleScale * v.y + this.shiftX;
        v.y = this.sinAngleScale * v.x + this.cosAngleScale * v.y + this.shiftY;
        v.x = h;
    };

}());
