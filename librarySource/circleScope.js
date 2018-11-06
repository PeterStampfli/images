/**
 * similar to threeMirrorskaleidoscope+basicKaleidoscop, but with two circles instead of one
 * @namespace circleScope
 */

/* jshint esversion:6 */

circleScope = {};


(function() {
    "use strict";

    circleScope.circle1 = new Circle();
    circleScope.circle2 = new Circle();
    circleScope.dihedral = new Dihedral();
    let reflections = 0;
    let dihedral = circleScope.dihedral;

    /**
     * set dihedral order
     * @method circleScope.setDihedral
     * @param {integer} k, the order
     */
    circleScope.setDihedral = function(k) {
        circleScope.dihedral.setOrder(k);
    };

    /**
     * set the mappings
     * @method circleScope.setMapping
     */
    circleScope.setMapping = function() {
        Make.setMapping(circleScope.mapInputImage, circleScope.mapStructure);
    };


    /**
     * map the position for using an input image,
     * @method circleScope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    circleScope.mapInputImage = function(position) {
        let lyapunov = 1;
        return lyapunov;
    };

    /**
     * map the position for showing the structure
     * @method circleScope.mapStructure
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    circleScope.mapStructure = function(position) {
        let lyapunov = 1;
        position.x = reflections;
        return lyapunov;
    };


}());
