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
    var basicMap;


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
     * set the rotational symmetries at corners for a projection of spherical image
     * @method basicKaleidoscope.setKMNSpherical
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    threeMirrorsKaleidoscope.setKMNSpherical = function(k, m, n) {
        threeMirrorsKaleidoscope.setKMN(k, m, n);
        Make.setMapping(threeMirrorsKaleidoscope.mapInputImageSpherical, threeMirrorsKaleidoscope.mapStructureSpherical);
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
     * map the position for using an input image, spherical geometry
     * @method threeMirrorsKaleidoscope.mapInputImageSpherical
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    threeMirrorsKaleidoscope.mapInputImageSpherical = function(position) {
        let sphereLyapunov = sphericalToElliptic.map(position);
        if (sphereLyapunov < 0) return -1;
        let lyapunov = basicMap(position);
        if (lyapunov >= 0) {
            dihedral.map(position);
        }
        return lyapunov * sphereLyapunov;
    };

    /**
     * map the position for showing the structure, spherical geometry
     * @method threeMirrorsKaleidoscope.mapStructureSpherical
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    threeMirrorsKaleidoscope.mapStructureSpherical = function(position) {
        let sphereLyapunov = sphericalToElliptic.map(position);
        if (sphereLyapunov < 0) return -1;
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
     * @param {String} pointColor - color for (end)ponts, css strings
     */
    threeMirrorsKaleidoscope.drawTrajectory = function(position, nullRadius, pointColor) {
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
            Draw.setColor(pointColor);
            basicKaleidoscope.drawEndPoints(positions, sizes, nullRadius);
        }
    };



}());
