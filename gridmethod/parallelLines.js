/* jshint esversion: 6 */

import {
    Line
} from "./line.js";

/**
 * having many parallel lines
 */

export const ParallelLines = function() {
    this.lines = [];
};

ParallelLines.prototype.addLine = function(alpha, d) {
    this.lines.push(new Line(alpha, d));
};

ParallelLines.prototype.draw = function() {
    this.lines.forEach(line => line.draw());
};

ParallelLines.prototype.drawIntersections = function() {
    this.lines.forEach(line => line.drawIntersections());
};

// symmetric set of lines, unit distance
ParallelLines.createSymmetricBundle = function(alpha, n) {
    const lines = new ParallelLines();
    for (let i = 0; i < n; i++) {
        lines.addLine(alpha, 0.5 + i);
        lines.addLine(alpha, -0.5 - i);
    }
    return lines;
};

// make intersections with other set of lines, not parallel to this one
ParallelLines.prototype.makeIntersections = function(lines) {
    this.lines.forEach(line => line.addIntersections(lines));
};

ParallelLines.prototype.sortIntersections = function() {
    this.lines.forEach(line => line.sortIntersections());
};

ParallelLines.prototype.sumIntersectionsX = function() {
    let sum = 0;
    this.lines.forEach(line => sum += line.sumIntersectionsX());
    return sum;
};

ParallelLines.prototype.sumIntersectionsY = function() {
    let sum = 0;
    this.lines.forEach(line => sum += line.sumIntersectionsY());
    return sum;
};

ParallelLines.prototype.numberOfIntersections = function() {
    let sum = 0;
    this.lines.forEach(line => sum += line.intersections.length);
    return sum;
};

ParallelLines.prototype.shiftIntersections = function(dx,dy) {
    this.lines.forEach(line => line.shiftIntersections(dx,dy));
};

ParallelLines.prototype.adjust = function() {
    this.lines.forEach(line => line.adjust());
};