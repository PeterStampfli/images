/**
 * apollinius gasket as refector
 * using multiCircles
 * @namespace apollinius
 */





/* jshint esversion:6 */

apollinius = {};


(function() {
    "use strict";


    const extendedCircle1 = new Circle();
    const extendedCircle2 = new Circle();
    const toCircle3 = new Vector2();


    /**
     * generate casket, depending on number of iterations and the three border circles
     * add ciircle to multiCircles.elements
     * @method apollinius.generate
     * @param {integer} ite - number of iterations to do
     * @param {Circle} circle1
     * @param {Circle} circle2
     * @param {Circle} circle3
     */
    apollinius.generate = function(ite, circle1, circle2, circle3) {
        const r1 = circle1.radius;
        const r2 = circle2.radius;
        const r3 = circle3.radius;
        // find circle radius
        // soddys equation
        const sum1 = 1 / r1 + 1 / r2 + 1 / r3;

        const sum2 = 1 / r1 / r1 + 1 / r2 / r2 + 1 / r3 / r3;




        const a = 1;
        const b = -2 * sum1;
        const c = 2 * sum2 - sum1 * sum1;
        Fast.quadraticEquation(a, b, c);
        // the larger solution gives the smaller radius of incircle
        const r = 1 / Fast.xHigh;
        console.log(r);
        // find circle center
        // get two possible centers from intersection of circles

        extendedCircle1.setRadiusCenter(r + r1, circle1.center);
        extendedCircle2.setRadiusCenter(r + r2, circle2.center);
        extendedCircle1.intersectsCircle(extendedCircle2);

        // get solution with smaller distance to circle 3


        multiCircles.addCircleInsideOut(r, 0, 0);


    };

    /**
     * start a gasket
     * @method apollinius.start
     * @param {integer} ite - number of iterations
     * @param {float} size - distance of cirlce centers from origin
     */


    apollinius.start = function(ite, size) {

        const radius = Math.sqrt(3) / 2 * size;
        const circle1 = multiCircles.addCircleInsideOut(radius, size, 0);
        const circle2 = multiCircles.addCircleInsideOut(radius, -0.5 * size, Math.sqrt(3) / 2 * size);
        const circle3 = multiCircles.addCircleInsideOut(radius, -0.5 * size, -Math.sqrt(3) / 2 * size);
        apollinius.generate(ite, circle1, circle2, circle3);
        console.log(size - radius);

        const limes2 = size * size / 4;

        multiCircles.finishMap = function(position, furtherResults) {
            let l2 = position.length2();
            if (l2 > limes2) {
                position.scale(limes2 / l2);
                furtherResults.colorSector = 0;
            }
        };
    };



}());
