/**
 * representing polygons as a list of lines
 * winding counterclockwise
 * if needed, attach additional lines and other objects as fields to do mappings
 * @constructor Polygon
 * @param {ArrayOfLine} lines - that make up the polygon, counterclockwise order
 */
/* jshint esversion:6 */


function Polygon(lines) {
    this.lines = lines;
}


(function() {
    "use strict";

    /**
     * create a polygon from point (Vector2) data, assumes they are unique 
     * @method Polygon.ofVectorArray
     * @param {ArrayOfVector2} corners - the corner points in counter clockwise order
     * @return {Polygon}
     */
    Polygon.ofVectorArray = function(corners) {
        const lines = [];
        const cornersLenght = corners.length;
        for (var i = 1; i < cornersLenght; i++) {
            lines.push(new Line(corners[i - 1], corners[i]));
        }
        lines.push(new Line(Fast.last(corners), corners[0]));
        return new Polygon(lines);
    };

    /**
     * create a polygon from vector2
     * creates unique points (vector2)
     * @method Polygon.ofVectors
     * @param {ListOfVector2} vectors, list of Vector2 objects or Vector2 array
     * @return {Polygon}
     */
    Polygon.ofVectors = function(vectors) {
        const length = arguments.length;
        const corners = [];
        for (var i = 0; i < length; i++) {
            corners.push(Vector2.unique.fromVector(arguments[i]));
        }
        return Polygon.ofVectorArray(corners);
    };

    /**
     * create a polygon from coordinates
     * creates unique points (vector2)
     * @method Polygon.ofCoordinates
     * @param {listOfFloat} list of floats, x,y coordinate pairs 
     * @return {Polygon}
     */
    Polygon.ofCoordinates = function(coordinates) {
        const length = arguments.length;
        const corners = [];
        for (var i = 0; i < length; i += 2) {
            corners.push(Vector2.unique.fromCoordinates(arguments[i], arguments[i + 1]));
        }
        return Polygon.ofVectorArray(corners);
    };

    /**
     * log the polygon
     * @method Polygon#log
     */
    Polygon.prototype.log = function() {
        const lines = this.lines;
        const length = lines.length;
        console.log("polygon corners");
        for (var i = 0; i < length; i++) {
            console.log(i + "  (" + lines[i].a.x + "," + lines[i].a.y + ")");
        }
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

    // test if two polygons are equal: Corners have to belong to the same UniquePoints object 
    // corners are equal (same objects) and occur in sequence, but they may be offset
    // check if corners are equal by a given shift (between 0 and length of corners -1
    // it has already been checked that number of lines (corners) is equal
    Polygon.prototype.isEqualShifted = function(other, shift) {
        const lines = this.lines;
        const otherLines = other.lines;
        const length = lines.length;
        var j;
        console.log("areEqualShifted: shift " + shift);
        for (var i = 0; i < length; i++) {
            j = i + shift;
            if (j >= length) {
                j -= length;
            }
            console.log(i + " " + j);
            if (lines[i].a !== otherLines[j].a) {
                return false;
            }
        }
        console.log("true");
        return true;
    };

    /**
     * check if this polygon is equal to another one
     * @method Polygon#isEqual 
     * @param {Polygon} other
     * @return true if both are equal (same corners in sequence)
     */
    Polygon.prototype.isEqual = function(other) {
        const length = this.lines.length;
        if (length !== other.lines.length) {
            console.log("diff n of corner");
            return false;
        }
        for (var shift = 0; shift < length; shift++) {
            if (this.isEqualShifted(other, shift)) {
                console.log(shift);
                return true;
            }
        }
        return false;
    };

}());
