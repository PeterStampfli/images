/**
 * similar to threeMirrorskaleidoscope+basicKaleidoscop, but with two circles instead of one
 * both circles invert inside out
 * @namespace circleScope
 */

/* jshint esversion:6 */

circleScope = {};


(function() {
    "use strict";
    circleScope.maxIterations = 100;
    circleScope.discRadius = -1;

    circleScope.circle1 = new Circle();
    circleScope.circle2 = new Circle();
    circleScope.dihedral = new Dihedral();
    var reflections;
    let dihedral = circleScope.dihedral;
    let circle1 = circleScope.circle1;
    let circle2 = circleScope.circle2;

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
        Make.map.discRadius = circleScope.discRadius;
        Make.setMapping(circleScope.mapInputImage, circleScope.mapStructure);
    };

    /**
     * drawing the mirrors 
     * @method circleScope.draw 
     */
    circleScope.draw = function() {
        dihedral.drawMirrors();
        circle1.draw();
        circle2.draw();
    };


    /**
     * the basic mapping, returns negative number if iteration fails
     * sets number of reflections
     * @method circleScope.basicMap
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    circleScope.basicMap = function(position) {
        reflections = 0;

        for (var i = circleScope.maxIterations; i > 0; i--) {
            dihedral.map(position);
            reflections += Dihedral.reflections;
            if ((circle1.invertInsideOut(position) > 0) || (circle2.invertInsideOut(position) > 0)) {
                reflections++;
            } else {
                return 1;
            }

        }

        return -1;
    };

    /**
     * map the position for using an input image,
     * @method circleScope.mapInputImage
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    circleScope.mapInputImage = function(position) {
        return circleScope.basicMap(position);

    };

    /**
     * map the position for showing the structure
     * @method circleScope.mapStructure
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    circleScope.mapStructure = function(position) {
        let result = circleScope.basicMap(position);

        position.x = reflections;
        return result;
    };

    /**
     * setup for circles with centers on each straight mirror line,intersecting at right angles, the other straight line as tangent.
     * thus combination of two (k,2,infinity) kaleidoscopes, k has to be three or larger
     * the larger circles touch the poincare disc border of the other one
     * @method circleScope.doubleTriangleK2infty
     * @param {integer} k - basic dihedral order, 3 or larger
     * @param {float} r - radius of first circle
     */
    circleScope.doubleTriangleK2infty = function(k, r) {
        k = Math.max(3, k);
        circleScope.setDihedral(k);
        const sinPIK = Fast.sin(Math.PI / k);
        const cosPIK = Fast.cos(Math.PI / k);
        const tanPIK = sinPIK / cosPIK;
        const centerX1 = r / sinPIK;
        console.log(sinPIK);
        console.log(centerX1);
        const centerX2 = r + centerX1;
        const radius2 = tanPIK * centerX2;
        circleScope.discRadius = centerX2;
        circleScope.circle1.setRadiusCenterXY(r, centerX1, 0);
        circleScope.circle2.setRadiusCenterXY(radius2, centerX2, radius2);

        circleScope.setMapping();

    };




}());
