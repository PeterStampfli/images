/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    Intersection
} from "./intersection.js";

/*
 * gridline
 * inclination angle is alpha
 * distance from origin is d
 */

export const Line = function(alpha, d) {
    this.cosAlpha = Math.cos(alpha);
    this.sinAlpha = Math.sin(alpha);
    this.d = d;
    this.intersections = [];
};

Line.displayRadius = 2;
Line.color = '#000000';
Line.width = 1;

Line.prototype.draw = function() {
    output.setLineWidth(Line.width);
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = Line.color;
    canvasContext.beginPath();
    canvasContext.moveTo(Line.displayRadius * this.cosAlpha - this.d * this.sinAlpha, Line.displayRadius * this.sinAlpha + this.d * this.cosAlpha);
    canvasContext.lineTo(-Line.displayRadius * this.cosAlpha - this.d * this.sinAlpha, -Line.displayRadius * this.sinAlpha + this.d * this.cosAlpha);
    canvasContext.stroke();
};

// add intersections with bundle of parallel lines
// not parallel to this line
Line.prototype.addIntersection = function(line) {
    this.intersections.push(new Intersection(this, line));
};

Line.prototype.addIntersections = function(parallelLines) {
    parallelLines.lines.forEach(line => this.addIntersection(line));
};

Line.prototype.drawIntersections = function() {
    this.intersections.forEach(intersection => intersection.draw());
};

Line.forward = function(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
        return (dx > 0);
    } else {
        return (dy > 0);
    }
};

Line.prototype.sortIntersections = function() {
    this.intersections.sort((first, second) => Line.forward(first.x - second.x, first.y - second.y));
};

Line.prototype.sumIntersectionsX = function() {
    let sum = 0;
    this.intersections.forEach(intersection => sum += intersection.x);
    return sum;
};

Line.prototype.sumIntersectionsY = function() {
    let sum = 0;
    this.intersections.forEach(intersection => sum += intersection.y);
    return sum;
};

Line.prototype.shiftIntersections = function(dx, dy) {
    this.intersections.forEach(intersection => intersection.shift(dx, dy));
};

// dualization

// get index of first adjusted intersection
Line.prototype.indexAdjustedIntersection=function(){
    return this.intersections.findIndex(intersection=>intersection.adjusted);
}