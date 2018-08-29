/**
 * representing polygons as a list of lines, winding counterclockwise
 * has limits of coordinates, do not change points afterwards
 * if needed, attach additional lines and other objects as fields to do mappings
 * @constructor Polygon
 * @param {ArrayOfVector2} corners - the corner points in counter clockwise order, unique points
 */
/* jshint esversion:6 */

function Polygon(corners) {
    this.lines = [];
    this.xMin = corners[0].x;
    this.xMax = corners[0].x;
    this.yMin = corners[0].y;
    this.yMax = corners[0].y;
    const cornersLenght = corners.length;
    for (var i = 1; i < cornersLenght; i++) {
        this.lines.push(new Line(corners[i - 1], corners[i]));
        this.xMin = Math.min(this.xMin, corners[i].x);
        this.xMax = Math.max(this.xMax, corners[i].x);
        this.yMin = Math.min(this.yMin, corners[i].y);
        this.yMax = Math.max(this.yMax, corners[i].y);
    }
    this.lines.push(new Line(Fast.last(corners), corners[0]));
}

(function() {
    "use strict";

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
        return new Polygon(corners);
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
        return new Polygon(corners);
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
        console.log("limits: " + this.xMin + " " + this.xMax + " " + this.yMin + " " + this.yMax);
        if (this.mappingLine) {
            const line = this.mappingLine;
            console.log("mapping Line between: (" + line.a.x + "," + line.a.y + ") - (" + line.b.x + "," + line.b.y + ")");
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
     * check if a point is inside the surrounding rectangle
     * @method Polygon#rectangleContains
     * @param {Vector2} point
     * @return true if point is inside, false else
     */
    Polygon.prototype.rectangleContains = function(point) {
        return (point.x >= this.xMin) && (point.x <= this.xMax) && (point.y >= this.yMin) && (point.y <= this.yMax);
    };

    /** 
     * test if a point is inside the polygon, the polygon has to be convex and counterclockwise corners/lines
     * @method Polygon#contains
     * @param {Vector2} point
     * @return true if point is inside, false else
     */
    Polygon.prototype.contains = function(point) {
        if (this.rectangleContains(point)) {
            for (var i = this.lines.length - 1; i >= 0; i--) {
                if (this.lines[i].isAtRight(point)) { // true only if not at left and not on the line
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
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
        for (var i = 0; i < length; i++) {
            j = i + shift;
            if (j >= length) {
                j -= length;
            }
            if (lines[i].a !== otherLines[j].a) {
                return false;
            }
        }
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
            return false;
        }
        for (var shift = 0; shift < length; shift++) {
            if (this.isEqualShifted(other, shift)) {
                return true;
            }
        }
        return false;
    };


    // making images: add an imaging line, use mirrorsymmetry or rotation and mirroring as mapping

    /**
     * add an imaging line, with endpoints from the unique points pool
     * @method Polygon#addMappingLineOfVectors
     * @param {Vector2} a - endpoint
     * @param {Vector2} b - endpoint
     */
    Polygon.prototype.addMappingLineOfVectors = function(a, b) {
        this.mappingLine = new Line(Vector2.unique.fromVector(a), Vector2.unique.fromVector(b));
        this.inversion = 0;
    };

    /**
     * add an imaging line, with endpoints from the unique points pool
     * @method Polygon#addMappingLineOfCoordinates
     * @param {float} aX - endpoint coordinate
     * @param {float} aY - endpoint coordinate
     * @param {float} bX - endpoint coordinate
     * @param {float} bY - endpoint coordinate
     */
    Polygon.prototype.addMappingLineOfCoordinates = function(aX, aY, bX, bY) {
        this.mappingLine = new Line(Vector2.unique.fromCoordinates(aX, aY), Vector2.unique.fromCoordinates(bX, bY));
        this.inversion = 0;
    };

    // use firstline (inverted)

    /**
     *make that first line is mapping line
     * (first corner will be at (0,0) in image,first line points in x-axis direction)
     *@method Polygon#firstLineMaps
     */
    Polygon.prototype.firstLineMaps = function() {
        this.mappingLine = this.lines[0];
        this.inversion = 0;
    };

    /**
     *make that inverted first line is mapping line
     * (second corner will be at (0,0) in image,first line points in negative x-axis direction, this mirrors)
     *@method Polygon#firstLineInvertedMaps
     */
    Polygon.prototype.firstLineInvertedMaps = function() {
        this.addMappingLineOfVectors(this.lines[0].b, this.lines[0].a);
        this.inversion = 1;
    };

    /**
     * mirror a point at the mapping line of the polygon (if there is a mapping line, for repeated mirroring)
     * @method Polygon#mirror
     * @param {Vector2} p
     * @return true if there is a mapping line, false else
     */
    Polygon.prototype.mirror = function(p) {
        if (this.mappingLine) {
            this.mappingLine.mirror(p);
            return true;
        } else {
            return false;
        }
    };

    /**
     * shift (by end point a) and rotate (by - polar angle) a point
     * use mirror at x-axis to get point with positive y-value
     * maps endpoint A of mapping line to origin and endpoint B to the x-axis
     * @method Polygon#shiftRotateMirror
     * @param {Vector2} p
     * @return number of mirror images (0,1, or 2)
     */
    Polygon.prototype.shiftRotateMirror = function(p) {
        return this.mappingLine.shiftRotateMirror(p) + this.inversion;
    };


}());


/**
 * collections/pools of unique polygons, for iterations
 * check if a polygon has already beeen done (is in the collection)
 * use polygons to create the image
 * @constructor UniquePolygons
 */
function UniquePolygons() {
    this.polygons = [];
}

(function() {
    "use strict";

    /**
     * reset -> empty the list of polygons
     * @method UniquePoints#reset
     */
    UniquePolygons.prototype.reset = function() {
        this.polygons.length = 0;
    };

    /**
     * log the polygons
     * @method UniquePoints.log
     */
    UniquePolygons.prototype.log = function() {
        console.log("Unique polygons");
        const polygons = this.polygons;
        const length = polygons.length;
        for (var i = 0; i < length; i++) {
            console.log("polygon index " + i);
            polygons[i].log();
        }
    };

    /**
     * draw the lines of all polygons
     * @method UniquePolygons#draw
     */
    UniquePolygons.prototype.draw = function() {
        Draw.array(this.polygons);
    };

    /**
     * check if a polygon is alreday in the list,
     * if not, return true and add to list
     * if it is in the list return false
     * The polygons have to use the same UniquePoints
     * @method UniquePolygons#isNew
     * @param {Polygon} polygon
     * @return true if it is not in the list==is isNew
     */
    UniquePolygons.prototype.isNew = function(polygon) {
        const polygons = this.polygons;
        const length = polygons.length;
        for (var i = 0; i < length; i++) {
            if (polygon.isEqual(polygons[i])) {
                return false;
            }
        }
        polygons.push(polygon);
        return true;
    };


}());
