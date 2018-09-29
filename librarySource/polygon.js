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
     * create a polygon from vector2 array or repeated args
     * the vectors are cloned because they might be changed later
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
            corners.push(args[i].clone());
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

    // making mapping more explicite and transparent

    /**
     * adding a base line to the polygon for translation, rotation and scaling
     * setting shear value equal to zero as default
     * actually map point a to (0,0) and b to (1,0)
     * polygon.a=a and polygon.vx=(b.x-a.x)/|b-a|**2, vy= ...
     * @method Polygon#addBaseline
     * @param {Vector2} a
     * @param {Vector2} b
     * @return Polygon, for chaining, adding more
     */
    Polygon.prototype.addBaseline = function(a, b) {
        this.a = a.clone();
        let ab = Vector2.difference(b, a);
        ab.scale(1 / ab.length2());
        this.vx = ab.x;
        this.vy = ab.y;
        this.shear = 0;
        return this;
    };

    /**
     * set a nonzero value for the shear coefficient
     * @method Polygon.prototype.setShear
     * @param {float} shear
     */
    Polygon.prototype.setShear = function(shear) {
        this.shear = shear;
    };


    /**
     * apply the baseline on a point
     * mirror at x-axis if point.y<0
     * @method Polygon#applyBaseline
     * @param {Vector2} position - will be transformed
     * @return 0 if no mirroring, 1 if mirrored
     */
    Polygon.prototype.applyBaseline = function(position) {
        position.sub(this.a);
        let y = -this.vy * position.x + this.vx * position.y;
        position.x = this.vx * position.x + this.vy * position.y;
        if (y > 0) {
            position.y = y;
            return 0;
        } else {
            position.y = -y;
            return 1;
        }
    };


    /**
     * for more versatility, map a point with method to be choosen as
     *     Polygon.prototype.map=Polygon.prototype.someMappingMethod;
     * here a generic stub that does nothing
     * @method Polygon#map
     * @param {Vector2} p
     * @return number of mirror images (0,1, or 2)
     */
    Polygon.prototype.map = function(p) {
        return 0;
    };


    /**
     * shift,scale and rotate a point
     * use mirror at x-axis to get point with positive y-value
     * maps endpoint A of mapping line to origin and endpoint B to the x-axis (1,0)
     * no shear, no scale
     * @method Polygon#shiftRotateMirror
     * @param {Vector2} p
     * @return number of mirror images (0,1, or 2)
     */
    Polygon.prototype.shiftRotateMirror = function(p) {
        //     let result = this.mappingLine.shiftRotateMirror(p);
        //     p.x += this.shift * p.y; // shearing
        let result = this.applyBaseline(p);
        return result;
    };

    /**
     * make that the map method is the shiftRotateMirror
     * Polygon.mapWithShiftRotateMirror
     */
    Polygon.mapWithShiftRotateMirror = function() {
        Polygon.prototype.map = Polygon.prototype.shiftRotateMirror;
    };

    /**
     * shift,scale and rotate a point, do shearing
     * use mirror at x-axis to get point with positive y-value
     * maps endpoint A of mapping line to origin and endpoint B to the x-axis (1,0)
     * uses shearing as indicated by this.shear
     * @method Polygon#shiftRotateMirrorShear
     * @param {Vector2} p
     * @return number of mirror images (0,1, or 2)
     */
    Polygon.prototype.shiftRotateMirrorShear = function(p) {
        let result = this.applyBaseline(p);
        p.x += this.shear * p.y; // shearing
        return result;
    };

    /**
     * make that the map method is the shiftRotateMirror
     * Polygon.mapWithShiftRotateMirrorShear
     */
    Polygon.mapWithShiftRotateMirrorShear = function() {
        Polygon.prototype.map = Polygon.prototype.shiftRotateMirrorShear;
    };

}());


/**
 * collections/pools of polygons, for iterations
 * use polygons to create the image
 * @constructor Polygons
 */
function Polygons() {
    this.polygons = [];
}

(function() {
    "use strict";

    /**
     * reset -> empty the list of polygons
     * @method UniquePoints#reset
     */
    Polygons.prototype.reset = function() {
        this.polygons.length = 0;
    };

    /**
     * log the polygons
     * @method UniquePoints#log
     * @param {String} message - or nothing
     */
    Polygons.prototype.log = function(message) {
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
     * @method Polygons#draw
     */
    Polygons.prototype.draw = function() {
        Draw.array(this.polygons);
    };

    /**
     * add a polygon to the list if it is not there
     * @method Polygons#add
     * @param {Polygon} polygon
     * @return the polygon, stored in the list
     */
    Polygons.prototype.add = function(polygon) {
        this.polygons.push(polygon);
        return polygon;
    };

    /**
     * create a polygon from vector2 and put it in the list if not there, returns the polygon
     * clone vectors, if changed later ...
     * @method Polygons.addPolygon
     * @param {ListOfVector2} vectors, list of Vector2 objects
     * @return {Polygon}
     */
    Polygons.prototype.addPolygon = function(vectors) {
        return this.add(new Polygon(Array.from(arguments)));
    };


}());
