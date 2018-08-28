/**
 * representing lines between two points (Vector2), do update if points change !!!
 * these are directed lines, line from a to b is different to line from b to a
 * @constructor Line
 * @param {Vector2} a - first endpoint
 * @param {Vector2} b - second endpoint
 */

/**
 * first endpoint
 * @var Line#a {Vector2}
 */

/**
 * second endpoint
 * @var Line#b {Vector2}
 */

/**
 * unit vector, pointing from a to b
 * needs explicite update if points or their data change
 * NOTE that points may be changed somewhere else
 * @var Line#ex {float}
 * @var Line#ey {float}
 */

/* jshint esversion:6 */

function Line(a, b) {
    "use strict";
    this.setAB(a, b);
    this.update();
}


(function() {
    "use strict";

    Line.vector = new Vector2();
    // default length for creating lines with a given polar angle
    const big = 1000;

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
     * clone a line, making a deep copy, updated
     * @method Line#clone
     * @return copy of the line
     */
    Line.prototype.clone = function() {
        let clone = new Line(line.a.clone(), line.b.clone());
        clone.update();
        return clone;
    };

    /**
     * create a long line starting at the origin at the given polar angle
     * @method Line.atPolar
     * @param {float} angle
     * @return line object with given polar angle
     */
    Line.atPolar = function(angle) {
        let point = new Vector2();
        point.setPolar(big, angle);
        return new Line(new Vector2(0, 0), point);
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
     * check if a point is at the right of the line, looking from a to b
     * attention: inverted y-axis mirrors, left appears to be right
     * @method Line#isAtRight
     * @param {Vector2} v - the point to test
     * @return {boolean} true if the point is at the right, false if at left or on the line
     */
    Line.prototype.isAtRight = function(v) {
        return (this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x)) < 0;
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
     * @return {float} 1 if point has been mapped (Lyapunov coefficient), else -1
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
        if (this.mirrorRightToLeft(v) > 0) {
            Draw.line(v, Line.vector);
            return 1;
        }
        return -1;
    };

    /**
     * shift (by end point a) and rotate (by - polar angle) a point
     * use mirror at x-axis to get point with positive y-value
     * maps endpoint A to origin and endpoint B to the x-axis
     * use result to decorate polygon
     * @method Line#shiftRotateMirror
     * @param {Vector2} point
     * @return true if mirror image, false else
     */
    Line.prototype.shiftRotateMirror = function(point) {
        point.x -= this.a.x;
        point.y -= this.a.y;
        const h = this.ex * point.x + this.ey * point.y;
        point.y = -this.ey * point.x + this.ex * point.y;
        point.x = h;
        if (point.y < 0) {
            point.y = -point.y;
            return true;
        }
        return false;
    };

}());
