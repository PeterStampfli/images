// penrose tiling with rhombs p3-tiling
/* jshint esversion:6 */

var penroseRhombs = {};


(function() {
    "use strict";

    const largeAngle = Math.PI / 2.5;
    const smallAngle = Math.PI / 5;
    const ratio = 2 / (1 + Math.sqrt(5));
    const centerRatio = ratio / 2 / Fast.cos(smallAngle);


    var maxIterations, side;
    var lines;

    /*
     * set the data
     */
    penroseRhombs.set = function(theSide, iterations) {
        side = theSide;
        maxIterations = iterations;
    };

    /*
     * creating the lattice
     */


    penroseRhombs.start = function() {
        lines = new DrawingLines();
        const zero = new Vector2(0, 0);
        const b1 = new Vector2(side, 0);
        const b2 = b1.clone().rotate72();
        const c = Vector2.sum(b1, b2);
        for (var i = 0; i < 5; i++) {
            penroseRhombs.fat(0, true, zero, b1.clone(), c);
            penroseRhombs.fat(0, false, zero, b2.clone(), c);
            b1.rotate72();
            b2.rotate72();
            c.rotate72();
        }
    };

    penroseRhombs.slim = function(ite, counterclockwise, a, b, c) {
        if (ite < maxIterations) {
            const ab = Vector2.lerp(b, ratio, a);
            penroseRhombs.fat(ite + 1, counterclockwise, c, ab, b);
            penroseRhombs.slim(ite + 1, counterclockwise, ab, c, a);
        } else {
            if (counterclockwise) {
                const corner = Vector2.sum(a, c).sub(b);
                lines.addParallelogram(smallAngle, b, corner);
            }
        }
    };

    penroseRhombs.fat = function(ite, counterclockwise, a, b, c) {

        if (ite < maxIterations) {
            const ba = Vector2.lerp(a, ratio, b);
            const ca = Vector2.lerp(c, centerRatio, a);
            penroseRhombs.fat(ite + 1, !counterclockwise, ca, ba, a);
            penroseRhombs.fat(ite + 1, counterclockwise, c, ca, b);
            penroseRhombs.slim(ite + 1, !counterclockwise, ba, ca, b);
        } else {
            if (counterclockwise) {
                lines.addParallelogram(largeAngle, a, c);

            }
        }
    };


    /*
     * drawing the tiling
     */
    penroseRhombs.draw = function() {
        if (!lines) {
            penroseRhombs.start();
        }
        lines.draw();
    };

}());
