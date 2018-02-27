/**
 * representing lines between two points (Vector2), do update if points change !!!
 * @constructor Line
 * @param {Vector2} a - first endpoint
 * @param {Vector2} b - second endpoint
 */

/* jshint esversion:6 */

function Line(a, b) {
    "use strict";
    this.setA(a);
    this.setB(b);
    this.update();
}


(function() {
    "use strict";

    /**
     * set the first point, needs update
     * @method Line.setA
     * @param {Vector2} a - new first endpoint
     */
    Line.prototype.setA = function(a) {
        this.a = a;
    };

    /**
     * set the second point, neeeds update
     * @method Line.setB
     * @param {Vector2} b - new second endpoint
     */
    Line.prototype.setB = function(b) {
        this.b = b;
    };

    /**
     * update the line data (unit vector from a to b), call after endpoints change
     * calculates the unit vector along the line, needed for mirror symmetries
     * @Line#update
     */
    Line.prototype.update = function() {
        this.ex = this.bx - this.ax;
        this.ey = this.by - this.bx;
        const factor = 1 / (this.ex * this.ex + this.ey * this.ey);
        this.ex *= factor;
        this.ey *= factor;
    };

    /**
     * check if a point is at the left of the line, looking from a to b
     * attention: inverted y-axis mirrors, left appears to be right
     * @method Line#isAtLeft
     * @param {Vector2} v - the point to test
     * @return {boolean} true if the point is at the left
     */
    Line.prototype.isAtLeft = function(v) {
        return this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x) > 0;
    };

    /**
     * mirror a point at the line
     * @method Line#mirror
     * @param {Vector2} v - the point to mirror
     */
    Line.prototype.mirror = function(v) {
        let d = this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x); // distance to the left, as (-ey,ex) is perpendicular to the line and pointing to the left
        d *= 2;
        v.x += d * this.ey;
        v.y -= d * this.ex;
    };

    /**
     * mirror a point at the line only if it is at the left of the line
     * @method Line#mirror
     * @param {Vector2} v - the point to mirror
     * @ return {boolean}  true if point has been mirrored
     */
    Line.prototype.mirrorLeftToRight = function(v) {
        let d = this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x); // distance to the left, as (-ey,ex) is perpendicular to the line and pointing to the left
        if (d > 0.0001) {
            d *= 2;
            v.x += d * this.ey;
            v.y -= d * this.ex;
            return true;
        }
        return false;
    };

    /**
     * mirror a point at the line only if it is at the right of the line
     * @method Line#mirror
     * @param {Vector2} v - the point to mirror
     * @ return {boolean}  true if point has been mirrored
     */
    Line.prototype.mirrorRightToLeft = function(v) {
        let d = this.ex * (v.y - this.a.y) - this.ey * (v.x - this.a.x); // distance to the left, as (-ey,ex) is perpendicular to the line and pointing to the left
        if (d < -0.0001) {
            d *= 2;
            v.x += d * this.ey;
            v.y -= d * this.ex;
            return true;
        }
        return false;
    };
}());
