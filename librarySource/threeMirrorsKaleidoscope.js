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


    // the mappings
    // note that basicKaleidoscope is a namespace, dihedral is an object
    let dihedral = basicKaleidoscope.dihedral;
    let basicMap = basicKaleidoscope.mapHyperbolic;


    /**
     * set the rotational symmetries at corners
     * @method basicKaleidoscope.setKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    threeMirrorsKaleidoscope.setKMN = function(k, m, n) {
        basicKaleidoscope.setKMN(k, m, n);
        Make.setMapping(threeMirrorsKaleidoscope.mapInputImage, threeMirrorsKaleidoscope.mapStructure);
        basicMap = basicKaleidoscope.map;
    };

    /**
     * map the position for using an input image,
     * @method threeMirrorsKaleidoscope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    threeMirrorsKaleidoscope.mapInputImage = function(position) {
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
        }
        return lyapunov;
    };

    /**
     * map the position for showing the structure
     * @method threeMirrorsKaleidoscope.mapStructure
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    threeMirrorsKaleidoscope.mapStructure = function(position) {
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
        }
        position.x = basicKaleidoscope.reflections + Dihedral.reflections;
        return lyapunov;
    };

    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method threeMirrorsKaleidoscope.drawTrajectory
     * @param {Vector2} position
     * @param {float} nullRadius
     */
    threeMirrorsKaleidoscope.drawTrajectory = function(position, nullRadius) {
        let positions = [];
        positions.push(position.clone());
        let sizes = [];
        sizes.push(1);
        let lyapunov = basicKaleidoscope.drawTrajectory(positions, sizes);
        if (lyapunov > 0) {
            let position = positions[positions.length - 1].clone();
            dihedral.drawMap(position);
            positions.push(position);
            sizes.push(sizes[sizes.length - 1]);
            basicKaleidoscope.drawEndPoints(positions, sizes, nullRadius);
        }
    };

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
    };


}());
