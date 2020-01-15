/* jshint esversion:6 */

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
     * the argument vector may be changed without further effect
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
