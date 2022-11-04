/* jshint esversion: 6 */

import {
    SVG
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
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    const dx2 = -size * this.line2.sinAlpha;
    const dy2 = size * this.line2.cosAlpha;
    const scale = main.scale;
    const extraArgs = {};
    if (main.fill) {
        extraArgs.fill = color[this.colorIndex];
    }
    const corners = [scale * (this.x + dx1 + dx2), scale * (this.y + dy1 + dy2)];
    corners.push(scale * (this.x + dx1 - dx2), scale * (this.y + dy1 - dy2));
    corners.push(scale * (this.x - dx1 - dx2), scale * (this.y - dy1 - dy2));
    corners.push(scale * (this.x - dx1 + dx2), scale * (this.y - dy1 + dy2));
    SVG.createPolygon(corners, extraArgs);
};

Intersection.prototype.drawBentLines = function() {
    let size = 0.5 * main.rhombusSize;
    const dx1 = -size * this.line1.sinAlpha;
    const dy1 = size * this.line1.cosAlpha;
    const dx2 = -size * this.line2.sinAlpha;
    const dy2 = size * this.line2.cosAlpha;
    const scale = main.scale;
    SVG.createPolyline([scale * (this.x + dx2), scale * (this.y + dy2), scale * (this.x - dx2), scale * (this.y - dy2)]);
    SVG.createPolyline([scale * (this.x + dx1), scale * (this.y + dy1), scale * (this.x - dx1), scale * (this.y - dy1)]);
};

function drawArc(x, y, dx1, dy1, dx2, dy2) {
    const scale = main.scale;
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
    SVG.createArcStroke(scale * x, scale * y, 0.5 * scale * main.rhombusSize, alpha, beta, true);
}

function fillArc(x, y, dx1, dy1, dx2, dy2, fillStyle) {
    const scale = main.scale;
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
    SVG.createArcFill(scale * x, scale * y, 0.5 * scale * main.rhombusSize, alpha, beta, true, {
        fill: fillStyle,
        stroke: fillStyle
    });
}

Intersection.prototype.drawLinesTruchet = function() {
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
    if (Math.abs(prod) < epsilon) {
        const scale = main.scale;
        SVG.createPolyline([scale * (this.x + dx1), scale * (this.y + dy1), scale * (this.x - dx1), scale * (this.y - dy1)]);
        SVG.createPolyline([scale * (this.x + dx2), scale * (this.y + dy2), scale * (this.x - dx2), scale * (this.y - dy2)]);
    } else {
        drawArc(this.x - dx1 - dx2, this.y - dy1 - dy2, dx1, dy1, dx2, dy2);
        drawArc(this.x + dx1 + dx2, this.y + dy1 + dy2, -dx1, -dy1, -dx2, -dy2);
    }
};

Intersection.prototype.fillForegroundTruchet = function() {
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
    const fillStyle = lineColor[1 - this.arcBackground];
    if (Math.abs(prod) < epsilon) {
        const scale = main.scale;
        let points = [scale * this.x, scale * this.y];
        points.push(scale * (this.x + dx1), scale * (this.y + dy1));
        points.push(scale * (this.x + dx1 + dx2), scale * (this.y + dy1 + dy2));
        points.push(scale * (this.x + dx2), scale * (this.y + dy2));
        SVG.createPolygon(points, {
            fill: fillStyle,
            stroke: fillStyle
        });
        points = [scale * this.x, scale * this.y];
        points.push(scale * (this.x - dx1), scale * (this.y - dy1));
        points.push(scale * (this.x - dx1 - dx2), scale * (this.y - dy1 - dy2));
        points.push(scale * (this.x - dx2), scale * (this.y - dy2));
        SVG.createPolygon(points, {
            fill: fillStyle,
            stroke: fillStyle
        });
    } else {
        fillArc(this.x - dx1 - dx2, this.y - dy1 - dy2, dx1, dy1, dx2, dy2, fillStyle);
        fillArc(this.x + dx1 + dx2, this.y + dy1 + dy2, -dx1, -dy1, -dx2, -dy2, fillStyle);
    }
};

// background: fill entire rhombus

Intersection.prototype.fillBackgroundTruchet = function() {
    const scale = main.scale;
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
    const fillStyle = lineColor[this.arcBackground];
    const points = [scale * (this.x + dx1 + dx2), scale * (this.y + dy1 + dy2)];
    points.push(scale * (this.x + dx1 - dx2), scale * (this.y + dy1 - dy2));
    points.push(scale * (this.x - dx1 - dx2), scale * (this.y - dy1 - dy2));
    points.push(scale * (this.x - dx1 + dx2), scale * (this.y - dy1 + dy2));
    SVG.createPolygon(points, {
        fill: fillStyle
    });
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