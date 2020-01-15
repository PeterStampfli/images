// functions that generate rotating functions
/* jshint esversion:6 */

/**
 * rotating a vector by a given fixed angle
 * @namespace rotation
 */

rotation = {};

(function() {
    "use strict";

    /**
     * create and return a function that rotates a Vector2 object by given angle
     * and returns the object for further computation
     * @method rotation.create
     * @param {float} angle
     * @return a function that rotates a vector
     */
    rotation.create = function(angle) {
        angle -= 2 * Math.PI * Math.floor(0.5 * angle / Math.PI);
        var result;
        if (Fast.areEqual(angle, 0)) {
            result = function(p) {
                return p;
            };
            return result;
        }
        if (Fast.areEqual(angle, 0.5 * Math.PI)) {
            result = function(p) {
                const h = p.y;
                p.y = p.x;
                p.x = -h;
                return p;
            };
            return result;
        }
        if (Fast.areEqual(angle, Math.PI)) {
            result = function(p) {
                p.x = -p.x;
                p.y = -p.y;
                return p;
            };
            return result;
        }
        if (Fast.areEqual(angle, 1.5 * Math.PI)) {
            result = function(p) {
                const h = p.y;
                p.y = -p.x;
                p.x = h;
                return p;
            };
            return result;
        }
        const cosAngle = Fast.cos(angle);
        const sinAngle = Fast.sin(angle);
        result = function(p) {
            const h = cosAngle * p.x - sinAngle * p.y;
            p.y = sinAngle * p.x + cosAngle * p.y;
            p.x = h;
            return p;
        };
        return result;
    };

    /**
     * create and return a function that rotates a Vector2 object by given angle and mirrors at the x-axis
     * and returns the object for further computation
     * @method rotation.createMirrored
     * @param {float} angle
     * @return a function that rotates a vector
     */
    rotation.createMirrored = function(angle) {
        angle -= 2 * Math.PI * Math.floor(0.5 * angle / Math.PI);
        var result;
        if (Fast.areEqual(angle, 0)) {
            result = function(p) {
                p.y = -p.y;
                return p;
            };
            return result;
        }
        if (Fast.areEqual(angle, 0.5 * Math.PI)) {
            result = function(p) {
                const h = p.y;
                p.y = -p.x;
                p.x = -h;
                return p;
            };
            return result;
        }
        if (Fast.areEqual(angle, Math.PI)) {
            result = function(p) {
                p.x = -p.x;
                p.y = p.y;
                return p;
            };
            return result;
        }
        if (Fast.areEqual(angle, 1.5 * Math.PI)) {
            result = function(p) {
                const h = p.y;
                p.y = p.x;
                p.x = h;
                return p;
            };
            return result;
        }
        const cosAngle = Fast.cos(angle);
        const sinAngle = Fast.sin(angle);
        result = function(p) {
            const h = cosAngle * p.x - sinAngle * p.y;
            p.y = -(sinAngle * p.x + cosAngle * p.y);
            p.x = h;
            return p;
        };
        return result;
    };


}());
