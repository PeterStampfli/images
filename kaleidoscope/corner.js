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
