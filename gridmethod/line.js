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

// check if a given distance (vector) goes forward along the line
// depends on its direction!!
Line.prototype.forward = function(dx, dy) {
    return (this.cosAlpha * dx + this.sinAlpha * dy) > 0;
};

Line.prototype.sortIntersections = function() {
    const thisLine = this;
    this.intersections.sort((first, second) => thisLine.forward(first.x - second.x, first.y - second.y));
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
Line.prototype.indexAdjustedIntersection = function() {
    return this.intersections.findIndex(intersection => intersection.adjusted);
};

Line.prototype.adjust = function() {
    const foundAdjustedIndex = this.indexAdjustedIntersection();
    console.log(foundAdjustedIndex);
    console.log(this)
    const foundAdjustedIntersection = this.intersections[foundAdjustedIndex];
    const foundAdjustedSide = foundAdjustedIntersection.getRhombusSide(this);
    let lastSide = foundAdjustedSide;
    let lastCenterX = foundAdjustedIntersection.x;
    let lastCenterY = foundAdjustedIntersection.y;
    for (let i = foundAdjustedIndex; i >= 0; i--) {
        const intersectionI = this.intersections[i];
        let newSide = intersectionI.getRhombusSide(this);
        let newCenterX = lastCenterX - 0.5 * (lastSide[0] + newSide[0]);
        let newCenterY = lastCenterY - 0.5 * (lastSide[1] + newSide[1]);
        intersectionI.set(newCenterX, newCenterY);
        lastSide = newSide;
        lastCenterX = newCenterX;
        lastCenterY = newCenterY;
    }
     lastSide = foundAdjustedSide;
     lastCenterX = foundAdjustedIntersection.x;
     lastCenterY = foundAdjustedIntersection.y; 
       const length=this.intersections.length;
        for (let i = foundAdjustedIndex+1; i <length; i++) {
        const intersectionI = this.intersections[i];
        let newSide = intersectionI.getRhombusSide(this);
        let newCenterX = lastCenterX + 0.5 * (lastSide[0] + newSide[0]);
        let newCenterY = lastCenterY + 0.5 * (lastSide[1] + newSide[1]);
        intersectionI.set(newCenterX, newCenterY);
        lastSide = newSide;
        lastCenterX = newCenterX;
        lastCenterY = newCenterY;
    }
};