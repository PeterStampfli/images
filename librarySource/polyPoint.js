/**
 * lightweight version of polygon
 * saves only corners and draws line between corners
 * @constructor PolyPoint
 * @param {ArrayOfVector2 | Vector2List} vectors - the corner points in counter clockwise order, as array or list
 */
/* jshint esversion:6 */

function PolyPoint(vectors) {
    if (arguments.length === 1) {
        this.corners = vectors;
    } else {
        this.corners = Array.from(arguments);
    }
}



(function() {
    "use strict";


    /**
     * log the polygon
     * @method Polygon#log
     * @param {String} message - or nothind
     */
    PolyPoint.prototype.log = function(message) {
        if (message) {
            message += ": ";
        } else {
            message = "";
        }
        const corners = this.corners;
        const length = corners.length;
        console.log(message + "polyPoint with corners");
        for (var i = 0; i < length; i++) {
            console.log(i + "  (" + corners[i].x + "," + corners[i].y + ")");
        }
    };

    /**
     * draw the  lines
     * @method PolyPoint#draw
     */
    PolyPoint.prototype.draw = function() {

        const corners = this.corners;
        const length = corners.length;
        for (var i = 1; i < length; i++) {
            Draw.line(corners[i - 1], corners[i]);
        }

        Draw.line(corners[length - 1], corners[0]);


    };


}());
