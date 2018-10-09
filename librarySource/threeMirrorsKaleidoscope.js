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
            dihedral.mapOfSector(basicKaleidoscope.sectorIndex, position);
            //dihedral.map(position);
        }
        position.x = basicKaleidoscope.reflections + Dihedral.reflections;
        return lyapunov;
    };

}());
