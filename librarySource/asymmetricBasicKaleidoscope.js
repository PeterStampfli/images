/**
 * only the basicKaleidoscope without further symmetry 
 * has to be of type (k 4 2) to make coninuous image
 * @namespace asymmetricBasicKaleidoscope
 */

/* jshint esversion:6 */

asymmetricBasicKaleidoscope = {};


(function() {
    "use strict";


    // the mappings
    // note that basicKaleidoscope is a namespace, dihedral is an object
    let dihedral = basicKaleidoscope.dihedral;
    let basicMap = basicKaleidoscope.mapHyperbolic;


    /**
     * set the rotational symmetries at corners
     * has to be of type (k 4 2) to make coninuous image
     * @method asymmetricBasicKaleidoscope.setK
     * @param {integer} k - symmetry at center corner
     */
    asymmetricBasicKaleidoscope.setK = function(k) {
        //    basicKaleidoscope.setKMN(k, 4, 2);
        basicKaleidoscope.setKMN(k, 4, 1 / 0.75);
        Make.setMapping(asymmetricBasicKaleidoscope.mapInputImage, asymmetricBasicKaleidoscope.mapStructure);
        basicMap = basicKaleidoscope.map;
    };

    /**
     * map the position for using an input image,
     * @method asymmetricBasicKaleidoscope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    asymmetricBasicKaleidoscope.mapInputImage = function(position) {
        return basicMap(position);
    };

    /**
     * map the position for showing the structure
     * @method asymmetricBasicKaleidoscope.mapStructure
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    asymmetricBasicKaleidoscope.mapStructure = function(position) {
        let lyapunov = basicMap(position);
        position.x = basicKaleidoscope.reflections;
        return lyapunov;
    };

    /**
     * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
     * @method asymmetricBasicKaleidoscope.drawTrajectory
     * @param {Vector2} position
     * @param {float} nullRadius
     */
    asymmetricBasicKaleidoscope.drawTrajectory = function(position, nullRadius) {
        let positions = [];
        positions.push(position.clone());
        let sizes = [];
        sizes.push(1);
        let lyapunov = basicKaleidoscope.drawTrajectory(positions, sizes);
        if (lyapunov > 0) {
            basicKaleidoscope.drawEndPoints(positions, sizes, nullRadius);
        }
    };




}());
