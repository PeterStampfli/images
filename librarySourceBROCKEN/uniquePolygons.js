/**
 * collections/pools of unique polygons
 * check if a polygon is in the collection
 * use polygons to create the image
 * @constructor UniquePolygons
 */
/* jshint esversion:6 */

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
     * @return the polygon, stored in the list
     */
    UniquePolygons.prototype.add = function(polygon) {
        let index = this.indexOf(polygon);
        if (index >= 0) {
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
            polygon.addBaseline(args[0], args[1]);
        } else {
            polygon.addBaseline(args[1], args[0]);
        }
        polygon.shift = Polygon.imageShift;
        return polygon;
    };

}());
