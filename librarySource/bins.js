/**
 * a grid having bins to store whatever
 * @constructor Bins
 */
/* jshint esversion:6 */

function Bins() {
    this.bins = [];
}


(function() {
    "use strict";

    /**
     * setup the dimensions (region and bin size)
     * @method Bins#dimensions
     * @param {float}  xMin 
     * @param {float}  xMax
     * @param {float}  yMin 
     * @param {float}  yMax
     * @param {float}  side - length of the squares mapping to bins
     */
    Bins.prototype.dimensions = function(xMin, xMax, yMin, yMax, side) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.side = side;
        this.width = Math.floor((xMax - xMin) / side) ;
        this.height = Math.floor((yMax - yMin) / side) ;
    };

    /**
     * reset: empty bins with same dimensions as before
     * @method Bins#empty
     */
    Bins.prototype.empty = function() {
        this.bins.length = 0;
        const size = this.width * this.height;
        for (var i = 0; i < size; i++) {
            this.bins.push([]);
        }
    };
    /**
     * adding a point like object to its matching bin
     * keeping attention to limits
     * @method Bins.addAtCoordinates
     * @param {Object} object - to add to bin 
     * @param {float} x -coordinate
     * @param {float} y -coordinate
     */
    Bins.prototype.addAtCoordinates = function(object, x, y) {
        let i = Math.floor((x - this.xMin) / this.side);
        if ((i >= 0) && (i < this.width)) {
            let j = Math.floor((y - this.yMin) / this.side);
            if ((j >= 0) && (j < this.height)) {
                this.bins[i + this.width * j].push(object);
            }
        }
    };

    /**
     * add a point (Vector2 object)
     * @method Bins#addPoint
     * @param {Vector2} p - any object with x and y fields
     */
    Bins.prototype.addPoint = function(p) {
        this.addAtCoordinates(p, p.x, p.y);
    };

    /**
     * adding an extended object to all bins its surrounding rectangle covers
     * attention to upper border bins
     * @method Bins#addAtCoordinateRange
     * @param {Object} object - to add to bin 
     * @param {float} xLow - low x-coordinate
     * @param {float} xHigh - high x-coordinate
     * @param {float} yLow - low y-coordinate
     * @param {float} yHigh - high y-coordinate
     */
    Bins.prototype.addAtCoordinateRange = function(object, xLow, xHigh, yLow, yHigh) {
        let iLow = Fast.clamp(0, Math.floor((xLow - this.xMin) / this.side), this.width);
        let iHigh = Fast.clamp(0, 2 + Math.floor((xHigh - this.xMin) / this.side), this.width);
        let jLow = Fast.clamp(0, Math.floor((yLow - this.yMin) / this.side), this.height);
        let jHigh = Fast.clamp(0, 2 + Math.floor((yHigh - this.yMin) / this.side), this.height);
        var jWidth;
        for (var j = jLow; j < jHigh; j++) {
            jWidth = j * this.width;
            for (var i = iLow; i < iHigh; i++) {
                this.bins[i + jWidth].push(object);
            }
        }
    };

    /**
     * adding an extended object to all bins its surrounding rectangle covers
     * @method Bins#addObject
     * @param {Object} object - to add to bin, with xMin,xMax,yMin and yMax fields
     */
    Bins.prototype.addObject = function(object) {
        this.addAtCoordinateRange(object, object.xMin, object.xMax, object.yMin, object.yMax);
    };

    /**
     * adding extended objects to all bins its surrounding rectangle covers
     * @method Bins#addObjects
     * @param {ArrayOfObject} objects - to add to bin, with xMin,xMax,yMin and yMax fields
     */
    Bins.prototype.addObjects = function(objects) {
        for (var i = objects.length - 1; i >= 0; i--) {
            this.addObject(objects[i]);
        }
    };

    /**
     * get the bin defined by coordinates
     * keeping attention to limits
     * @method Bins.getAtCoordinates
     * @param {float} x -coordinate
     * @param {float} y -coordinate
     * @return {ArrayOfObjects}
     */
    Bins.prototype.getAtCoordinates = function(x, y) {
        let i = Math.floor((x - this.xMin) / this.side);
        if ((i >= 0) && (i < this.width)) {
            let j = Math.floor((y - this.yMin) / this.side);
            if ((j >= 0) && (j < this.height)) {
                return this.bins[i + this.width * j];
            } else {
                return [];
            }
        } else return [];
    };

    /**
     * get the bin defined by a point (Vector2)
     * @method Bins#getAtPoint
     * @param {Vector2} p
     * @return {ArrayOfObjects}
     */
    Bins.prototype.getAtPoint = function(p) {
        return this.getAtCoordinates(p.x, p.y);
    };

    /**
     * find the first object that contains the point
     * the bins have only objects with a contains(Vector2) method
     * @method Bins#getFirstContains
     * @param {Vector2} p
     * @return object or null
     */
    Bins.prototype.getFirstContains = function(p) {
        const bin = this.getAtPoint(p);
        const length = bin.length;
        var result;
        for (var i = 0; i < length; i++) {
            result = bin[i];
            if (result.contains(p)) {
                return result;
            }
        }
        return null;
    };

    // mappings

    /**
     * repeated mirrors until point is inside a polygon without a mirror Line
     * points not in a polygon will not be drawn (return lyapunov <0)
     * making the structure
     * @method Bins#structureRepeatedMirrors
     * @param {Vector2} p - p.x will be set to number of mirrors+2
     * @return number of reflections+1 for good points, -1 for points not to draw 
     */
    Bins.prototype.repeatedMirrors = function(p) {
        var polygon;
        let reflections = 0;
        while (true) {
            polygon = this.getFirstContains(p);
            if (polygon) {
                if (polygon.mirror(p)) {
                    reflections++;
                } else {
                    return reflections;
                }
            } else {
                return -1;
            }
        }
    };

    /**
     * map a point if inside a polygon, using the polygon.map() method
     * @method Bins#map
     * @param {Vector2}
     * @return -1 for bad point outside polygon, 0 or 2 if not mirrored, 1 if mirrored
     */
    Bins.prototype.map = function(p) {
        let polygon = this.getFirstContains(p);
        if (polygon) {
            return polygon.map(p);
        } else {
            return -1;
        }
    };


}());
