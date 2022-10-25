/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

export function Circles(){
	this.circles=[];
}

Circles.prototype.add=function(circle){
	this.circles.push(circle);
};

Circles.prototype.clear=function(){
	this.circles.length=0;
};

// the stereographic projection in the xxy plane
Circles.prototype.drawStereographic=function(){
	this.circles.forEach(circle=>circle.drawStereographic());
};

Circles.prototype.createFromTriplett=function(i,j,k){
	return Circle.createFromTriplett(this.circles[i],this.circles[j],this.circles[k]);
}

//====================================================================

export function Circle(centerX, centerY, radius, inverted=false) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.radius2 = radius * radius;
    this.inverted=inverted;
}

Circle.prototype.drawStereographic = function() {
    SVG.createCircle(this.centerX, this.centerY, this.radius);
};

// if the circle is not inverted: invert a circle lying outside this circle
// if its center lies inside then return false
// if circle is inverted: invert a circle lying inside

Circle.prototype.invertCircleOutsideIn = function(otherCircle) {
    const dx = otherCircle.centerX - this.centerX;
    const dy = otherCircle.centerY - this.centerY;
    const d2 = dx * dx + dy * dy;
    if (inverted){
 if (d2 > this.radius2) {
        return false;
    }
    } else {
    if (d2 < this.radius2) {
        return false;
    }
}
    const factor = this.radius2 / (d2 - otherCircle.radius2);
    return new Circle(this.centerX + factor * dx, this.centerY + factor * dy, factor * otherCircle.radius);
};

// generating a fourth circle from three touching circles
// circle 2 touches circle1 and circle 3
// intersecting the circles at right angles
Circle.createFromTriplett = function(circle1, circle2, circle3) {
    const cr1 = circle1.centerX * circle1.centerX + circle1.centerY * circle1.centerY - circle1.radius2;
    const cr2 = circle2.centerX * circle2.centerX + circle2.centerY * circle2.centerY - circle2.radius2;
    const cr3 = circle3.centerX * circle3.centerX + circle3.centerY * circle3.centerY - circle3.radius2;
    const r12 = cr1 - cr2;
    const r23 = cr2 - cr3;
    const d12x = circle1.centerX - circle2.centerX;
    const d12y = circle1.centerY - circle2.centerY;
    const d23x = circle2.centerX - circle3.centerX;
    const d23y = circle2.centerY - circle3.centerY;
    const det = 2 * (d12x * d23y - d23x * d12y);
    const centerX = (r12 * d23y - r23 * d12y) / det;
    const centerY = (d12x * r23 - d23x * r12) / det;
    const dx = circle1.centerX - centerX;
    const dy = circle1.centerY - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy - circle1.radius2);
    return new Circle(centerX, centerY, radius);
};