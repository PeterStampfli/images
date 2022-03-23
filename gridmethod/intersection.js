/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    main,
    color,
    lineColor
} from "./gridmethod.js";

import {
    grid
} from "./grid.js";

/**
 * intersection between two grid lines
 * line1 & line2
 */

export const Intersection = function(line1, line2) {
    this.line1 = line1;
    this.line2 = line2;
    // intersection angle, line angles go from 0 to 2*PI
    let delta = Math.abs(this.line1.alpha - this.line2.alpha);
    // get sharp angle 0 ...  Pi/2
    if (delta > Math.PI) {
        delta -= Math.PI;
    }
    if (delta > 0.5 * Math.PI) {
        delta = Math.PI - delta;
    }
    this.colorIndex = Math.round(delta / grid.dAlpha) % color.length;
    // becomes true, when position adjusted with respect to other intersections/rhombs
    this.adjusted = false;
    const sin1 = line1.sinAlpha;
    const sin2 = line2.sinAlpha;
    const cos1 = line1.cosAlpha;
    const cos2 = line2.cosAlpha;
    const deltaX = sin1 * line1.d - sin2 * line2.d;
    const deltaY = -cos1 * line1.d + cos2 * line2.d;
    const det = sin1 * cos2 - cos1 * sin2;
    const t1 = (deltaY * cos2 - deltaX * sin2) / det;
    this.x = t1 * cos1 - line1.d * sin1;
    this.y = t1 * sin1 + line1.d * cos1;
};

Intersection.prototype.draw = function() {
    output.setLineWidth(main.rhombusLineWidth);
    const canvasContext = output.canvasContext;
    const size = main.rhombusSize * 0.5;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    const dx2 = -size * this.line2.sinAlpha;
    const dy2 = size * this.line2.cosAlpha;
    canvasContext.strokeStyle = main.rhombusColor;
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx1 + dx2, this.y + dy1 + dy2);
    canvasContext.lineTo(this.x + dx1 - dx2, this.y + dy1 - dy2);
    canvasContext.lineTo(this.x - dx1 - dx2, this.y - dy1 - dy2);
    canvasContext.lineTo(this.x - dx1 + dx2, this.y - dy1 + dy2);
    canvasContext.closePath();
    if (main.fill) {
        canvasContext.fillStyle = color[this.colorIndex];
        canvasContext.fill();
    }
    canvasContext.stroke();
    if (main.drawBentLines) {
        output.setLineWidth(main.lineWidth);
        canvasContext.strokeStyle = lineColor[this.line2.number];
        canvasContext.beginPath();
        canvasContext.moveTo(this.x + dx1, this.y + dy1);
        canvasContext.lineTo(this.x - dx1, this.y - dy1);
        canvasContext.stroke();
         canvasContext.strokeStyle = lineColor[this.line1.number];
       canvasContext.beginPath();
        canvasContext.moveTo(this.x + dx2, this.y + dy2);
        canvasContext.lineTo(this.x - dx2, this.y - dy2);
        canvasContext.stroke();
    }
};

// dualization
Intersection.prototype.otherLine = function(line) {
    if (line === this.line1) {
        return this.line2;
    } else {
        return this.line1;
    }
};

// get side of intersection's rhomus, that is not perpedicular to the line
// heading forward
// returns vector as two-component array
Intersection.prototype.getRhombusSide = function(line) {
    const otherLine = this.otherLine(line);
    let dx = -main.rhombusSize * otherLine.sinAlpha;
    let dy = main.rhombusSize * otherLine.cosAlpha;
    if (line.forward(dx, dy)) {
        return [dx, dy];
    } else {
        return [-dx, -dy];
    }
};

Intersection.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    this.adjusted = true;
};

// for centering
Intersection.prototype.shift = function(dx, dy) {
    this.x += dx;
    this.y += dy;
};