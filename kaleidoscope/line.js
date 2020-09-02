/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    circles
} from './modules.js';

/**
 * line for the polygons
 * separating different regions, making a network
 * @constructor Line
 * @param {Corner} corner1
 * @param {Corner} corner2
 */
export function Line(corner1, corner2) {
    this.corner1 = corner1;
    this.corner2 = corner2;
}



Line.lineWidth = 3;
Line.color = '#0000ff';

/**
 * draw the line
 * @method Line#draw
 */
Line.prototype.draw = function() {
    const context = output.canvasContext;
    output.setLineWidth(Line.lineWidth);
    context.strokeStyle = Line.color;
    context.beginPath();
    context.moveTo(this.corner1.x, this.corner1.y);
    console.log(this.corner1.x, this.corner1.y);
    context.lineTo(this.corner2.x, this.corner2.y);
    console.log(this.corner2.x, this.corner2.y);
    context.stroke();
};