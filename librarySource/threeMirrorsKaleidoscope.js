/**
 * the original kaleidoscope made of three mirrors using the basicKaleidoscope.
 * variations: cutting edges/corners/other pieces of the poygon with additional mirror lines to get semiregular tilings
 * other mirror/rotational symmetry for the "skin" filling the polygon
 * no additional symmetry at all
 * @namespace threeMirrorsKaleidoscope
 */

/* jshint esversion:6 */

threeMirrorsKaleidoscope = {};


(function() {
    "use strict";

    /**
     * set the rotational symmetries at corners
     * @method basicKaleidoscope.setKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    threeMirrorsKaleidoscope.setKMN = function(k, m, n) {
        basicKaleidoscope.setKMN(k, m, n);
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                Make.setMapping(threeMirrorsKaleidoscope.mapInputImageElliptic, threeMirrorsKaleidoscope.mapStructureElliptic);
                break;
            case basicKaleidoscope.euclidic:
                Make.setMapping(threeMirrorsKaleidoscope.mapInputImageEuclidic, threeMirrorsKaleidoscope.mapStructureEuclidic);
                break;
            case basicKaleidoscope.hyperbolic:
                Make.setMapping(threeMirrorsKaleidoscope.mapInputImageHyperbolic, threeMirrorsKaleidoscope.mapStructureHyperbolic);
                break;
        }
    };

    // the mappings
    let dihedral = basicKaleidoscope.dihedral;
    let dihedralMap = dihedral.map;
    let mapElliptic = basicKaleidoscope.mapElliptic;
    let mapEuclidic = basicKaleidoscope.mapEuclidic;

    /**
     * map the position for using an input image, elliptic geometry
     * @method threeMirrorsKaleidoscope.mapInputImageElliptic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    threeMirrorsKaleidoscope.mapInputImageElliptic = function(position) {
        let lyapunov = mapElliptic(position);
        if (lyapunov >= 0) {
            dihedralMap(position);
        }
        return lyapunov;
    };

    /**
     * map the position for showing the structure, elliptic geometry
     * @method threeMirrorsKaleidoscope.mapStructureElliptic
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    threeMirrorsKaleidoscope.mapStructureElliptic = function(position) {
        let lyapunov = mapElliptic(position);
        if (lyapunov >= 0) {
            dihedralMap(position);
        }
        position.x = basicKaleidoscope.reflections + dihedral.reflections;
        return lyapunov;
    };

    const startPoint = new Vector2();
    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method threeMirrorsKaleidoscope.drawTrajectory
     * @param {Vector2} start
     * @param {float} nullRadius
     */
    threeMirrorsKaleidoscope.drawTrajectory = function(start, nullRadius) {
        startPoint.set(start);
        let factor(basicKaleidoscope.drawTrajectory(start) >= 0) //

    }


    /**
     * draw the triangle mirror lines
     * @method threeMirrorsKaleidoscope.drawTriangle
     */
    threeMirrorsKaleidoscope.drawTriangle = function(v) {
        basicKaleidoscope.dihedral.drawMirrors();
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                basicKaleidoscope.circle.draw();
                break;
            case basicKaleidoscope.euclidic:
                basicKaleidoscope.line.draw();
                break;
            case basicKaleidoscope.hyperbolic:
                basicKaleidoscope.circle.draw();
                break;
        }
    };




    /**
     * check if a point is inside the triangle
     * @method threeMirrorsKaleidoscope.isInsideTriangle
     * @param {Vector2} v
     * @return true if v is inside the triangle
     */
    threeMirrorsKaleidoscope.isInsideTriangle = function(v) {
        if (!basicKaleidoscope.dihedral.isInside(v)) {
            return false;
        }
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                return basicKaleidoscope.circle.contains(v);
            case basicKaleidoscope.euclidic:
                return !basicKaleidoscope.line.isAtLeft(v);
            case basicKaleidoscope.hyperbolic:
                return (v.x * v.x + v.y * v.y < basicKaleidoscope.worldRadius2) && !basicKaleidoscope.circle.contains(v);
        }
        return true;
    };


}());
