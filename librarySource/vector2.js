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
     * @method Vector2.log 
     */
    Vector2.prototype.log = function() {
        console.log("Vector2 (" + this.x + "," + this.y + ")");
    };

}());


/**
 * pools of unique points(Vector2 objects)
 * together with limits of coordinate values for bounding rectangle. Do not change points later...
 * @constructor UniquePoints
 */
function UniquePoints() {
    this.points = [];
    this.reset();
}


(function() {
    "use strict";

    /**
     * reset -> empty the list of points, reset limits
     * @method UniquePoints#reset
     */
    UniquePoints.prototype.reset = function() {
        this.points.length = 0;
        this.xMin = 1e10;
        this.xMax = -1e10;
        this.yMin = 1e10;
        this.yMax = -1e10;
    };

    /**
     * log the points
     * @method UniquePoints.log
     */
    UniquePoints.prototype.log = function() {
        console.log("Unique points");
        const points = this.points;
        const length = points.length;
        for (var i = 0; i < length; i++) {
            console.log(i + "  (" + points[i].x + "," + points[i].y + ")");
        }
        console.log("limits: " + this.xMin + " " + this.xMax + " " + this.yMin + " " + this.yMax);
    };

    /**
     * create a unique point (Vector2) from coordinates
     * @method UniquePoints#fromCoordinates
     * @param {float} x
     * @param {float} y
     * @return Vector2 object for the point
     */
    UniquePoints.prototype.fromCoordinates = function(x, y) {
        const points = this.points;
        const length = points.length;
        for (var i = 0; i < length; i++) {
            if ((Math.abs(x - points[i].x) < Vector2.epsilon) && (Math.abs(y - points[i].y) < Vector2.epsilon)) {
                return points[i];
            }
        }
        points.push(new Vector2(x, y));
        this.xMin = Math.min(this.xMin, x);
        this.xMax = Math.max(this.xMax, x);
        this.yMin = Math.min(this.yMin, y);
        this.yMax = Math.max(this.yMax, y);
        return points[length];
    };

    /**
     * create a unique point (Vector2) from another vector2
     * @method UniquePoints#fromVector
     * @param {Vector2} v
     * @return Vector2 object for the point
     */
    UniquePoints.prototype.fromVector = function(v) {
        return this.fromCoordinates(v.x, v.y);
    };


    /**
     * a static instance of UniquePoints
     * @var Vector2.unique
     */
    Vector2.unique = new UniquePoints();

}());
