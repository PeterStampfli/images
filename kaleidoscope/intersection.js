/* jshint esversion: 6 */

import {
    circles
} from './modules.js';

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