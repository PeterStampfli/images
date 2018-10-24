// eight fold rotational symmetry with kites

/* jshint esversion:6 */

var kite8 = {};

(function() {
    "use strict";
    const tanPI8 = Math.sqrt(2) - 1;
    const rt2 = Math.sqrt(2);

    kite8.start = function() {
        const side = iterateTiling.initialSpaceLimit / (1 + 1 / rt2);
        const zero = new Vector2(0, 0);
        const rhomb1Right = new Vector2(side * (1 + 1 / rt2), side / rt2);
        const below = new Vector2(side * (1 + 1 / rt2), -side / rt2);
        const rhomb2Right = new Vector2(side * (1 + rt2), 0);
        const rhomb1Bottom = new Vector2(side, 0);
        const rhomb1Top = new Vector2(side / rt2, side / rt2);
        for (var i = 0; i < 8; i++) {
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
        //  kite8.halfSquare(0, new Vector2(-8, 8), new Vector2(-8, -8), new Vector2(8, -8));
        const xKite = 1 / rt2 / (1 + rt2);
        //    kite8.halfKiteLeft(0,new Vector2(8,0),new Vector2(-8+16*xKite,-16*xKite),new Vector2(-8,0)); 
        // kite8.halfKiteRight(0,new Vector2(8,0),new Vector2(-8+16*xKite,16*xKite),new Vector2(-8,0));
        const xRhomb = 1 / rt2 / (2 + rt2);
        //    kite8.halfRhomb(0,new Vector2(-8,0),new Vector2(0,-16*xRhomb),new Vector2(8,0));
    };

    kite8.halfSquare = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        if (ite < iterateTiling.maxIterations) {
            const ac = Vector2.middle(a, c);
            const ab = Vector2.middle(a, b).lerp(tanPI8, ac);
            const bc = Vector2.middle(b, c).lerp(tanPI8, ac);
            kite8.halfRhomb(ite + 1, b, ab, a);
            kite8.halfRhomb(ite + 1, c, bc, b);
            kite8.halfKiteLeft(ite + 1, b, ab, ac);
            kite8.halfKiteRight(ite + 1, b, bc, ac);
            kite8.halfKiteLeft(ite + 1, c, bc, ac);
            kite8.halfKiteRight(ite + 1, a, ab, ac);
        } else {
            imageTiles.addRegularHalfPolygon(4, a, b);
        }
    };

    kite8.halfKiteLeft = function(ite, a, b, c) {
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

    kite8.halfKiteRight = function(ite, a, b, c) {
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

    kite8.halfRhomb = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        const ac = Vector2.lerp(a, 1 / (2 + rt2), c);
        const ca = Vector2.lerp(c, 1 / (2 + rt2), a);
        if (ite < iterateTiling.maxIterations) {
            kite8.halfSquare(ite + 1, ac, b, ca);
            kite8.halfRhomb(ite + 1, b, ac, a);
            kite8.halfRhomb(ite + 1, c, ca, b);
        } else {
            const ab = Vector2.middle(a, b);
            const bc = Vector2.middle(b, c);
            const center = Vector2.middle(a, c);
            imageTiles.polygons.push(new Polygon(a, ab, ac).addBaseline(a, ab));
            imageTiles.polygons.push(new Polygon(ab, b, center, ac).addBaseline(b, ab));
            imageTiles.polygons.push(new Polygon(b, bc, ca, center).addBaseline(b, bc));
            imageTiles.polygons.push(new Polygon(bc, c, ca).addBaseline(c, bc));
        }
    };

}());
