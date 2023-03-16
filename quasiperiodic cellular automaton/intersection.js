/* jshint esversion: 6 */

import {
    SVG
} from "../libgui/modules.js";

import {
    main,
    color
} from "./gridmethod.js";

import {
    grid
} from "./grid.js";

import {
    automaton
} from "./automaton.js";

const epsilon = 0.0001;

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
    const dx1 = -0.5 * this.line1.sinAlpha;
    const dy1 = 0.5 * this.line1.cosAlpha;
    const dx2 = -0.5 * this.line2.sinAlpha;
    const dy2 = 0.5 * this.line2.cosAlpha;
    const scale = main.scale;
    const corners = [scale * (this.x + dx1 + dx2), scale * (this.y + dy1 + dy2)];
    corners.push(scale * (this.x + dx1 - dx2), scale * (this.y + dy1 - dy2));
    corners.push(scale * (this.x - dx1 - dx2), scale * (this.y - dy1 - dy2));
    corners.push(scale * (this.x - dx1 + dx2), scale * (this.y - dy1 + dy2));
    SVG.createPolygon(corners);
};

Intersection.prototype.setupAutomaton = function() {
    const dx1 = -0.5 * this.line1.sinAlpha;
    const dy1 = 0.5 * this.line1.cosAlpha;
    const dx2 = -0.5 * this.line2.sinAlpha;
    const dy2 = 0.5 * this.line2.cosAlpha;
    const corners = [this.x + dx1 + dx2, this.y + dy1 + dy2];
    corners.push(this.x + dx1 - dx2, this.y + dy1 - dy2);
    corners.push(this.x - dx1 - dx2, this.y - dy1 - dy2);
    corners.push(this.x - dx1 + dx2, this.y - dy1 + dy2);
    automaton.addDualCell(corners);
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
    let dx = -otherLine.sinAlpha;
    let dy =  otherLine.cosAlpha;
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