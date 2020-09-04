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
    // angle going from corner1 to corner2
    this.angle = Math.atan2(corner2.y - corner1.y, corner2.x - corner1.x);
    // add to the endpoint's array of lines
    corner1.addLine(this);
    corner2.addLine(this);
}

/**
 * for building polygons: Make that the line goes out from given corner
 * @method Line.setCorner1
 * @param {Corner} corner
 */
Line.prototype.setCorner1 = function(corner) {
    if (corner === this.corner2) {
        // exchange corner points if it is the second corner
        this.corner2 = this.corner1;
        this.corner1 = corner;
        //invert direction: add pi
        this.angle += Math.PI;
        // if larger than pi subtract 2pi to keep it in range -pi ... pi
        if (this.angle > Math.PI) {
            this.angle -= 2 * Math.PI;
        }
    } else if (corner !== this.corner1) {
        console.error('Line#setCorner1: corner is not one of the line ends. It is');
        console.log(corner);
        console.log('line ends', this.corner1, this.corner2);
    }
};

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
    context.lineTo(this.corner2.x, this.corner2.y);
    context.stroke();
};