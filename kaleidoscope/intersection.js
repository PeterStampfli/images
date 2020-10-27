/* jshint esversion: 6 */

import {
    output,
    guiUtils,
    map
}
from "../libgui/modules.js";

import {
    Circle,
    circles,
    intersections,
    basic
} from './modules.js';

// polygons with more corners will be circles
Intersection.maxCorners = 16;

/**
 * intersection between circles, making a definite n-fold dihedral symmetry
 * only general initialization, adjust circles later
 * gets its own gui
 * @constructor Intersection
 * @param{ParamGui} parentGui 
 * @params {Circle} circle1
 * @params {Circle} circle2
 * @param {String} color - for drawing, optional, default is black
 * @params {integer} n - optional, has to be >=2, default 3, for tests
 */
export function Intersection(parentGui, circle1, circle2, n = 3) {
    this.circle1 = circle1;
    this.circle2 = circle2;
    this.n = Math.max(2, Math.round(n));
    circle1.addIntersection(this);
    circle2.addIntersection(this);
    const circle = this;

    // the controllers
    const intersection = this;
    const label = '<strong>circle ' + circle1.id + ' and ' + circle2.id + '</strong>, order:';

    // try to change the order
    this.nController = parentGui.add({
        type: 'number',
        initialValue: this.n,
        labelText: label,
        min: 2,
        step: 1,
        onChange: function(n) {
            const success = intersection.tryN(n);
            if (!success) {
                intersection.nController.setValueOnly(interaction.n);
                alert('Fail: Cannot change interaction');
            }
            basic.drawMapChanged(); // map changes
        },
        onInteraction: function() {
            intersection.selectCircles();
            basic.drawCirclesIntersections();
        }
    });
    this.nController.label.onclick = function() {
        intersection.selectCircles();
        basic.drawCirclesIntersections();
    };
    this.nController.label.style.cursor = 'pointer';
    if (intersections.collection.length === 0) {
        this.nController.addHelp('This is the order of the dihedral group generated by the intersection. Its angle is 180 degrees divided by the order. Change the order by typing a new number or using the mouse wheel to change the digit at the left of the cursor. For the intersection between the selected circles you can change it using ctrl-shift-mouse wheel.');
    }
}

/**
 * get properties of this intersection as an object (id's of circles and order n)
 * @method Intersection#getProperties
 * @return object, with all properties needed to build the same circle
 */
Intersection.prototype.getProperties = function() {
    const properties = {
        idCircle1: this.circle1.id,
        idCircle2: this.circle2.id,
        n: this.n
    };
    return properties;
};
/**
 * update the ui values
 * @method Intersection#updateUI
 */
Intersection.prototype.updateUI = function() {
    this.nController.setValueOnly(this.n);
};

/**
 * activate ui depending on state of circles: At least one can change and has 3 intersections or less
 * @method Intersection.activateUI
 */
Intersection.prototype.activateUI = function() {
    const circle1Can = this.circle1.canChange && (this.circle1.intersections.length <= 3);
    const circle2Can = this.circle2.canChange && (this.circle2.intersections.length <= 3);
    this.nController.setActive(circle1Can || circle2Can);
};

/**
 * calculate the required distance between the two intersecting circles
 * resulting from their radius, mapping direction and n
 * @method Intersection#requireDistanceBetweenCenters
 * @return number, required distance between centers
 */
Intersection.prototype.requireDistanceBetweenCenters = function() {
    const sign = (this.circle1.isInsideOutMap === this.circle2.isInsideOutMap) ? 1 : -1;
    const cosAlpha = Math.cos(Math.PI / this.n);
    const d2 = this.circle1.radius2 + this.circle2.radius2 + 2 * sign * this.circle1.radius * this.circle2.radius * cosAlpha;
    return Math.sqrt(d2);
};

/**
 * estimate the order n of the dihedral group generated by an intersection of two circles
 * return a negative number if there is no good estimate, or if circles are not objects
 * @method Intersection.estimateN
 * @param {Circle} circle1
 * @param {Circle} circle2
 * @return number, if >=2 this is an estimate for the order, if <0 then there is no dihedral group
 */
Intersection.estimateN = function(circle1, circle2) {
    if (guiUtils.isObject(circle1) && guiUtils.isObject(circle2)) {
        const dx = circle1.centerX - circle2.centerX;
        const dy = circle1.centerY - circle2.centerY;
        const d2 = dx * dx + dy * dy;
        const sign = (circle1.isInsideOutMap === circle2.isInsideOutMap) ? 1 : -1;
        const cosAlpha = 0.5 * (d2 - circle1.radius2 - circle2.radius2) / circle1.radius / circle2.radius / sign;
        if ((cosAlpha < -0.2) || (cosAlpha > 1.1)) {
            return -1;
        } else {
            // safe limits for acos function, maximum n=200 for the order
            const alpha = Math.max(Math.acos(Math.max(Math.min(cosAlpha, 1), 0)), Math.PI / 200);
            return Math.round(Math.PI / alpha);
        }
    } else {
        return -1;
    }
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
 * select the intersecting circles of this intersection
 * if one of them is already selected, then it will remain so
 * @method Intersection.selectCircles
 */
Intersection.prototype.selectCircles = function() {
    if (circles.selected === this.circle1) {
        circles.setSelected(this.circle2);
        circles.setSelected(this.circle1);
    } else {
        circles.setSelected(this.circle1);
        circles.setSelected(this.circle2);
    }
};

/**
 * try to change the order n of the intersection
 * see which of the circles has less intersections, then try to adjust it
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
    this.selectCircles();
    const selected = circles.selected;
    // try to adjust selected circle
    let success = circles.selected.adjustToIntersections();
    // if fail try to adjust otherSelected circle
    if (!success) {
        circles.setSelected(circles.otherSelected);
        success = circles.selected.adjustToIntersections();
    }
    // if that fails too, restore things
    if (!success) {
        circles.setSelected(selected);
        this.n = currentN;
    }
    this.updateUI();
    return success;
};

/**
 * mouse wheel on the intersection, increase/decrease order n
 * @method Intersection#wheelAction
 * @param{object} event
 */
Intersection.prototype.wheelAction = function(event) {
    var success;
    if (event.wheelDelta > 0) {
        success = this.tryN(this.n + 1);
    } else {
        success = this.tryN(this.n - 1);
    }
    if (!success) {
        alert('Fail: Cannot change interaction');
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
    const radius = 7 * map.linewidth;
    if (highlight === 0) {
        output.setLineWidth(map.linewidth);
        context.strokeStyle = this.circle1.color;
        this.drawPolygon(pos1, radius);
        this.drawPolygon(pos2, radius);
        context.strokeStyle = this.circle2.color;
        this.drawPolygon(pos1, radius + 2 * map.linewidth);
        this.drawPolygon(pos2, radius + 2 * map.linewidth);
    } else {
        output.setLineWidth(3 * map.linewidth);
        if ((this.circle1.canChange) || (this.circle2.canChange)) {
            context.strokeStyle = Circle.highlightColor;
        } else {
            context.strokeStyle = Circle.frozenHighlightColor;
        }
        this.drawPolygon(pos1, radius);
        this.drawPolygon(pos2, radius);
        this.drawPolygon(pos1, radius + 2 * map.linewidth);
        this.drawPolygon(pos2, radius + 2 * map.linewidth);
    }
};

/**
 * check if the intersection is selected by position
 * @method Intersection#isSelected
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if selected
 */
Intersection.prototype.isSelected = function(position) {
    let selectionRadius2 = 9 * map.linewidth * output.coordinateTransform.totalScale;
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
    this.nController.destroy();
    intersections.remove(this);
};