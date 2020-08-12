/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    circles
} from './modules.js';

// parameters for drawing, change if you do not like it 
Intersection.radius = 15; // for drawing, in pixels
Intersection.selectionRadius = 18; // for selecting, in pixels
Intersection.lineWidth = 2;
Intersection.highlightLineWidth = 6;
Intersection.highlightColor = 'yellow';
Intersection.frozenHighlightColor = '#ffbbbb';
Intersection.maxCorners = 16; // polygons with more corners will be circles

/**
 * intersection between circles, making a definite n-fold dihedral symmetry
 * makes that one of the circles adjusts (selected one preferred)
 * adjust later
 * @constructor Intersection
 * @params {Circle} circle1
 * @params {Circle} circle2
 * @params {integer} n - optional, has to be >=2, default 3
 */
export function Intersection(circle1, circle2, n = 3) {
    this.circle1 = circle1;
    this.circle2 = circle2;
    this.n = Math.max(2, Math.round(n));
    circle1.addIntersection(this);
    circle2.addIntersection(this);
    this.color = '#000000'; // default color for drawing
}

/**
 * calculate the distance between the two intersecting circles
 * resulting from their radius, mapping direction and n
 * @method Intersection#distanceBetweenCenters
 * @return number, required distance between centers
 */
Intersection.prototype.distanceBetweenCenters = function() {
    const sign = (this.circle1.isInsideOutMap === this.circle2.isInsideOutMap) ? 1 : -1;
    const cosAlpha = Math.cos(Math.PI / this.n);
    const d2 = this.circle1.radius2 + this.circle2.radius2 + 2 * sign * this.circle1.radius * this.circle2.radius * cosAlpha;
    return Math.sqrt(d2);
};

/**
 * calculate sign times cos(angle)
 * @method Intersection#signCosAngle
 * @return number
 */
Intersection.prototype.signCosAngle = function() {
    const sign = (this.circle1.isInsideOutMap === this.circle2.isInsideOutMap) ? 1 : -1;
    const cosAlpha = Math.cos(Math.PI / this.n);
    return sign * cosAlpha;
};

/**
 * try to change the order n of the intersection
 * see if one of the circles is selected, then adjust it
 * if fail try to adjust the other circle
 * if none is selected try both
 * if all fails restore order n
 * return if successful
 * makes that both circles will be selected
 * @method Intersection#tryN
 * @param {integer} n
 * @return boolean, true if success
 */
Intersection.prototype.tryN = function(n) {
    const currentN = this.n;
    this.n = Math.max(2, Math.round(n));
    if (circles.selected === this.circle1) {
        circles.setSelected(this.circle2);
        circles.setSelected(this.circle1);
    } else {
        circles.setSelected(this.circle1);
        circles.setSelected(this.circle2);
    }
    let success = circles.selected.adjustToIntersections();
    if (!success) {
        circles.setSelected(circles.otherSelected);
        success = circles.selected.adjustToIntersections();
    }
    if (!success) {
        this.n = currentN;
    }
    return success;
};

/**
 * increase/decrease order n (for mouse wheel action)
 * @method Intersection#incDecN
 * @param {number} direction - > 0 for increment
 */
Intersection.prototype.incDecN = function(direction) {
    if (direction > 0) {
        this.tryN(this.n + 1);
    } else {
        this.tryN(this.n - 1);
    }
};

/**
 * get the other circle of an intersection
 * @method Intersection#getOtherCircle
 * @param {Circle} circle
 * @return {Circle} 
 */
Intersection.prototype.getOtherCircle = function(circle) {
    if (circle === this.circle1) {
        return this.circle2;
    } else {
        return this.circle1;
    }
};

// drawing and selecting the intersection, releevant is the point of intersection of the two circles
// the two positions are calculated directly and not remembered, thus no need to update if circles change
const pos1 = {};
const pos2 = {};

/**
 * determine the two intersection positions
 * @method Intersection#determinePositions
 * @param {object} pos1 - with x- and y-fields
 * @param {object} pos2 - with x- and y-fields
 */
