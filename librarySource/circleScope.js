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
    // radius of a poincare disc ??
    circleScope.discRadius = -1;
    // cutoff or not
    circleScope.discCutoff = true;
    // remap if out side
    circleScope.discRemap = false;
    // remap if outside for image
    circleScope.discRemapForImage = true;

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
        circleScope.discRadius2 = circleScope.discRadius * circleScope.discRadius;
        if (circleScope.discCutoff) {
            Make.map.discRadius = circleScope.discRadius;
        } else {
            Make.map.discRadius = -1;
        }
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

    // uses a so called map-method of circles, can be invertInsideOut or invertOutsideIn
    circleScope.basicMap = function(position) {
        reflections = 0;

        for (var i = circleScope.maxIterations; i > 0; i--) {
            dihedral.map(position);
            reflections += Dihedral.reflections;
            if ((circle1.map(position) > 0) || (circle2.map(position) > 0)) {
                reflections++;
                if (circleScope.discRemap) {
                    let r2 = position.x * position.x + position.y * position.y;
                    if (r2 > circleScope.discRadius2) {
                        r2 = circleScope.discRadius2 / r2;
                        position.x *= r2;
                        position.y *= r2;
                        reflections++;
                    }
                }
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
        let result = circleScope.basicMap(position);

        if (circleScope.discRemapForImage) {
            let r2 = position.x * position.x + position.y * position.y;
            if (r2 > circleScope.discRadius2) {
                r2 = circleScope.discRadius2 / r2;
                position.x *= r2;
                position.y *= r2;
            }
        }
        return result;
    };

    /**
     * map the position for showing the structure
     * @method circleScope.mapStructure
     * @param {Vector2} v - the vector to map, x-component will be number of reflections
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    circleScope.mapStructure = function(position) {
        let result = circleScope.basicMap(position);



        if (position.x * position.x + position.y * position.y > circleScope.discRadius2) {
            position.y = 2;
        } else {
            position.y = 1;
        }
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
        circleScope.circle1.setRadiusCenterXY(r, centerX1, 0);
        circleScope.circle1.map = circleScope.circle1.invertInsideOut;
        circleScope.circle2.setRadiusCenterXY(radius2, centerX2, radius2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;

        circleScope.discRadius = centerX2;
        circleScope.discCutoff = false;
        circleScope.discRemap = false;
        circleScope.discRemapForImage = true;

        circleScope.setMapping();

    };




}());
