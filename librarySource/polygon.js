/**
 * representing polygons as a list of lines, winding counterclockwise
 * has limits of coordinates, do not change points afterwards
 * points are not cloned to save time and space, be aware of what you do
 * if needed, attach additional lines and other objects as fields to do mappings
 * @constructor Polygon
 * @param {ArrayOfVector2 or Vector2...} vectors - the corner points in counter clockwise order, as array or list
 */
/* jshint esversion:6 */

function Polygon(vectors) {
    var corners;
    if (arguments.length === 1) {
        corners = vectors;
    } else {
        corners = Array.from(arguments);
    }
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
    this.lines.push(new Line(corners[cornersLenght-1], corners[0]));
}

(function() {
    "use strict";


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
        this.mappingLine = new Line(a, b);
    };

    /**
     * mirror a point at the mapping line of the polygon (if there is a mapping line, for repeated mirroring)
     * final polygons have no mirror line
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
     * actually map point a to (0,0) and b to (1,0), or inversely
     * polygon.a=a and polygon.vx=(b.x-a.x)/|b-a|**2, vy= ...
     * @method Polygon#addBaseline
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {boolean} aMapsToZero - optional, default is true, if false a and b are inverted
     * @return Polygon, for chaining, adding more
     */
    Polygon.prototype.addBaseline = function(a, b, aMapsToZero) {
        var abx, aby;
        if ((arguments.length === 2) || aMapsToZero) {
            this.a = a;
            this.vx = b.x - a.x;
            this.vy = b.y - a.y;
        } else {
            this.a = b;
            this.vx = a.x - b.x;
            this.vy = a.y - b.y;
        }
        let scale = 1 / (this.vx * this.vx + this.vy * this.vy);
        this.vx *= scale;
        this.vy *= scale;
        this.shear = 0;
        this.yScale = 1;
        return this;
    };

    /**
     * set a nonzero value for the shear coefficient
     * @method Polygon.prototype.setShear
     * @param {float} shear
     * @return the polygon for chaining
     */
    Polygon.prototype.setShear = function(shear) {
        this.shear = shear;
        return this;
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
     * set coordinates of center point for triangle mapping in the output image space
     * @method Polygon.setCenter
     * @param {Vector2} center
     */
    Polygon.setCenter = function(center) {
        Polygon.center = center;
    };

    /**
     * set coordinates of (center) point gamma for triangle mapping in the input image space
     * it is the same for many polygons
     * @method Polygon.setGamma
     * @param {Vector2} gamma
     */
    Polygon.setGamma = function(gamma) {
        Polygon.gammaX = gamma.x;
        Polygon.gammaY = gamma.y;
    };

    /**
     * adjust yScale and shear parameters for triangle mapping
     * using the current gamma and center points
     * using the baseline that has been added to the polygon
     * requires and automatically sets Polygon.shiftRotateMirrorScaleShear();
     * @method Polygon#adjustScaleShearTriangleMapping
     */
    const centerClone = new Vector2();

    Polygon.prototype.adjustScaleShearTriangleMapping = function() {
        Polygon.mapWithShiftRotateMirrorScaleShear();
        centerClone.set(Polygon.center);
        this.applyBaseline(centerClone);
        this.yScale = Polygon.gammaY / centerClone.y;
        this.shear = (Polygon.gammaX - centerClone.x) / Polygon.gammaY;
    };


    /**
     * add a triangle mapping to a polygon
     * requires and automatically sets Polygon.shiftRotateMirrorScaleShear();
     * point a maps to (0,0)
     * point b maps to (1,0)
     * point (Polygon.centerX,Polygon.centerY) maps to (Polygon.gammaX,Polygon.gammaY)
     * @method Polygon#addTriangleMapping
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {boolean} aMapsToZero - optional, default is true, if false a and b are inverted
     */
    Polygon.prototype.addTriangleMapping = function(a, b, aMapsToZero) {
        this.addBaseline(a, b, (arguments.length === 2) || aMapsToZero);
        this.adjustScaleShearTriangleMapping();
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
     * shift,scale and rotate a point, 
     * use mirror at x-axis to get point with positive y-value
     * do shearing as indicated by this.shear
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
     * make that the map method is the shiftRotateMirrorShear
     * Polygon.mapWithShiftRotateMirrorShear
     */
    Polygon.mapWithShiftRotateMirrorShear = function() {
        Polygon.prototype.map = Polygon.prototype.shiftRotateMirrorShear;
    };

    /**
     * shift, scale and rotate a point
     * use mirror at x-axis to get point with positive y-value
     * do scaling in y-direction, do shearing
     * @method Polygon#shiftRotateMirrorScaleShear
     * @param {Vector2} p
     * @return number of mirror images (0,1, or 2)
     */
    Polygon.prototype.shiftRotateMirrorScaleShear = function(p) {
        let result = this.applyBaseline(p);
        p.y *= this.yScale;
        p.x += this.shear * p.y; // shearing
        return result;
    };


    /**
     * make that the map method is the shiftRotateMirror
     * Polygon.mapWithShiftRotateMirrorScaleShear
     */
    Polygon.mapWithShiftRotateMirrorScaleShear = function() {
        Polygon.prototype.map = Polygon.prototype.shiftRotateMirrorScaleShear;
    };


}());
