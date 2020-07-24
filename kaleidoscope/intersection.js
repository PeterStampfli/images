/* jshint esversion: 6 */

import {
    mirrors
} from './modules.js';

/**
 * intersection between mirrors, making a definite n-fold dihedral symmetry
 * NOTE: this may require adjustments elsewhere
 * @constructor Intersection
 * @params {Mirror} mirror1
 * @params {Mirror} mirror2
 * @params {integer} n - optional, has to be >=2, default 3
 */

export function Intersection(mirror1, mirror2, n = 3) {
    if (mirror1.intersections.length > 2) {
        console.error('Intersection: Circle1 has more than 2 intersections, cannot add more. Circle1:');
        console.log(mirror1.intersections);
    } else if (mirror2.intersections.length > 2) {
        console.error('Intersection: Circle2 has more than 2 intersections, cannot add more. Circle2:');
        console.log(mirror2.intersections);
    } else {
        mirror1.intersections.push(this);
        mirror2.intersections.push(this);
    }
    this.mirror1 = mirror1;
    this.mirror2 = mirror2;
    this.setN(n);
}

/**
 * calculate the distance between the two circles as mirrors
 * ok, becomes more complicated if there are mirror lines too
 * resulting from their radius, mapping direction and n
 * @method Intersection#distanceBetweenCenters
 */
Intersection.prototype.distanceBetweenCenters = function() {
    const sign = (this.mirror1.isOutsideInMap === this.mirror2.isOutsideInMap) ? 1 : -1;
    const cosAlpha = Math.cos(Math.PI / this.n);
    const d2 = this.mirror1.radius2 + this.mirror2.radius2 + 2 * sign * this.mirror1.radius * this.mirror2.radius * cosAlpha;
    return Math.sqrt(d2);
};

/**
 * change the order n of the intersection
 * see if one of the circles is selected, then adjust it
 * if none is selected, make that second circle is selected and adjust
 * @method Intersection#setN
 * @param {integer} n
 */
Intersection.prototype.setN = function(n) {
    this.n = Math.max(2, Math.round(n));
    if ((mirrors.selected !== this.mirror1) && (mirrors.selected !== this.circcle2)) {
        mirrors.setSelected(this.mirror2);
    }
    mirrors.selected.adjustToIntersections();
    mirrors.selected.updateUI();
};

/**
 * increase/decrease order n (for mouse wheel action)
 * @method Intersection#incDecN
 * @param {number} direction - > 0 for increment
 */
Intersection.prototype.incDecN = function(direction) {
    if (direction > 0) {
        this.setN(this.n + 1);
    } else {
        this.setN(this.n - 1);
    }
};

/**
 * get the other mirror of an intersection
 * @method Intersection#getOtherMirror
 * @param {Mirror} mirror
 * @return {Mirror} 
 */
Intersection.prototype.getOtherMirror = function(mirror) {
    if (mirror === this.mirror1) {
        return this.mirror2;
    } else {
        return this.mirror1;
    }
};