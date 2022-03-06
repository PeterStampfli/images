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
    this.intersections=[];
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
Line.prototype.addIntersection=function(line){
this.intersections.push(new Intersection(this,line));
};

Line.prototype.addIntersections=function(parallelLines){
parallelLines.lines.forEach(line=>this.addIntersection(line));
};

