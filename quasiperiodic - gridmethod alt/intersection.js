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

const epsilon = 0.0001;

/**
 * intersection between two grid lines
 * line1 & line2
 */

export const Intersection = function(line1, line2) {
    this.line1 = line1;
    this.line2 = line2;
    this.oneOnTop = false;
    this.arcBackground = 0;
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
    let size = 0.5 * main.rhombusSize;
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
};

Intersection.prototype.drawBentLine1 = function() {
    output.setLineWidth(main.rhombusLineWidth);
    const canvasContext = output.canvasContext;
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    const dx2 = -size * this.line2.sinAlpha;
    const dy2 = size * this.line2.cosAlpha;
    size = 0.5 * main.lineWidth * output.coordinateTransform.totalScale;
    const bx1 = -size * this.line1.sinAlpha;
    const by1 = size * this.line1.cosAlpha;
    const bx2 = -size * this.line2.sinAlpha;
    const by2 = size * this.line2.cosAlpha;
    canvasContext.strokeStyle = main.lineBorderColor;
    output.setLineWidth(main.lineBorderWidth);
    canvasContext.fillStyle = lineColor[this.line1.number];
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx2 + bx1, this.y + dy2 + by1);
    canvasContext.lineTo(this.x - dx2 + bx1, this.y - dy2 + by1);
    canvasContext.lineTo(this.x - dx2 - bx1, this.y - dy2 - by1);
    canvasContext.lineTo(this.x + dx2 - bx1, this.y + dy2 - by1);
    canvasContext.fill();
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx2 + bx1, this.y + dy2 + by1);
    canvasContext.lineTo(this.x - dx2 + bx1, this.y - dy2 + by1);
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx2 - bx1, this.y + dy2 - by1);
    canvasContext.lineTo(this.x - dx2 - bx1, this.y - dy2 - by1);
    canvasContext.stroke();
};

Intersection.prototype.drawBentLine2 = function() {
    output.setLineWidth(main.rhombusLineWidth);
    const canvasContext = output.canvasContext;
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    const dx2 = -size * this.line2.sinAlpha;
    const dy2 = size * this.line2.cosAlpha;
    size = 0.5 * main.lineWidth * output.coordinateTransform.totalScale;
    const bx1 = -size * this.line1.sinAlpha;
    const by1 = size * this.line1.cosAlpha;
    const bx2 = -size * this.line2.sinAlpha;
    const by2 = size * this.line2.cosAlpha;
    canvasContext.strokeStyle = main.lineBorderColor;
    output.setLineWidth(main.lineBorderWidth);
    canvasContext.fillStyle = lineColor[this.line2.number];
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx1 + bx2, this.y + dy1 + by2);
    canvasContext.lineTo(this.x - dx1 + bx2, this.y - dy1 + by2);
    canvasContext.lineTo(this.x - dx1 - bx2, this.y - dy1 - by2);
    canvasContext.lineTo(this.x + dx1 - bx2, this.y + dy1 - by2);
    canvasContext.fill();
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx1 + bx2, this.y + dy1 + by2);
    canvasContext.lineTo(this.x - dx1 + bx2, this.y - dy1 + by2);
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx1 - bx2, this.y + dy1 - by2);
    canvasContext.lineTo(this.x - dx1 - bx2, this.y - dy1 - by2);
    canvasContext.stroke();
};

Intersection.prototype.drawBentLines = function() {
    if (this.oneOnTop) {
        this.drawBentLine2();
        this.drawBentLine1();
    } else {
        this.drawBentLine1();
        this.drawBentLine2();
    }
};

function drawArc(x, y, dx1, dy1, dx2, dy2) {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = main.lineBorderColor;
    let alpha = Math.atan2(dy1, dx1);
    let beta = Math.atan2(dy2, dx2);
    if (alpha > beta) {
        let h = alpha;
        alpha = beta;
        beta = h;
    }
    if (beta - alpha > Math.PI) {
        let h = alpha;
        alpha = beta;
        beta = h + 2 * Math.PI;
    }
    canvasContext.beginPath();
    canvasContext.arc(x, y, 0.5 * main.rhombusSize, alpha, beta);
    canvasContext.stroke();
}

