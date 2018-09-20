/** 
 * transforms for creating different projections
 * @namespace projection
 */

/* jshint esversion:6 */

projection = {};

(function() {
    "use strict";

    // depending on the projection we have a mapping and a cutoff disc radius
    // they have to be selected for each of elliptic, euclidic or hyperbolic case

    // these are used depending on the geometry

    // the projection maps
    //   function(p), transforms p, returns -1 for invalid points, +1 for valid points

    /**
     * identity "map", default, for stereographic (elliptic and hyperbolic) and straight (Euclidic)
     * @method projection.identityMap 
     * @param {Vector2} position - the vector to map 
     * @return  +1, all points are valid (-1 for invalid points)
     */
    projection.identityMap = function(p) {
        return 1;
    };

    projection.ellipticMap = projection.identityMap;
    projection.euclidicMap = projection.identityMap;
    projection.hyperbolicMap = projection.identityMap;

    // the cutoff radius for map making
    //           Make.map.discRadius = -1; if there is no cutoff    (default)
    //  Make.map.discRadius=value of the projection disc

    projection.ellipticDiscRadius = -1;
    projection.euclidicDiscRadius = -1;
    projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;

    // set the projection depending on the geometry. In basicKaleidoscope.setKMN

    /**
     * setup for elliptic geometry
     * @method projection.elliptic
     */
    projection.elliptic = function() {
        projection.map = projection.ellipticMap;
        Make.map.discRadius = projection.ellipticDiscRadius;
    };

    /**
     * setup for euclidic geometry
     * @method projection.euclidic
     */
    projection.euclidic = function() {
        projection.map = projection.euclidicMap;
        Make.map.discRadius = projection.euclidicDiscRadius;
    };

    /**
     * setup for hyperbolic geometry
     * @method projection.hyperbolic
     */
    projection.hyperbolic = function() {
        projection.map = projection.hyperbolicMap;
        Make.map.discRadius = projection.hyperbolicDiscRadius;
    };

    function updateMap() {
        Make.allowResetInputMap = false;
        Make.updateNewMap();
        Make.allowResetInputMap = true;
    }

    // making the projections
    // elliptic
    projection.ellipticStereographic = function() {
        projection.ellipticMap = projection.identityMap;
        projection.ellipticDiscRadius = -1;
        updateMap();
    };

    projection.ellipticNormal = function() {
        let iWorldradius2 = 1 / (basicKaleidoscope.worldRadiusElliptic * basicKaleidoscope.worldRadiusElliptic);
        projection.ellipticDiscRadius = basicKaleidoscope.worldRadiusElliptic;
        projection.ellipticMap = function(position) {
            let r2worldRadius2 = Math.hypot(position.x, position.y) * iWorldradius2;
            let rt = (1 - r2worldRadius2);
            if (rt > 0.00001) {
                let mapFactor = 1 / (1 + Math.sqrt(rt));
                position.x *= mapFactor;
                position.y *= mapFactor;
                return 1;
            } else {
                return -1;
            }
        };
        updateMap();
    };



}());
