/**
 * basic 2-dimensional vectors
 * @constructor Vector2
 * @param {float} x - coordinate (default=0)
 * @param {float} y - coordinate (default=0)
 */

/* jshint esversion:6 */

function Vector2(x = 0, y = 0) {
    this.x = x;
    this.y = y;
}


(function() {
    "use strict";

    /**
     * set vector to given coordinate values
     * @method Vector2#setComponents
     * @param {float} x - coordinate
     * @param {float} y - coordinate
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.setComponents = function(x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    /**
     * set vector to given other vector
     * @method Vector2#set
     * @param {Vector2} v - the model vector
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.set = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };

    /**
     * generate a clone of this vector
     * @method Vector2#clone
     * @return {Vector2} - a colne of this vector
     */
    Vector2.prototype.clone = function() {
        let clone = new Vector2();
        clone.set(this);
        return clone;
    };

    /**
     * scale vector
     * @method Vector2#scale
     * @param {Vector2} v - the model vector
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.scale = function(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };

    /**
     * get the polar angle
     * @method Vector2#angle
     * @return {float} the angle
     */
    Vector2.prototype.angle = function() {
        return Fast.atan2(this.y, this.x);
    };

    /**
     * get the length
     * @method Vector2#angle
     * @return {float} the length
     */
    Vector2.prototype.length = function() {
        return Math.hypot(this.x, this.y); // Math.sqrt is very fast, as fast as fastSin
    };

    /**
     * get the square length
     * @method Vector2#angle
     * @return {float} the length squared
     */
    Vector2.prototype.length2 = function() {
        return this.x * this.x + this.y * this.y;
    };

    /**
     * set the vector according to given polar angle and length
     * @method Vector2#setPolar
     * @param {float} length
     * @param {float} angle
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.setPolar = function(length, angle) {
        Fast.cosSin(angle);
        this.x = length * Fast.cosResult;
        this.y = length * Fast.sinResult;
    };

    /**
     * mirror at the x-axis (inverting y)
     * @method Vector2#mirrorAtXAxis
     */
    Vector2.prototype.mirrorAtXAxis = function() {
        this.y = -this.y;
    };

    /**
     * rotate the vector by given angle
     * @method Vector2#rotate
     * @param {float} angle - in radians
     */
    Vector2.prototype.rotate = function(angle) {
        Fast.cosSin(angle);
        let h = this.x * Fast.cosResult - this.y * Fast.sinResult;
        this.y = this.x * Fast.sinResult + this.y * Fast.cosResult;
        this.x = h;
    };

}());
