/**
 * representing polygons as a list of lines
 * winding counterclockwise
 * may waste a bit of memory, but efficient
 * if needed, attach additional lines and other objects as fields to do mappings
 * @constructor Polygon
 * @param {Array of Line} lines - that make up the polygon, counterclockwise order
 */
/* jshint esversion:6 */


function Polygon(lines) {
    this.lines = lines;
}


(function() {
    "use strict";

    /**
     * create a polygon from point (Vector2) data, this wastes memory of lines are shared between polygons
     * (but we have a lot of memory, speed is important)
     * @method Polygon.ofPoints
     * @param {Array of Vector2} corners - the corner points in counter clockwise order
     * @return {Polygon}
     */
    Polygon.ofPoints = function(corners) {
        const lines = [];
        const cornersLenght = corners.length;
        lines.push(new Line(Fast.last(corners), corners[0]));
        for (var i = 1; i < cornersLenght; i++) {
            lines.push(new Line(corners[i - 1], corners[i]));
        }
        return new Polygon(lines);
    };

    /**
     * create a polygon from coordinates
     * which wastes memory because of multiple cornerpoints that are not shared.
     * @method Polygon.ofCoordinates
     * @param {float ...} list of floats, x,y coordinate pairs 
     * @return {Polygon}
     */
    Polygon.ofCoordinates = function(coordinates) {
        const length = arguments.length;
        const corners = [];
        for (var i = 0; i < length; i += 2) {
            corners.push(new Vector2(arguments[i], arguments[i + 1]));
        }
        return Polygon.ofPoints(corners);
    };

    /**
     * log the polygon
     * @method Polygon#log
     */
    Polygon.prototype.log = function() {
        console.log("polygon corners");
        this.lines.forEach(line => {
            console.log(line.a);
            console.log(line.b);
        });
    };

    /**
     * draw the polygon lines
     * @method Polygon#draw
     */
    Polygon.prototype.draw = function() {
        Draw.array(this.lines);
    };

    /**
     * get minimum x-coordinate of corners
     * @method Polygon#xMin
     * @return {float} minimum of x-coordinates
     */
    Polygon.prototype.xMin = function() {
        let result = 1e10;
        this.lines.forEach(line => {
            result = Math.min(result, line.a.x);
        });
        return result;
    };

    /**
     * get maximum x-coordinate of corners
     * @method Polygon#xMax
     * @return {float} maximum of x-coordinates
     */
    Polygon.prototype.xMax = function() {
        let result = -1e10;
        this.lines.forEach(line => {
            result = Math.max(result, line.a.x);
        });
        return result;
    };

    /**
     * get minimum y-coordinate of corners
     * @method Polygon#yMin
     * @return {float} minimum of y-coordinates
     */
    Polygon.prototype.yMin = function() {
        let result = 1e10;
        this.lines.forEach(line => {
            result = Math.min(result, line.a.y);
        });
        return result;
    };

    /**
     * get maximum x-coordinate of corners
     * @method Polygon#yMax
     * @return {float} maximum of x-coordinates
     */
    Polygon.prototype.yMax = function() {
        let result = -1e10;
        this.lines.forEach(line => {
            result = Math.max(result, line.a.y);
        });
        return result;
    };

    /** 
     * test if a point is inside the polygon, the polygon has to be convex and counterclockwise corners/lines
     * @method Polygon#isInside
     * @param {Vector2} point
     * @return true if point is inside, false else
     */
    Polygon.prototype.isInside = function(point) {
        for (var i = this.lines.length - 1; i >= 0; i--) {
            if (this.lines[i].isAtRight(point)) {
                return false;
            }
        }
        return true;
    };


}());
