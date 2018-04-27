/**
 * representing lines between two points (Vector2), do update if points change !!!
 * @constructor Line
 * @param {Vector2} a - first endpoint
 * @param {Vector2} b - second endpoint
 */

/* jshint esversion:6 */

function Line(a, b) {
    "use strict";
    this.setAB(a, b);
}


(function() {
    "use strict";

    Line.vector = new Vector2();

    /**
     * set the first point, update later
     * @method Line#setA
     * @param {Vector2} a - new first endpoint
     */
    Line.prototype.setA = function(a) {
        this.a = a;
    };

    /**
     * set the second point, update later
     * @method Line#setB
     * @param {Vector2} b - new second endpoint
     */
    Line.prototype.setB = function(b) {
        this.b = b;
    };

    /**
     * set both points, update later
     * @method Line#setAB
     * @param {Vector2} a - new first endpoint
     * @param {Vector2} b - new second endpoint
     */
    Line.prototype.setAB = function(a, b) {
        this.a = a;
        this.b = b;
    };

    /**
     * update the line data (unit vector from a to b), 
     * call after endpoints change or their data changes
     * calculates the unit vector along the line, needed for mirror symmetries
     * @method Line#update
     */
    Line.prototype.update = function() {
        this.ex = this.b.x - this.a.x;
        this.ey = this.b.y - this.a.y;
        const factor = 1 / Math.hypot(this.ex, this.ey);
        this.ex *= factor;
        this.ey *= factor;
    };

    /**
     * draw the line on an output image, as defined in the Draw namespace object
     * @method Line#draw
     */
    Line.prototype.draw = function() {
        Draw.line(this.a, this.b);
    };

    /**
     * check if a point is at the left of the line, looking from a to b
     * attention: inverted y-axis mirrors, left appears to be right
     * @method Line#isAtLeft
     * @param {Vector2} v - the point to test
     * @return {boolean} true if the point is at the left
     */
    Line.prototype.isAtLeft = function(v) {
        return (this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x)) > 0;
    };

    /**
     * mirror a point at the line
     * @method Line#mirror
     * @param {Vector2} v - the point to mirror
    * @return {float} 1, (Lyapunov coefficient)

     */
    Line.prototype.mirror = function(v) {
        let d = this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x); // distance to the left, as (-ey,ex) is perpendicular to the line and pointing to the left
        d *= 2;
        v.x += d * this.ey;
        v.y -= d * this.ex;
        return 1;
    };

    /**
     * mirror a point at the line and draw mapping
     * @method Line#drawMirror
     * @param {Vector2} v - the point to mirror
     */
    Line.prototype.drawMirror = function(v) {
        Line.vector.set(v);
        this.mirror(v);
        Draw.line(v, Line.vector);
        return 1;
    };

    /**
     * mirror a point at the line only if it is at the left of the line
     * @method Line#mirrorLeftToRight
     * @param {Vector2} v - the point to mirror
     * @return {float} 1 if point has been mapped (Lyapunov coefficient), else -1
     */
    Line.prototype.mirrorLeftToRight = function(v) {
        let d = this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x); // distance to the left, as (-ey,ex) is perpendicular to the line and pointing to the left
        if (d > 0.0001) {
            d *= 2;
            v.x += d * this.ey;
            v.y -= d * this.ex;
            return 1;
        }
        return -1;
    };

    /**
     * mirror a point at the line only if it is at the left of the line and draw mapping
     * @method Line#drawMirrorLeftToRight
     * @param {Vector2} v - the point to mirror
     * @return {boolean}  true if point has been mirrored
     */
    Line.prototype.drawMirrorLeftToRight = function(v) {
        Line.vector.set(v);
        if (this.mirrorLeftToRight(v) > 0) {
            Draw.line(v, Line.vector);
            return 1;
        }
        return -1;
    };

    /**
     * mirror a point at the line only if it is at the right of the line
     * @method Line#mirrorRightToLeft
     * @param {Vector2} v - the point to mirror
     * @return {float} 1 if point has been mapped (Lyapunov coefficient), else -1
     */
    Line.prototype.mirrorRightToLeft = function(v) {
        let d = this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x); // distance to the left, as (-ey,ex) is perpendicular to the line and pointing to the left
        if (d < -0.0001) {
            d *= 2;
            v.x += d * this.ey;
            v.y -= d * this.ex;
            return 1;
        }
        return -1;
    };


    /**
     * mirror a point at the line only if it is at the right of the line and draw mapping
     * @method Line#drawMirrorRightToLeft
     * @param {Vector2} v - the point to mirror
     * @return {float} 1 if point has been mapped (Lyapunov coefficient), else -1
     */
    Line.prototype.drawMirrorRightToLeft = function(v) {
        Line.vector.set(v);
        let result = this.mirrorRightToLeft(v);
        if (this.mirrorRightToLeft(v) > 0) {
            Draw.line(v, Line.vector);
            return 1;
        }
        return -1;
    };

}());
