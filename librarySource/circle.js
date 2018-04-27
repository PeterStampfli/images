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

    Circle.vector = new Vector2();

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
     * scale the circle (center and radius)
     * @method Circle.scale
     * @param {float} factor
     */
    Circle.prototype.scale = function(factor) {
        this.center.scale(factor);
        this.setRadius(factor * this.radius);
    };

    /**
     * draw the circle on an output image
     * @method Circle#draw
     */
    Circle.prototype.draw = function() {
        Draw.circle(this.radius, this.center);
    };

    /**
     * fill the circle on an output image
     * @method Circle#fill
     * @param {OutputImage} outputImage
     */
    Circle.prototype.fill = function(outputImage) {
        Draw.disc(this.radius, this.center);
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
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.invert = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        const factor = this.radius2 / pointR2;
        v.x = this.center.x + dx * factor;
        v.y = this.center.y + dy * factor;
        return factor;
    };

    /**
     * invert a point at the circle and draw mapping
     * @method Circle.drawInvert
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.drawInvert = function(v) {
        Circle.vector.set(v);
        let result = this.invert(v);
        Draw.line(v, Circle.vector);
        return result;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle.invertInsideOut
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.invertInsideOut = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 - 0.0001 > pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return factor;
        }
        return -1;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle and draw the mapping
     * @method Circle.drawInvertInsideOut
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.drawInvertInsideOut = function(v) {
        Circle.vector.set(v);
        let result = this.invertInsideOut(v);
        if (result > 0) {
            Draw.line(v, Circle.vector);
        }
        return result;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle.invertOutsideIn
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.invertOutsideIn = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 + 0.0001 < pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return factor;
        }
        return -1;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle and draw mapping
     * @method Circle.drawInvertOutsideIn
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.drawInvertOutsideIn = function(v) {
        Circle.vector.set(v);
        let result = this.invertOutsideIn(v);
        if (result > 0) {
            Draw.line(v, Circle.vector);
        }
        return result;

    };

}());
