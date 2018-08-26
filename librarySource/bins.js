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
     * setup the dimensions and create empty bins
     * @method Bins#setup
     * @param {float}  xMin 
     * @param {float}  xMax
     * @param {float}  yMin 
     * @param {float}  yMax
     * @param {float}  side - length of the squares mapping to bins
     */
    Bins.prototype.setup = function(xMin, xMax, yMin, yMax, side) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.side = side;
        this.width = Math.floor((xMax - xMin) / side) + 1;
        this.height = Math.floor((yMax - yMin) / side) + 1;
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
                console.log(this.bins[i + this.width * j]);
            }
        }
    };

    /**
     * adding an extended object to all bins its surrounding rectangle covers
     * @method Bins#addAtCoordinateRange
     * @param {Object} object - to add to bin 
     * @param {float} xLow - low x-coordinate
     * @param {float} xHigh - high x-coordinate
     * @param {float} yLow - low y-coordinate
     * @param {float} yHigh - high y-coordinate
     */
    Bins.prototype.addAtCoordinateRange = function(object, xLow, xHigh, yLow, yHigh) {
        let iLow = Fast.clamp(0, Math.floor((xLow - this.xMin) / this.side), this.width - 1);
        let iHigh = Fast.clamp(0, Math.floor((xHigh - this.xMin) / this.side), this.width - 1);
        let jLow = Fast.clamp(0, Math.floor((yLow - this.yMin) / this.side), this.height - 1);
        let jHigh = Fast.clamp(0, Math.floor((yHigh - this.yMin) / this.side), this.height - 1);
        var jWidth;
        for (var j = jLow; j <= jHigh; j++) {
            jWidth = j * this.width;
            for (var i = iLow; i < iHigh; i++) {
                this.bins[i + jWidth].push(object);
            }
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
                console.log(i + this.width * j);
                return this.bins[i + this.width * j];
            } else {
                return [];
            }
        } else return [];
    };


}());
