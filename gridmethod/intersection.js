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
    this.oneOnTop = false;
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
    if (main.drawIntersections) {
        canvasContext.stroke();
    }
    if (main.drawBentLines) {
        canvasContext.beginPath();
        canvasContext.moveTo(this.x + dx1, this.y + dy1);
        canvasContext.lineTo(this.x - dx1, this.y - dy1);
        output.setLineWidth(main.lineWidth);
        canvasContext.strokeStyle = lineColor[this.line2.number];
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.moveTo(this.x + dx2, this.y + dy2);
        canvasContext.lineTo(this.x - dx2, this.y - dy2);
        canvasContext.strokeStyle = lineColor[this.line1.number];
        output.setLineWidth(main.lineWidth);
        canvasContext.stroke();
    }
};

Intersection.prototype.drawBentBottomBackground = function() {
    var line, color;
    if (this.oneOnTop) {
        line = this.line2;
        color = lineColor[this.line1.number];
    } else {
        line = this.line1;
        color = lineColor[this.line2.number];
    }
    const canvasContext = output.canvasContext;
    output.setLineWidth(main.lineWidth + 2 * main.lineBorderWidth);
    canvasContext.strokeStyle = main.lineBorderColor;
    canvasContext.stroke();
    const size = main.rhombusSize * 0.5;
    const dx = -size * line.sinAlpha;
    const dy = size * line.cosAlpha;
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx, this.y + dy);
    canvasContext.lineTo(this.x - dx, this.y - dy);
    canvasContext.stroke();
};

Intersection.prototype.drawBentBottomColor = function() {
    var line, color;
    if (this.oneOnTop) {
        line = this.line2;
        color = lineColor[this.line1.number];
    } else {
        line = this.line1;
        color = lineColor[this.line2.number];
    }
    const canvasContext = output.canvasContext;
    output.setLineWidth(main.lineWidth);
    canvasContext.strokeStyle = color;
    canvasContext.stroke();
    const size = main.rhombusSize * 0.5;
    const dx = -size * line.sinAlpha;
    const dy = size * line.cosAlpha;
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx, this.y + dy);
    canvasContext.lineTo(this.x - dx, this.y - dy);
    canvasContext.stroke();
};

Intersection.prototype.drawBentTopBackground = function() {
    var line, color;
    if (!this.oneOnTop) {
        line = this.line2;
        color = lineColor[this.line1.number];
    } else {
        line = this.line1;
        color = lineColor[this.line2.number];
    }
    const canvasContext = output.canvasContext;
    output.setLineWidth(main.lineWidth + 2 * main.lineBorderWidth);
    canvasContext.strokeStyle = main.lineBorderColor;
    canvasContext.stroke();
    const size = main.rhombusSize * 0.5;
    const dx = -size * line.sinAlpha;
    const dy = size * line.cosAlpha;
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx, this.y + dy);
    canvasContext.lineTo(this.x - dx, this.y - dy);
    canvasContext.stroke();
};

Intersection.prototype.drawBentTopColor = function() {
    var line, color;
    if (!this.oneOnTop) {
        line = this.line2;
        color = lineColor[this.line1.number];
    } else {
        line = this.line1;
        color = lineColor[this.line2.number];
    }
    const canvasContext = output.canvasContext;
    output.setLineWidth(main.lineWidth);
    canvasContext.strokeStyle = color;
    canvasContext.stroke();
    const size = main.rhombusSize * 0.5;
    const dx = -size * line.sinAlpha;
    const dy = size * line.cosAlpha;
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx, this.y + dy);
    canvasContext.lineTo(this.x - dx, this.y - dy);
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

// for weaving
// is given line on top?
// either 1 or 2
Intersection.prototype.isOnTop = function(line) {
    if (this.line1 === line) {
        return this.oneOnTop;
    } else {
        return !this.oneOnTop;
    }
};

// set that given line is (not) on top
Intersection.prototype.setOnTop = function(line, onTop) {
    if (this.line1 === line) {
        this.oneOnTop = onTop;
    } else {
        this.oneOnTop = !onTop;
    }
};