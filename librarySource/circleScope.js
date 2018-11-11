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


    circleScope.dihedral = new Dihedral();
    var reflections;
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
        circleScope.circle1.draw();
        circleScope.circle2.draw();
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
            if ((circleScope.circle1.map(position) > 0) || (circleScope.circle2.map(position) > 0)) {
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
        const center1 = new Vector2(r / sinPIK, 0);
        const radius2 = tanPIK * r * (1 + 1 / sinPIK);

        const center2 = new Vector2(r + center1.x, radius2);
        circleScope.circle1 = new Circle(r, center1);
        circleScope.circle1.map = circleScope.circle1.invertInsideOut;

        circleScope.circle2 = new Circle(radius2, center2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;

        circleScope.discRadius = center2.x;
        circleScope.discCutoff = false;
        circleScope.discRemap = false;
        circleScope.discRemapForImage = true;

        circleScope.setMapping();

    };

    /**
     * set up the second circle as an outer circle with hyperbolic or elliptic geometry
     * @method circleScope.outerReflection
     * @param {float} radius of circle, or intersection of line with x-axis
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    circleScope.outerReflection = function(radius, k, m, n) {


    };


    /**
     * a chain of two circles with same radius and adjustable intersection angle 
     * @method circleScope.chaink2n2
     * @param {integer} k - rotational symmetry of all
     * @param {float} radius
     * @param {float} x - position of upper circle center
     * @param {integer} n - rotational symmetry at intersection of circles
     */
    circleScope.chaink2n2 = function(k, radius, x, n) {
        k = Math.max(3, k);
        circleScope.setDihedral(k);
        const d = 2 * radius * Fast.cos(0.5 * Math.PI / n);
        const y = Math.min(x * Math.tan(Math.PI / k), d);
        const center1 = new Vector2(x, y);
        const center2x = x + Math.sqrt(d * d - y * y);
        const center2 = new Vector2(center2x, 0);
        const middle = Vector2.middle(center1, center2);
        center1.log("c1");
        center2.log("c2");
        middle.log();
        circleScope.discRadius = middle.length();
        console.log(circleScope.discRadius);
        circleScope.discCutoff = false;
        circleScope.discRemap = false;
        circleScope.discRemapForImage = true;


        circleScope.circle1 = new Circle(radius, center1);
        circleScope.circle1.map = circleScope.circle1.invertInsideOut;
        circleScope.circle2 = new Circle(radius, center2);
        circleScope.circle2.map = circleScope.circle2.invertInsideOut;

        circleScope.setMapping();


    };

}());
