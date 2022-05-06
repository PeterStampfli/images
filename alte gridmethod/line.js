/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    Intersection
} from "./intersection.js";

import {
    main,
    lineColor
} from "./gridmethod.js";

const epsilon = 0.0001;

/*
 * gridline
 * inclination angle is alpha
 * distance from origin is d
 */

export const Line = function(alpha, d, number) {
    this.alpha = alpha;
    this.cosAlpha = Math.cos(alpha);
    this.sinAlpha = Math.sin(alpha);
    this.d = d;
    this.intersections = [];
    this.number = number;
};

Line.displayRadius = 1000;

Line.prototype.draw = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = lineColor[this.number];
    canvasContext.beginPath();
    canvasContext.moveTo(Line.displayRadius * this.cosAlpha - this.d * this.sinAlpha, Line.displayRadius * this.sinAlpha + this.d * this.cosAlpha);
    canvasContext.lineTo(-Line.displayRadius * this.cosAlpha - this.d * this.sinAlpha, -Line.displayRadius * this.sinAlpha + this.d * this.cosAlpha);
    output.setLineWidth(main.lineWidth + 2 * main.lineBorderWidth);
    canvasContext.strokeStyle = main.lineBorderColor;
    canvasContext.stroke();
    output.setLineWidth(main.lineWidth);
    canvasContext.strokeStyle = lineColor[this.number];
    canvasContext.stroke();
};

Line.prototype.addIntersections = function(parallelLines) {
    parallelLines.lines.forEach(otherLine => {
        const intersection = new Intersection(this, otherLine);
        this.intersections.push(intersection);
        otherLine.intersections.push(intersection);
    });
};

Line.prototype.drawIntersections = function() {
    this.intersections.forEach(intersection => intersection.draw());
};

Line.prototype.drawBentLines = function() {
    this.intersections.forEach(intersection => intersection.drawBentLines());
};

Line.prototype.drawLinesTruchet = function() {
    this.intersections.forEach(intersection => intersection.drawLinesTruchet());
};

Line.prototype.fillBackgroundTruchet = function() {
    this.intersections.forEach(intersection => intersection.fillBackgroundTruchet());
};

Line.prototype.fillForegroundTruchet = function() {
    this.intersections.forEach(intersection => intersection.fillForegroundTruchet());
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

// orientation of a rhombus, relative to this line, up>0, down<0
Line.prototype.orientation = function(intersection) {
    const otherLine = intersection.otherLine(this);
    let scalarProduct = this.cosAlpha * otherLine.cosAlpha + this.sinAlpha * otherLine.sinAlpha;
    const vectorProduct = this.cosAlpha * otherLine.sinAlpha - this.sinAlpha * otherLine.cosAlpha;
    if (Math.abs(scalarProduct) < epsilon) {
        scalarProduct = 1;
    }
    return scalarProduct * vectorProduct;
};

Line.prototype.adjust = function() {
    // search for the first placed (adjusted position) intersection (rhombi)
    // and get its info
    const foundAdjustedIndex = this.indexAdjustedIntersection();
    const foundAdjustedIntersection = this.intersections[foundAdjustedIndex];
    const foundAdjustedSide = foundAdjustedIntersection.getRhombusSide(this);
    // for getting crossings correct
    const foundLineOnTop = foundAdjustedIntersection.isOnTop(this);
    // for truchet colors
    const foundOrientation = this.orientation(foundAdjustedIntersection);
    const foundArcBackground = foundAdjustedIntersection.arcBackground;
    // adjust all intersections (rhombi) with lower index
    let lastSide = foundAdjustedSide;
    let lastCenterX = foundAdjustedIntersection.x;
    let lastCenterY = foundAdjustedIntersection.y;
    let lineOnTop = foundLineOnTop;
    let lastOrientation = foundOrientation;
    let lastArcBackground = foundArcBackground;
    for (let i = foundAdjustedIndex - 1; i >= 0; i--) {
        const intersectionI = this.intersections[i];
        // adjust position
        let newSide = intersectionI.getRhombusSide(this);
        let newCenterX = lastCenterX - 0.5 * (lastSide[0] + newSide[0]);
        let newCenterY = lastCenterY - 0.5 * (lastSide[1] + newSide[1]);
        intersectionI.set(newCenterX, newCenterY);
        // adjust weave
        lineOnTop = !lineOnTop;
        intersectionI.setOnTop(this, lineOnTop);
        // adjust truchet coloring
        let newOrientation = this.orientation(intersectionI);
        let newArcBackground = lastArcBackground;
        // for same orienation switch background color 0 <-> 1
        if (lastOrientation * newOrientation > 0) {
            newArcBackground = 1 - newArcBackground;
        }
        intersectionI.arcBackground = newArcBackground;
        lastOrientation = newOrientation;
        lastArcBackground = newArcBackground;
        lastSide = newSide;
        lastCenterX = newCenterX;
        lastCenterY = newCenterY;
    }
    // adjust all intersections (rhombi) with higher index
    lastSide = foundAdjustedSide;
    lastCenterX = foundAdjustedIntersection.x;
    lastCenterY = foundAdjustedIntersection.y;
    lineOnTop = foundLineOnTop;
    lastOrientation = foundOrientation;
    lastArcBackground = foundArcBackground;
    const length = this.intersections.length;
    for (let i = foundAdjustedIndex + 1; i < length; i++) {
        const intersectionI = this.intersections[i];
        // adjust position
        let newSide = intersectionI.getRhombusSide(this);
        let newCenterX = lastCenterX + 0.5 * (lastSide[0] + newSide[0]);
        let newCenterY = lastCenterY + 0.5 * (lastSide[1] + newSide[1]);
        intersectionI.set(newCenterX, newCenterY);
        // adjust weave
        lineOnTop = !lineOnTop;
        intersectionI.setOnTop(this, lineOnTop);
        // adjust truchet coloring
        let newOrientation = this.orientation(intersectionI);
        let newArcBackground = lastArcBackground;
        // for same orientation switch background color 0 <-> 1
        if (lastOrientation * newOrientation > 0) {
            newArcBackground = 1 - newArcBackground;
        }
        intersectionI.arcBackground = newArcBackground;
        lastOrientation = newOrientation;
        lastArcBackground = newArcBackground;
        lastSide = newSide;
        lastCenterX = newCenterX;
        lastCenterY = newCenterY;
    }
};