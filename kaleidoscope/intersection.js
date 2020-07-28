/* jshint esversion: 6 */

import {
    mirrors
} from './modules.js';

/**
 * intersection between mirrors, making a definite n-fold dihedral symmetry
 * makes that one of the mirrors adjusts (selected one preferred)
 * adjust later
 * @constructor Intersection
 * @params {Mirror} mirror1
 * @params {Mirror} mirror2
 * @params {integer} n - optional, has to be >=2, default 3
 */

export function Intersection(mirror1, mirror2, n = 3) {
    this.mirror1 = mirror1;
    this.mirror2 = mirror2;
    this.setN(n);
    mirror1.addIntersection(this);
    mirror2.addIntersection(this);
}

/**
 * calculate the distance between the two circles as mirrors
 * ok, becomes more complicated if there are mirror lines too
 * resulting from their radius, mapping direction and n
 * @method Intersection#distanceBetweenCenters
 * @return number, required distance between centers
 */
Intersection.prototype.distanceBetweenCenters = function() {
    const sign = (this.mirror1.isOutsideInMap === this.mirror2.isOutsideInMap) ? 1 : -1;
    const cosAlpha = Math.cos(Math.PI / this.n);
    const d2 = this.mirror1.radius2 + this.mirror2.radius2 + 2 * sign * this.mirror1.radius * this.mirror2.radius * cosAlpha;
    return Math.sqrt(d2);
};

/**
* calculate sign times cos(angle)
* @method Intersection#signCosAngle
* @return number
*/
Intersection.prototype.signCosAngle = function() {
    const sign = (this.mirror1.isOutsideInMap === this.mirror2.isOutsideInMap) ? 1 : -1;
    const cosAlpha = Math.cos(Math.PI / this.n);
    return sign*cosAlpha;
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