Intersection.prototype.determinePositions = function(pos1, pos2) {
    const center1X = this.circle1.centerX;
    const center1Y = this.circle1.centerY;
    const center2X = this.circle2.centerX;
    const center2Y = this.circle2.centerY;
    const center1To2X = center2X - center1X;
    const center1To2Y = center2Y - center1Y;
    // the actual distances between centers of other circles
    const distanceCenter1To2 = Math.hypot(center1To2X, center1To2Y);
    // midpoint of the two solutions on the line between the centers of the two circles
    // distance from center of circle 1 to the midpoint
    const parallelPosition = 0.5 * (distanceCenter1To2 + (this.circle1.radius2 - this.circle2.radius2) / distanceCenter1To2);
    let xi = parallelPosition / distanceCenter1To2;
    const px = center1X + center1To2X * xi;
    const py = center1Y + center1To2Y * xi;
    // get the two solutions from the displacement perpendicular to the line
    // if there are no real solutions we use the midpoint for both
    const perpSquare = this.circle1.radius2 - parallelPosition * parallelPosition;
    const perpendicularPosition = Math.sqrt(Math.max(0, perpSquare));
    xi = perpendicularPosition / distanceCenter1To2;
    pos1.x = px + center1To2Y * xi;
    pos1.y = py - center1To2X * xi;
    pos2.x = px - center1To2Y * xi;
    pos2.y = py + center1To2X * xi;
};

/**
 * draw a filled polygon, number of corners given by this.n
 * @method Intersection#drawPolygon
 * @param {object} center - with x- and y-fields
 * @param {number} radius
 */
Intersection.prototype.drawPolygon = function(center, radius) {
    radius *= output.coordinateTransform.totalScale;
    const context = output.canvasContext;
    if (this.n === 2) {
        // intersection with 2-fold symmetry: draw a rectangle
        context.beginPath();
        context.rect(center.x - radius, center.y - 0.5 * radius, 2 * radius, radius);
        context.stroke();
    } else if (this.n <= Intersection.maxCorners) {
        // draw a polygon if there are not too many corners
        // not called too often, trigonometric functions do not significantly slow down things
        context.beginPath();
        context.moveTo(center.x + radius, center.y);
        const alpha = 2 * Math.PI / this.n;
        for (var i = 1; i < this.n; i++) {
            context.lineTo(center.x + radius * Math.cos(i * alpha), center.y + radius * Math.sin(i * alpha));
        }
        context.closePath();
        context.stroke();
    } else {
        // too many corners: draw a circle
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.stroke();
    }
};

/**
 * drawing an intersection
 * as a polygon, in large size with highlight color, or smaller in its own color
 * @method Intersection#draw
 * @param {boolean} highlight - optional, default is 0, not highlighted
 */
Intersection.prototype.draw = function(highlight = 0) {
    this.determinePositions(pos1, pos2);
    const context = output.canvasContext;
    if (highlight === 0) {
        output.setLineWidth(Intersection.lineWidth);
        context.strokeStyle = this.color;
        this.drawPolygon(pos1, Intersection.radius);
        this.drawPolygon(pos2, Intersection.radius);
    } else {
        output.setLineWidth(Intersection.highlightLineWidth);
        if ((this.circle1.canChange) || (this.circle2.canChange)) {
            context.strokeStyle = Intersection.highlightColor;
        } else {
            context.strokeStyle = Intersection.frozenHighlightColor;
        }
        this.drawPolygon(pos1, Intersection.radius);
        this.drawPolygon(pos2, Intersection.radius);
    }
};

/**
 * check if the intersection is selected by position
 * @method Intersection#isSelected
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if selected
 */
Intersection.prototype.isSelected = function(position) {
    let selectionRadius2 = Intersection.selectionRadius * output.coordinateTransform.totalScale;
    selectionRadius2 = selectionRadius2 * selectionRadius2;
    this.determinePositions(pos1, pos2);
    let dx = position.x - pos1.x;
    let dy = position.y - pos1.y;
    if (dx * dx + dy * dy < selectionRadius2) {
        return true;
    }
    dx = position.x - pos2.x;
    dy = position.y - pos2.y;
    if (dx * dx + dy * dy < selectionRadius2) {
        return true;
    }
    return false;
};

/**
 * destroy the intersection and all that depends on it
 * particularly references at the two circles
 * @method Intersection#destroy
 */
Intersection.prototype.destroy = function() {
    this.circle1.removeIntersection(this);
    this.circle2.removeIntersection(this);

    // remove from list, delete UI
};