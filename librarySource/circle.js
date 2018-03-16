/**
 * a circle as an object with a radius, square of radius and center vector
 * @constructor Circle
 * @param {float} radius 
 * @param {Vector2} center
 */



/* jshint esversion:6 */

function Circle(radius, center) {
    "use strict";
    this.setRadius(radius);
    this.setCenter(center);
}


(function() {
    "use strict";

    /**
     * set radius, square of radius 
     * @method Circle#setRadius
     * @param {float} radius 
     */
    Circle.prototype.setRadius = function(radius) {
        this.radius = radius;
        this.radius2 = radius * radius;
    };

    /**
     * set center vector
     * @method Circle#setCenter
     * @param {float} radius 
     * @param {Vector2} center
     */
    Circle.prototype.setCenter = function(center) {
        this.center = center;
    };

    /**
     * check if a vector is inside the circle
     * @method Circle#contains
     * @param {Vector2} v - the vector to check
     * @return {boolean} true if vector is inside circle
     */
    Circle.prototype.contains = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        return this.radius2 >= dx * dx + dy * dy;
    };

    /**
     * invert a point at the circle
     * @method Circle.invert
     * @param {Vector2} v - vector, position of the point
     */
    Circle.prototype.invert = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        const factor = this.radius2 / pointR2;
        v.x = this.center.x + dx * factor;
        v.y = this.center.y + dy * factor;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle.invert
     * @param {Vector2} v - vector, position of the point
     * @return {boolean} true if the point has been inverted
     */
    Circle.prototype.invertInsideOut = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 - 0.0001 > pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return true;
        }
        return false;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle.invert
     * @param {Vector2} v - vector, position of the point
     * @return {boolean} true if the point has been inverted
     */
    Circle.prototype.invertOutsideIn = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 + 0.0001 < pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return true;
        }
        return false;
    };
    
}());
