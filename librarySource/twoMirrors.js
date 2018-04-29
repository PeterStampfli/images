/**
 * kaleidoscope of two mirrors, intersecting at origin.
 * make k-fold rotational symmetry with mirror symmetry.
 * Basic map for maps using only mirror symmetries
 * @namespace twoMirrors
 */

/* jshint esversion:6 */

twoMirrors = {};


(function() {
    "use strict";
    let k2pi = 0;
    let cosAngle = 0;
    let sinAngle = 0;
    // drawing
    let big = 100;
    let pointA = new Vector2();
    let pointB = new Vector2();
    let pointZero = new Vector2(0, 0);

    let vector = new Vector2();

    /**
     * a vector mapping, creating a rosette from an input image
     * @method twoMirrors.vectorMapping
     * @param {Vector2} input
     * @param {Vector2} output
     * @return {boolean} true - any point is ok
     */
    twoMirrors.vectorMapping = function(input, output) {
        output.set(input);
        twoMirrors.map(output);
        return 1;
    };

    /**
     * mapping to the number of reflections
     * @method twoMirrors.reflectionsMapping
     * @param {Vector2} input
     * @param {Vector2} output - x-component will be number of relections
     * @return {boolean} true - any point is ok
     */
    twoMirrors.reflectionsMapping = function(input, output) {
        output.set(input);
        let reflections = twoMirrors.map(output);
        output.x = reflections;
        return 1;
    };

    /**
     * set multiplicity k of rotational symmetry
     * @method twoMirrors.setK
     * @param {integer} k - number of sectors
     */
    twoMirrors.setK = function(k) {
        twoMirrors.setAngle(Math.PI / k);
    };

    /**prototype
     * set angle between the mirrors
     * @method twoMirrors.setAngle
     * @param {float} angle - in radians, between the two mirrors
     */
    twoMirrors.setAngle = function(angle) {
        k2pi = 0.5 / angle; // k/2pi is the inverse of two times the angle between mirrors
        Fast.cosSin(angle);
        cosAngle = Fast.cosResult;
        sinAngle = Fast.sinResult;
        pointB.setPolar(big, angle);
        pointA.setComponents(big, 0);
    };

    /**
     * basic method, uses simple mirrors
     * @method twoMirrors.map
     * @param {Vector2} v - the vector of the point to map
     * @return {integer} number of mirror symmetries,0 if no mapping, even > 0 if rotation without mirror, odd if mirror only or mirror and rotation
     */
    twoMirrors.map = function(v) {
        let angle = Fast.atan2(v.y, v.x);
        angle *= k2pi;
        let reflections = Math.floor(angle);
        angle -= reflections;
        reflections = Math.abs(reflections) << 1; // shift-multiply by two
        if (angle > 0.5) {
            angle = 1 - angle;
            reflections++;
        }
        angle /= k2pi;
        let r = Math.hypot(v.x, v.y);
        Fast.cosSin(angle);
        v.x = r * Fast.cosResult;
        v.y = r * Fast.sinResult;
        return reflections;
    };

    /**
     * do the mapping using simple mirrors and draw the trajectory
     * @method twoMirrors.drawMap
     * @param {Vector2} v - the vector of the point to map
     * @return {integer} number of mirror symmetries,0 if no mapping, even > 0 if rotation without mirror, odd if mirror only or mirror and rotation
     */
    twoMirrors.drawMap = function(v) {
        vector.set(v);
        let result = twoMirrors.map(v);
        if (result != 0) {
            Draw.arc(v, vector, pointZero);
        }
        return result;
    };

    /**
     * check if a point is inside
     * @method twoMirrors.
     * @param {Vector2} v - point to test
     * @return true if polar angle of v between 0 and PI/2k
     */
    twoMirrors.isInside = function(v) {
        if (v.y < 0) {
            return false;
        }
        return (v.y * cosAngle <= v.x * sinAngle);
    };

    /**
     * draw the mirror lines on outputimage
     * @method twoMirrors.drawLines
     */
    twoMirrors.drawLines = function() {
        Draw.line(pointZero, pointA);
        Draw.line(pointZero, pointB);
    };


}());
