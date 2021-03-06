// doing the ammann beenker tiling using iteration methods ..
//drawing lines

/* jshint esversion:6 */



var ambe = {};


(function() {
    "use strict";

    const rt2 = Math.sqrt(2);
    const angle = Math.PI / 4;
    const tanPi8 = Math.tan(Math.PI / 8);
    const ratio = 1 / (1 + Math.sqrt(2));
    const hypoRatio = 1 / (rt2 + 2);

    var maxIterations, side;
    var lines;

    /*
     * set the data
     */
    ambe.set = function(theSide, iterations) {
        side = theSide;
        maxIterations = iterations;
    };

    /*
     * creating the lattice
     */

    ambe.start = function() {
        lines = new DrawingLines();
        const zero = new Vector2(0, 0);
        const rhomb1Right = new Vector2(side * (1 + 1 / rt2), side / rt2);
        const rhomb2Right = new Vector2(side * (1 + rt2), 0);
        const rhomb2Left = new Vector2(rhomb1Right.x, rhomb1Right.x);
        const rhomb1Bottom = new Vector2(side, 0);
        const rhomb1Top = new Vector2(side / rt2, side / rt2);
        for (var i = 0; i < 8; i++) {
            ambe.rhomb(0, zero, rhomb1Right.clone());
            ambe.rhomb(0, rhomb2Right.clone(), rhomb2Left.clone());
            ambe.triangle(0, true, rhomb2Right.clone(), rhomb1Right.clone(), rhomb1Bottom.clone());
            ambe.triangle(0, false, rhomb2Left.clone(), rhomb1Right.clone(), rhomb1Top.clone());
            rhomb1Right.rotate45();
            rhomb2Right.rotate45();
            rhomb2Left.rotate45();
            rhomb1Bottom.rotate45();
            rhomb1Top.rotate45();
        }
    };

    ambe.rhomb = function(ite, left, right) {
        // create the corner points and add polygon to structure data
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(tanPi8).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        Vector2.toPool(halfDiagonal);
        if (ite < maxIterations) {
            // continue iteration, create more points
            const bottomLeft = Vector2.lerp(left, ratio, bottom);
            const topLeft = Vector2.lerp(left, ratio, top);
            const bottomRight = Vector2.lerp(right, ratio, bottom);
            const topRight = Vector2.lerp(right, ratio, top);
            const centerRatio = tanPi8 / (2 + tanPi8);
            const centerLeft = Vector2.lerp(center, centerRatio, left);
            const centerRight = Vector2.lerp(center, centerRatio, right);
            // tiles of the new generation
            ambe.rhomb(ite + 1, left, centerLeft);
            ambe.rhomb(ite + 1, bottom, top);
            ambe.rhomb(ite + 1, right, centerRight);
            ambe.triangle(ite + 1, true, bottom, centerLeft, bottomLeft);
            ambe.triangle(ite + 1, false, top, centerLeft, topLeft);
            ambe.triangle(ite + 1, false, bottom, centerRight, bottomRight);
            ambe.triangle(ite + 1, true, top, centerRight, topRight);
        } else {
            // end iteration, make an image tile
            lines.addParallelogram(angle, left, right);
        }
    };

    ambe.triangle = function(ite, counterclockwise, a, b, c) {
        if (ite < maxIterations) {
            //create points for the new generation
            const ab = Vector2.lerp(a, ratio, b);
            const bc = Vector2.lerp(b, ratio, c);
            const ac = Vector2.lerp(a, hypoRatio, c);
            const ca = Vector2.lerp(c, hypoRatio, a);
            const m = Vector2.center(a, c);
            const center = Vector2.lerp(b, 1 / (1 + 1 / rt2), m);
            // tiles of the new generation
            ambe.rhomb(ite + 1, a, center);
            ambe.rhomb(ite + 1, b, ca);
            ambe.triangle(ite + 1, counterclockwise, b, center, ab);
            ambe.triangle(ite + 1, !counterclockwise, ca, center, ac);
            ambe.triangle(ite + 1, counterclockwise, c, ca, bc);
            Vector2.toPool(m);
        } else {
            if (counterclockwise) {
                lines.addRegularHalfPolygon(4, a, b);
            } else {
                lines.addRegularHalfPolygon(4, c, b);
            }
        }
    };

    /*
     * drawing the tiling
     */
    ambe.draw = function() {
        if (!lines) {
            ambe.start();
        }
        lines.draw();
    };

}());
