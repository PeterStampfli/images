/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    circles
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
}

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