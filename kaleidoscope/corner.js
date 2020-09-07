/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    regions
} from './modules.js';

/**
 * corner for the polygons
 * not all are on circle centers
 * they are nodes of the network of lines separating different regions
 * @constructor Circle
 * @param {number} x - coordinate of position
 * @param {number} y - coordinate of position
 */
export function Corner(x, y) {
    this.x = x;
    this.y = y;
    this.lines = [];
}

/**
 * add a line to the array of lines
 * @method Corner#addLine
 * @param {Line} line
 */
Corner.prototype.addLine = function(line) {
    this.lines.push(line);
};

/**
 * remove an line from the collection
 * @method Corner#removeLine
 * @param {Line} line
 */
Corner.prototype.removeLine = function(line) {
    const index = this.lines.indexOf(line);
    if (index >= 0) {
        this.lines.splice(index, 1);
    } else {
        console.error('Corner#removeLine: line not found. It is:');
        console.log(line);
        console.log(this.lines);
    }
};

/** 
 * sort lines in ascending order of their angles
 * @method Corner#sortLines
 */
Corner.prototype.sortLines = function() {
    const corner = this;
    this.lines.sort(function(a, b) {
        return a.getAngle(corner) - b.getAngle(corner);
    });
};

/**
 * find the next line (in ascending angle) to given line
 * @method Corner#getNextLine
 * @param {Line} line
 * @return Line
 */
Corner.prototype.getNextLine = function(line) {
    let index = this.lines.indexOf(line);
    if (index >= 0) {
    	index+=1;
        if (index === this.lines.length) {
            index = 0;
        }
        return this.lines[index];
    } else {
        console.error('Corner#getNextLine: line not found. it is');
        console.log(line);
        console.log(this.lines);
    }
};

/**
 * make polygons
 * a polygon for each line whose path going out from this circle has not been done
 * @method Corner.makePolygons
 */
Corner.prototype.makePolygons = function() {
    const length = this.lines.length;
    console.log('do polygo');
    for (var i = 0; i < length; i++) {
        console.log('walking',this.x,this.y);
        let lineOut = this.lines[i];
        // go, if we have not already gone along the line
        if (!lineOut.getPathDone(this)) {
            lineOut.setPathDone(this);
            let nextCorner = lineOut.getOtherCorner(this);
            // stepping around, until going back
            while (nextCorner !== this) {
            // go to the new corner, examine its lines
                let corner = nextCorner;
                let lineIn = lineOut;
                // get the next outgoing line from the current corner
                lineOut = corner.getNextLine(lineIn);
                // do not go along this line more than once in the same direction
                if (lineOut.getPathDone(corner)) {
                    console.error('Corner#makePolygon: repeating outgoing path on line');
                    console.log(lineOut);
                    console.log(corner);
                    break;
                }
                // walk along the lineOut
                console.log('step',corner.x,corner.y);
                lineOut.setPathDone(corner);
                nextCorner = lineOut.getOtherCorner(corner);
            }
        }
    }

};

Corner.lineWidth = 3;
Corner.color = '#00ffff';
Corner.drawRadius = 8;

/**
 * draw the corner as a circle
 * @method Corner#draw
 */
Corner.prototype.draw = function() {
    const context = output.canvasContext;
    output.setLineWidth(Corner.lineWidth);
    context.strokeStyle = Corner.color;
    context.beginPath();
    context.arc(this.x, this.y, Corner.drawRadius * output.coordinateTransform.totalScale, 0, 2 * Math.PI);
    context.stroke();
};