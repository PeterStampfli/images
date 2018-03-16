/**
 * kaleidoscope of two mirrors, intersecting at origin.
 * make k-fold rotational symmetry with mirror symmetry.
 * Basic map for maps using only mirror symmetries
 * @constructor TwoMirrors
 */

/* jshint esversion:6 */

function TwoMirrors() {
    "use strict";
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
     * @param {float} angle - in radians
     */
    TwoMirrors.prototype.setAngle = function(angle) {
        this.k2pi = 0.5/angle; // k/2pi is the inverse of two times the angle between mirrors
    };

   /**
     * basic method, uses simple mirrors
     * @method TwoMirrors#map
     * @param {Vector2} v - the vector of the point to map
     * @return {integer} 0 if no mapping, even > 0 if rotation without mirror, 1 if mirror only or mirror and rotation
     */
    TwoMirrors.prototype.map = function(v) {
        let angle = Fast.atan2(v.y, v.x);
        angle *= this.k2pi;
        let parity = Math.floor(angle);
        angle -= parity;
        parity = parity < 1;
        if (angle > 0.5) {
            angle = 1 - angle;
            parity = 1;
        }
        angle /= this.k2pi;
        let r = Math.sqrt(v.x * v.x + v.y * v.y);
        Fast.cosSin(angle);
        v.x = r * Fast.cosResult;
        v.y = r * Fast.sinResult;
        return parity;
    };
}());