function fillArc(x, y, dx1, dy1, dx2, dy2) {
    const canvasContext = output.canvasContext;
    let alpha = Math.atan2(dy1, dx1);
    let beta = Math.atan2(dy2, dx2);
    if (alpha > beta) {
        let h = alpha;
        alpha = beta;
        beta = h;
    }
    if (beta - alpha > Math.PI) {
        let h = alpha;
        alpha = beta;
        beta = h + 2 * Math.PI;
    }
    canvasContext.beginPath();
    canvasContext.moveTo(x, y);
    canvasContext.arc(x, y, 0.5 * main.rhombusSize, alpha, beta);
    canvasContext.closePath();
    canvasContext.stroke();
    canvasContext.fill();

        canvasContext.beginPath();
    canvasContext.moveTo(x+dx1, y+dy1);
    canvasContext.lineTo(x, y);
    canvasContext.lineTo(x+dx2, y+dy2);
    canvasContext.stroke();
}

Intersection.prototype.drawLinesTruchet = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = main.lineBorderColor;
    output.setLineWidth(main.lineWidth);
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    let dx2 = -size * this.line2.sinAlpha;
    let dy2 = size * this.line2.cosAlpha;
    const prod = dx1 * dx2 + dy1 * dy2;
    if (prod < -epsilon) {
        dx2 = -dx2;
        dy2 = -dy2;
    }
    output.setLineWidth(main.lineWidth);
    canvasContext.strokeStyle = main.lineBorderColor;
    if (Math.abs(prod) < epsilon) {
        canvasContext.beginPath();
        canvasContext.moveTo(this.x + dx1, this.y + dy1);
        canvasContext.lineTo(this.x - dx1, this.y - dy1);
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.moveTo(this.x + dx2, this.y + dy2);
        canvasContext.lineTo(this.x - dx2, this.y - dy2);
        canvasContext.stroke();
    } else {
        drawArc(this.x - dx1 - dx2, this.y - dy1 - dy2, dx1, dy1, dx2, dy2);
        drawArc(this.x + dx1 + dx2, this.y + dy1 + dy2, -dx1, -dy1, -dx2, -dy2);
    }
};

Intersection.prototype.fillForegroundTruchet = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = main.lineBorderColor;
    output.setLineWidth(main.overprint);
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    let dx2 = -size * this.line2.sinAlpha;
    let dy2 = size * this.line2.cosAlpha;
    const prod = dx1 * dx2 + dy1 * dy2;
    if (prod < -epsilon) {
        dx2 = -dx2;
        dy2 = -dy2;
    }
    canvasContext.fillStyle = lineColor[1 - this.arcBackground];
    canvasContext.strokeStyle = lineColor[1 - this.arcBackground];
    if (Math.abs(prod) < epsilon) {
        canvasContext.beginPath();
        canvasContext.moveTo(this.x, this.y);
        canvasContext.lineTo(this.x + dx1, this.y + dy1);
        canvasContext.lineTo(this.x + dx1 + dx2, this.y + dy1 + dy2);
        canvasContext.lineTo(this.x + dx2, this.y + dy2);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.moveTo(this.x, this.y);
        canvasContext.lineTo(this.x - dx1, this.y - dy1);
        canvasContext.lineTo(this.x - dx1 - dx2, this.y - dy1 - dy2);
        canvasContext.lineTo(this.x - dx2, this.y - dy2);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
    } else {
        fillArc(this.x - dx1 - dx2, this.y - dy1 - dy2, dx1, dy1, dx2, dy2);
        fillArc(this.x + dx1 + dx2, this.y + dy1 + dy2, -dx1, -dy1, -dx2, -dy2);
    }
};

Intersection.prototype.fillBackgroundTruchet = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = main.lineBorderColor;
    output.setLineWidth(main.lineWidth);
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    let dx2 = -size * this.line2.sinAlpha;
    let dy2 = size * this.line2.cosAlpha;
    const prod = dx1 * dx2 + dy1 * dy2;
    if (prod < -epsilon) {
        dx2 = -dx2;
        dy2 = -dy2;
    }
    // background
    canvasContext.fillStyle = lineColor[this.arcBackground];
    canvasContext.strokeStyle = lineColor[this.arcBackground];
    output.setLineWidth(main.overprint);
    canvasContext.beginPath();
    canvasContext.moveTo(this.x + dx1 + dx2, this.y + dy1 + dy2);
    canvasContext.lineTo(this.x + dx1 - dx2, this.y + dy1 - dy2);
    canvasContext.lineTo(this.x - dx1 - dx2, this.y - dy1 - dy2);
    canvasContext.lineTo(this.x - dx1 + dx2, this.y - dy1 + dy2);
    canvasContext.closePath();
    canvasContext.fill();
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