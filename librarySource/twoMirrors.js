/**
 * kaleidoscope of two mirrors, intersecting at origin.
 * make k-fold rotational symmetry with mirror symmetry.
 * Basic map for maps using only mirror symmetries
 * @constructor TwoMirrors
 */

/* jshint esversion:6 */

function TwoMirrors() {
    "use strict";

    let twoMirrors = this;

    /**
     * a vector mapping, creating a rosette from an input image
     * @method TwoMirrors#vectorMapping
     * @param {Vector2} input
     * @param {Vector2} output
     * @return {boolean} true - any point is ok
     */
    this.vectorMapping = function(input, output) {
        output.set(input);
        twoMirrors.map(output);
        return true;
    };

    /**
     * mapping to the number of reflections
     * @method TwoMirrors#reflectionsMapping
     * @param {Vector2} input
     * @param {Vector2} output - x-component will be number of relections
     * @return {boolean} true - any point is ok
     */
    this.reflectionsMapping = function(input, output) {
        output.set(input);
        let reflections = twoMirrors.map(output);
        output.x = reflections;
        return true;
    };
}

(function() {
    "use strict";
    /**
     * set multiplicity k of rotational symmetry
     * @method TwoMirrors#setK
     * @param {integer} k - number of sectors
     */
    TwoMirrors.prototype.setK = function(k) {
        this.k2pi = k * 0.159154; // k/2pi is the inverse of two times the angle between mirrors
    };

    /**
     * set angle between the mirrors
     * @method TwoMirrors#setAngle
     * @param {float} angle - in radians, between the two mirrors
     */
    TwoMirrors.prototype.setAngle = function(angle) {
        this.k2pi = 0.5 / angle; // k/2pi is the inverse of two times the angle between mirrors
    };

    /**
     * basic method, uses simple mirrors
     * @method TwoMirrors#map
     * @param {Vector2} v - the vector of the point to map
     * @return {integer} number of mirror symmetries,0 if no mapping, even > 0 if rotation without mirror, odd if mirror only or mirror and rotation
     */
    TwoMirrors.prototype.map = function(v) {
        let angle = Fast.atan2(v.y, v.x);
        angle *= this.k2pi;
        let reflections = Math.floor(angle);
        angle -= reflections;
        reflections = Math.abs(reflections) < 1; // shift-multiply by two
        if (angle > 0.5) {
            angle = 1 - angle;
            reflections++;
        }
        angle /= this.k2pi;
        let r = Math.hypot(v.x, v.y);
        Fast.cosSin(angle);
        v.x = r * Fast.cosResult;
        v.y = r * Fast.sinResult;
        return reflections;
    };


}());
