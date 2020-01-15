// eight fold rotational symmetry with kites

/* jshint esversion:6 */

var squareTriangle8 = {};

(function() {
    "use strict";
    const tanPI8 = Math.sqrt(2) - 1;
    const rt2 = Math.sqrt(2);

    squareTriangle8.start = function() {

        const side = iterateTiling.initialSpaceLimit / (1 + 1 / rt2);
        const zero = new Vector2(0, 0);
        const rhomb1Right = new Vector2(side * (1 + 1 / rt2), side / rt2);
        const below = new Vector2(side * (1 + 1 / rt2), -side / rt2);
        const rhomb2Right = new Vector2(side * (1 + rt2), 0);
        const rhomb1Bottom = new Vector2(side, 0);
        const rhomb1Top = new Vector2(side / rt2, side / rt2);
        for (var i = 0; i < 0; i++) {
            kite8.halfRhomb(0, zero, rhomb1Bottom.clone(), rhomb1Right.clone());
            kite8.halfRhomb(0, rhomb1Right.clone(), rhomb1Top.clone(), zero);
            kite8.halfSquare(0, rhomb1Right.clone(), rhomb1Bottom.clone(), below.clone());
            if (i & 1) {
                kite8.halfSquare(0, below.clone(), rhomb2Right.clone(), rhomb1Right.clone());
            }
            rhomb1Right.rotate45();
            rhomb2Right.rotate45();
            rhomb1Bottom.rotate45();
            rhomb1Top.rotate45();
            below.rotate45();
        }
        squareTriangle8.quarterSquare(0, new Vector2(8, 0), new Vector2(0, 8), new Vector2(-8, 0));
        const xKite = 1 / rt2 / (1 + rt2);
        //    kite8.halfKiteLeft(0,new Vector2(8,0),new Vector2(-8+16*xKite,-16*xKite),new Vector2(-8,0)); 
        // kite8.halfKiteRight(0,new Vector2(8,0),new Vector2(-8+16*xKite,16*xKite),new Vector2(-8,0));
        const xRhomb = 1 / rt2 / (2 + rt2);
        //    kite8.halfRhomb(0,new Vector2(-8,0),new Vector2(0,-16*xRhomb),new Vector2(8,0));
    };

    squareTriangle8.quarterSquare = function(ite, a, b, c) {
        console.log("qs");
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        if (ite < iterateTiling.maxIterations) {
            const ac = Vector2.middle(a, c);
            const ab = Vector2.lerp(b, 1 - 1 / rt2, b);
            const bc = Vector2.lerp(b, 1 - 1 / rt2, c);
            const center = Vector2.lerp(ac, tanPI8, b);
            squareTriangle8.quarterSquare(ite + 1, bc, center, ab);

        } else {


        }
    };

    squareTriangle8.triangleLeft = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        const ac = Vector2.lerp(a, 1 / (1 + rt2), c);
        if (ite < iterateTiling.maxIterations) {
            kite8.halfSquare(ite + 1, c, b, ac);
            kite8.halfRhomb(ite + 1, a, ac, b);
        } else {
            const center = Vector2.lerp(c, 0.4, a);
            const d = Vector2.sum(c, ac).sub(b);
            imageTiles.addSingleColorHalfQuad(c, b, a, center);
        }
    };

    squareTriangle8.triangleRight = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        const ac = Vector2.lerp(a, 1 / (1 + rt2), c);
        if (ite < iterateTiling.maxIterations) {
            kite8.halfSquare(ite + 1, ac, b, c);
            kite8.halfRhomb(ite + 1, b, ac, a);
        } else {
            const center = Vector2.lerp(c, 0.4, a);
            const d = Vector2.sum(c, ac).sub(b);
            imageTiles.addSingleColorHalfQuad(a, b, c, center);
        }
    };



}());
