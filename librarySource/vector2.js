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

    //make vectors

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
     * set the vector according to given polar angle and length
     * @method Vector2#setPolar
     * @param {float} length
     * @param {float} angle
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.setPolar = function(length, angle) {
        Fast.cosSin(angle, this);
        this.x *= length;
        this.y *= length;
    };

    /**
     * generate a clone of this vector
     * @method Vector2#clone
     * @return {Vector2} - a colne of this vector
     */
    Vector2.prototype.clone = function() {
        return Vector2.fromPool(this);
    };

    // calculate with vectors
    /**
     * rotate 90 degrees counterclockwise
     * @method Vector2#rotate90
     * @ return the vector
     */
    Vector2.prototype.rotate90 = function() {
        let h = -this.y;
        this.y = this.x;
        this.x = h;
        return this;
    };

    /**
     * rotate 90 degrees clockwise
     * @method Vector2#rotateM90
     * @ return the vector
     */
    Vector2.prototype.rotateM90 = function() {
        let h = this.y;
        this.y = -this.x;
        this.x = h;
        return this;
    };

    /**
     * rotate 180 degrees
     * @method Vector2#rotate180
     * @return the vector
     */
    Vector2.prototype.rotate180 = function() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    /**
     * rotate 45 degrees (counterclockwise)
     * @method Vector2#rotate45
     * @return the vector
     */
    const cos45 = Fast.cos(Math.PI / 4);
    const sin45 = Fast.sin(Math.PI / 4);
    Vector2.prototype.rotate45 = function() {
        let h = this.x * cos45 - this.y * sin45;
        this.y = this.x * sin45 + this.y * cos45;
        this.x = h;
        return this;
    };

    /**
     * rotate minus 45 degrees (clockwise)
     * @method Vector2#rotateM45
     * @return the vector
     */
    Vector2.prototype.rotateM45 = function() {
        let h = this.x * cos45 + this.y * sin45;
        this.y = -this.x * sin45 + this.y * cos45;
        this.x = h;
        return this;
    };

    /**
     * rotate 30 degrees (counterclockwise)
     * @method Vector2#rotate30
     * @return the vector
     */
    const cos30 = Fast.cos(Math.PI / 6);
    const sin30 = Fast.sin(Math.PI / 6);
    Vector2.prototype.rotate30 = function() {
        let h = this.x * cos30 - this.y * sin30;
        this.y = this.x * sin30 + this.y * cos30;
        this.x = h;
        return this;
    };

    /**
     * rotate minus 30 degrees (clockwise)
     * @method Vector2#rotateM30
     * @return the vector
     */
    Vector2.prototype.rotateM30 = function() {
        let h = this.x * cos30 + this.y * sin30;
        this.y = -this.x * sin30 + this.y * cos30;
        this.x = h;
        return this;
    };

    /**
     * rotate 72 degrees (counterclockwise)
     * @method Vector2#rotate30
     * @return the vector
     */
    const cos72 = Fast.cos(Math.PI / 2.5);
    const sin72 = Fast.sin(Math.PI / 2.5);
    Vector2.prototype.rotate72 = function() {
        let h = this.x * cos72 - this.y * sin72;
        this.y = this.x * sin72 + this.y * cos72;
        this.x = h;
        return this;
    };

    /**
     * rotate minus 72 degrees (clockwise)
     * @method Vector2#rotateM72
     * @return the vector
     */
    Vector2.prototype.rotateM72 = function() {
        let h = this.x * cos72 + this.y * sin72;
        this.y = -this.x * sin72 + this.y * cos72;
        this.x = h;
        return this;
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
        return this;
    };

    /**
     * scale vector
     * @method Vector2#scale
     * @param {float} factor 
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.scale = function(factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };

    /**
     * add a vector
     * @method Vector2#add
     * @param {Vector2} v - the other vector
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };

    /**
     * subtract a vector
     * @method Vector2#sub
     * @param {Vector2} v - the other vector
     * @return {Vector2} - this, for chaining
     */
    Vector2.prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };

    /**
     * linear interpolation to another vector
     * @method Vector2#lerp
     * @param {float} t - interpolation parameter
     * @param {Vector2} b
     * @return this
     */
    Vector2.prototype.lerp = function(t, b) {
        this.x = (1 - t) * this.x + t * b.x;
        this.y = (1 - t) * this.y + t * b.y;
        return this;
    };


    // create calculated vectors

    /**
     * create a vector as the sum of two vectors, they remain unchanged
     * @method Vector2.sum
     * @param {Vector2} a
     * @param {Vector2} b
     * @return Vector2 object, sum of the vectors
     */
    Vector2.sum = function(a, b) {
        return Vector2.fromPool(a.x + b.x, a.y + b.y);
    };

    /**
     * create a vector as the difference of two vectors, they remain unchanged
     * @method Vector2.difference
     * @param {Vector2} a
     * @param {Vector2} b
     * @return Vector2 object, difference a-b of the vectors
     */
    Vector2.difference = function(a, b) {
        return Vector2.fromPool(a.x - b.x, a.y - b.y);
    };

    /**
     * calculate center (mean value) of any number of vectors
     * @method Vector2.center
     * @param {ListOfVector2} vectors, or array of vectors
     * @return Vector2, center of the vectors
     */
    Vector2.center = function(vectors) {
        let length = arguments.length;
        let x = 0;
        let y = 0;
        for (var i = 0; i < length; i++) {
            x += arguments[i].x;
            y += arguments[i].y;
        }
        return Vector2.fromPool(x / length, y / length);
    };

    /**
     * middle between two vectors
     * @method Vector2.middle
     * @param {Vector2} a
     * @param {Vector2} b
     * @return Vector2
     */
    Vector2.middle = function(a, b) {
        return Vector2.fromPool(0.5 * (a.x + b.x), 0.5 * (a.y + b.y));
    };

    /**
     * linear interpolation between two vectors
     * @method Vector2.lerp
     * @param {Vector2} a
     * @param {float} t - interpolation parameter
     * @param {Vector2} b
     * @return Vector2, (1-t)*a+t*b
     */
    Vector2.lerp = function(a, t, b) {
        return Vector2.fromPool((1 - t) * a.x + t * b.x, (1 - t) * a.y + t * b.y);
    };

    //get vector data

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
     * @method Vector2#length
     * @return {float} the length
     */
    Vector2.prototype.length = function() {
        return Math.hypot(this.x, this.y); // Math.sqrt is very fast, as fast as fastSin
    };

    /**
     * get the square length
     * @method Vector2#length2
     * @return {float} the length squared
     */
    Vector2.prototype.length2 = function() {
        return this.x * this.x + this.y * this.y;
    };


    /**
     * comparing two vectors: accuracy for numbers to be considered as equal
     * @var Vector2.epsilon
     */
    Vector2.epsilon = 0.001;

    /**
     * check if two vectors are equal
     * @method Vector2#isEqual
     * @param {Vector2} other
     * @return true if they are equal, false else
     */
    Vector2.prototype.isEqual = function(other) {
        return (Math.abs(this.x - other.x) < Vector2.epsilon) && (Math.abs(this.y - other.y) < Vector2.epsilon);
    };

    /**
     * logging a vector on the console
     * @method Vector2#log 
     * @param {String} message - or nothind
     */
    Vector2.prototype.log = function(message) {
        if (message) {
            message += ": ";
        } else {
            message = "";
        }
        console.log(message + "Vector2 (" + this.x + "," + this.y + ")");
    };

    /**
     * draw at the vector position a small circle
     * @method Vector2#draw
     */
    Vector2.prototype.draw = function() {
        Draw.vector2(this);
    };

    // a pool for Vector2 objects, speeding up iterated tilings by recycling intermediates
    /**
     * an array for recycled vector2 objects
     * @var Vector2.pool
     */
    Vector2.pool = [];

    /**
     * put vector2 objects on the pool for recycling
     * @method Vector2.toPool
     * @param {Vector2List} vectors
     */
    Vector2.toPool = function(vectors) {
        const length = arguments.length;
        for (var i = 0; i < length; i++) {
            Vector2.pool.push(arguments[i]);
        }
    };

    /**
     * get a vector2 object from the pool or create one
     * can set components from coordinate pair or clone a vector2 object
     * @method Vector2.fromPool
     * @param {float | Vector2 | nothing} x
     * @param {float | nothing} x
     * @return Vector2
     */
    Vector2.fromPool = function(x, y) {
        var result;
        if (Vector2.pool.length === 0) {
            result = new Vector2();
        } else {
            result = Vector2.pool.pop();
        }
        switch (arguments.length) {
            case 0:
                result.setComponents(0, 0);
                break;
            case 1:
                result.set(x);
                break;
            case 2:
                result.setComponents(x, y);
                break;
        }
        return result;
    };


}());
