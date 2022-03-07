/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

/**
 * intersection between two grid lines
 * line1 & line2
 */

export const Intersection = function(line1, line2) {
    this.line1 = line1;
    this.line2 = line2;
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

Intersection.size = 0.1;
Intersection.notAdjustedColor = '#ff0000';
Intersection.adjustedColor = '#00ff00';
Intersection.lineWidth = 1;

Intersection.prototype.draw = function() {
    output.setLineWidth(Intersection.width);
    const canvasContext = output.canvasContext;
    const size = Intersection.size * 0.5;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    const dx2 = -size * this.line2.sinAlpha;
    const dy2 = size * this.line2.cosAlpha;
    if (this.adjusted) {
        canvasContext.strokeStyle = Intersection.adjustedColor;
    } else {
        canvasContext.strokeStyle = Intersection.notAdjustedColor;
    }
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx1 + dx2, this.y + dy1 + dy2);
    canvasContext.lineTo(this.x + dx1 - dx2, this.y + dy1 - dy2);
    canvasContext.lineTo(this.x - dx1 - dx2, this.y - dy1 - dy2);
    canvasContext.lineTo(this.x - dx1 + dx2, this.y - dy1 + dy2);
    canvasContext.closePath();
    canvasContext.stroke();
};

// dualization
Intersection.prototype.otherLine = function(line) {
    if (line === this.line1) {
        return this.line2;
    } else {
        return this.line1;
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