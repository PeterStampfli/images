/**
 * representing polygons as a list of lines, winding counterclockwise
 * has limits of coordinates, do not change points afterwards
 * if needed, attach additional lines and other objects as fields to do mappings
 * @constructor Polygon
 * @param {ArrayOfVector2} corners - the corner points in counter clockwise order, changing them changes the polygon, just in case ...
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
     * creates unique points (vector2) (this is important to avoid dublicates, argument vectors may be calculated and reused)
     * @method Polygon.ofVectors
     * @param {ListOfVector2} vectors, list of Vector2 objects or Vector2 array
     * @return {Polygon}
     */
    Polygon.ofVectors = function(vectors) {
        var args;
        if (arguments.length === 1) {
            args = vectors;
        } else {
            args = Array.from(arguments);
        }
        const length = args.length;
        const corners = [];
        for (var i = 0; i < length; i++) {
            corners.push(Vector2.unique.fromVector(args[i]));
        }
        return new Polygon(corners);
    };

    /**
     * log the polygon
     * @method Polygon#log
     * @param {String} message - or nothind
     */
    Polygon.prototype.log = function(message) {
        if (message) {
            message += ": ";
        } else {
            message = "";
        }
        const lines = this.lines;
        const length = lines.length;
        console.log(message + "polygon with corners");
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


    // use firstline (inverted)

    /**
     *make that first line is mapping line
     * (first corner will be at (0,0) in image,first line points in positive x-axis direction)
     * because polygon corners are counterclockwise and polygon is convex, all points will be y>0 after rotation
     *@method Polygon#firstLineMaps
     */
    Polygon.prototype.firstLineMaps = function() {
        this.mappingLine = this.lines[0];
    };

    /**
     *make that inverted first line is mapping line
     * (second corner will be at (0,0) in image,first line points in negative x-axis direction, this mirrors)
     * because polygon corners are counterclockwise and polygon is convex, all points will be y<0 after rotation and there is a mirroring
     *@method Polygon#firstLineInvertedMaps
     */
    Polygon.prototype.firstLineInvertedMaps = function() {
        this.addMappingLineOfVectors(this.lines[0].b, this.lines[0].a);
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
        return this.mappingLine.shiftRotateMirror(p);
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
     * @method UniquePoints#log
     * @param {String} message - or nothing
     */
    UniquePolygons.prototype.log = function(message) {
        if (message) {
            message += ": ";
        } else {
            message = "";
        }
        console.log(message + "Unique polygons");
        const polygons = this.polygons;
        const length = polygons.length;
        for (var i = 0; i < length; i++) {
            polygons[i].log("index " + i);
        }
        console.log("---------------------------");
    };

    /**
     * draw the lines of all polygons
     * @method UniquePolygons#draw
     */
    UniquePolygons.prototype.draw = function() {
        Draw.array(this.polygons);
    };

    /**
     * check if a polygon is already in the list,
     * if not, return -1 
     * if it is in the list return index>=0
     * The polygons have to use the same UniquePoints
     * @method UniquePolygons#isNew
     * @param {Polygon} polygon
     * @return true if it is not in the list==is isNew
     */
    UniquePolygons.prototype.indexOf = function(polygon) {
        const polygons = this.polygons;
        const length = polygons.length;
        for (var i = 0; i < length; i++) {
            if (polygon.isEqual(polygons[i])) {
                return i;
            }
        }
        return -1;
    };

    /**
     * avoid dublicates:check if a polygon is already in the list,
     * if not, return true and add to list
     * if it is in the list return false
     * The polygons have to use the same UniquePoints
     * @method UniquePolygons#isNew
     * @param {Polygon} polygon
     * @return true if it is not in the list==is isNew
     */
    UniquePolygons.prototype.isNew = function(polygon) {
        if (this.indexOf(polygon) >= 0) {
            return false;
        } else {
            this.polygons.push(polygon);
            return true;
        }
    };

    /**
     * avoid dublicates:check if a polygon with given corners is already in the list,
     * if not, return true and add to list
     * if it is in the list return false
     * The polygons have to use the same UniquePoints
     * @method UniquePolygons#isNewPolygon
     * @param {Polygon} vectors - corners
     * @return true if it is not in the list==is isNew
     */
    UniquePolygons.prototype.isNewPolygon = function(vectors) {
        var args;
        if (arguments.length === 1) {
            args = vectors;
        } else {
            args = Array.from(arguments);
        }
        return this.isNew(Polygon.ofVectors(args));
    };

    /**
     * add a polygon to the list if it is not there
     * @method UniquePolygons#add
     * @param {Polygon} polygon
     */
    UniquePolygons.prototype.add = function(polygon) {
        let index = this.indexOf(polygon);


        if (index >= 0) {
            console.log("old image");

            return this.polygons[index];
        } else {
            this.polygons.push(polygon);
            return polygon;
        }
    };

    /**
     * create a polygon from vector2 and put it in the list iof not there, returns the polygon
     * creates unique points (vector2)
     * @method UniquePolygons.addPolygon
     * @param {ListOfVector2} vectors, list of Vector2 objects or Vector2 array
     * @return {Polygon}
     */
    UniquePolygons.prototype.addPolygon = function(vectors) {
        var args;
        if (arguments.length === 1) {
            args = vectors;
        } else {
            args = Array.from(arguments);
        }
        return this.add(Polygon.ofVectors(args));
    };

    /**
     * create an image polygon from vector2, the first line is the mapping line
     * put it in the list if it is not there, returns the polygon
     * choose whether the first corner maps to zero (or the second)
     * creates unique points (vector2)
     * @method UniquePolygons.addInvertedImagePolygon
     * @param {boolean} firstCornerMapsToZero
     * @param {ListOfVector2} vectors, list of Vector2 objects or Vector2 array
     * @return {Polygon}
     */
    UniquePolygons.prototype.addImagePolygon = function(firstCornerMapsToZero, vectors) {
        var args;
        if (arguments.length === 2) {
            args = vectors;
        } else {
            const length = arguments.length;
            args = Array(length - 1);
            for (var i = 1; i < length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        const polygon = this.add(Polygon.ofVectors(args));
        if (firstCornerMapsToZero) {
            polygon.firstLineMaps();
        } else {
            polygon.firstLineInvertedMaps();
        }
        return polygon;
    };

}());