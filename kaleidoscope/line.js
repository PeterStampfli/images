/* jshint esversion: 6 */

import {
    output,
    map
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
    this.angle = Math.atan2(corner2.y - corner1.y, corner2.x - corner1.x) + Math.PI;
    // check if the line going out from corners is done
    this.pathFrom1Done = false;
    this.pathFrom2Done = false;
    // add to the endpoint's array of lines
    corner1.addLine(this);
    corner2.addLine(this);
}

/**
 * get the angle of the line going out from given corner
 * @method Line.getAngle
 * @param {Corner} corner
 * @result number, angle going from given corner to the other corner, 0..2pi
 */
Line.prototype.getAngle = function(corner) {
    if (corner === this.corner1) {
        return this.angle;
    } else if (corner === this.corner2) {
        return (this.angle > Math.PI) ? this.angle - Math.PI : this.angle + Math.PI;
    } else {
        console.error('Line#getAngle: corner is not one of the line ends. It is');
        console.log(corner);
        console.log('line ends', this.corner1, this.corner2);
    }
};

/**
 * get the other corner connected to the given corner
 * @method Line.getOtherCorner
 * @param {Corner} corner
 * @result corner, at the other end of the line
 */
Line.prototype.getOtherCorner = function(corner) {
    if (corner === this.corner1) {
        return this.corner2;
    } else if (corner === this.corner2) {
        return this.corner1;
    } else {
        console.error('Line#getOtherCorner');
        console.log(corner);
        console.log('line ends', this.corner1, this.corner2);
    }
};

/**
 * get if the outgoing path from given corner has been done
 * @method Line.getPathDone
 * @param {Corner} corner
 * @result boolean, true if path has been done
 */
Line.prototype.getPathDone = function(corner) {
    if (corner === this.corner1) {
        return this.pathFrom1Done;
    } else if (corner === this.corner2) {
        return this.pathFrom2Done;
    } else {
        console.error('Line#getPathDone: corner is not one of the line ends. It is');
        console.log(corner);
        console.log('line ends', this.corner1, this.corner2);
    }
};

/**
 * set that the outgoing path from given corner has been done
 * @method Line.setPathDone
 * @param {Corner} corner
 */
Line.prototype.setPathDone = function(corner) {
    if (corner === this.corner1) {
        this.pathFrom1Done = true;
    } else if (corner === this.corner2) {
        this.pathFrom2Done = true;
    } else {
        console.error('Line#pathDone: corner is not one of the line ends. It is');
        console.log(corner);
        console.log('line ends', this.corner1, this.corner2);
    }
};

Line.color = '#0000ff';

/**
 * draw the line
 * @method Line#draw
 */
Line.prototype.draw = function() {
    const context = output.canvasContext;
    output.setLineWidth(map.linewidth);
    context.lineCap = 'round';
    context.strokeStyle = Line.color;
    context.beginPath();
    context.moveTo(this.corner1.x, this.corner1.y);
    context.lineTo(this.corner2.x, this.corner2.y);
    context.stroke();
};