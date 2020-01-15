/** 
 * transform to get spherical parallel projection image from elliptic image
 * @namespace sphericalToElliptic
 */

/* jshint esversion:6 */

sphericalToElliptic = {};


(function() {
    "use strict";

    /**
     * setting up some parameters, call after setting the elliptic worldradius
     * @method sphericalToElliptic.setup
     */
    sphericalToElliptic.setup = function() {
        sphericalToElliptic.iWorldradius2 = 1 / (basicKaleidoscope.worldRadiusElliptic * basicKaleidoscope.worldRadiusElliptic);
    };

    /**
     * make the mapping and calculate an average lyapunov coefficient
     * @method sphericalToElliptic.map 
     * @param {Vector2} position - the vector to map 
     * @return float, average lyapunov coefficient
     */
    sphericalToElliptic.map = function(position) {
        let r2worldRadius2 = Math.hypot(position.x, position.y) * sphericalToElliptic.iWorldradius2;
        let rt = (1 - r2worldRadius2 + 0.007);
        if (rt > 0.00001) {
            rt = Math.sqrt(rt);
        } else {
            return -1;
        }
        let mapFactor = 1 / (1 + rt);
        position.x *= mapFactor;
        position.y *= mapFactor;
        return Math.sqrt(mapFactor * mapFactor * (1 + r2worldRadius2 / rt * mapFactor));
    };

}());
