// doing the small tiling with 12 fold rotational symmetry using iteration methods ..
/* jshint esversion:6 */

var small12 = {};


(function() {
    "use strict";

    small12.rt3 = Math.sqrt(3);
    small12.rt32 = small12.rt3 / 2;
    small12.angle = Math.PI / 6;
    small12.ratio = 1 / (1 + small12.rt3);

    // starting the iteration with a dodecagon
    small12.start = function() {
        const side = 4;
        const zero = new Vector2(0, 0);
        const bottom = new Vector2(side, 0);
        const top = bottom.clone().rotate(small12.angle);
        const right = new Vector2(side * (1 + small12.rt32), side * 0.5);
        const mLow = new Vector2(right.x, 0);
        const mHigh = mLow.clone().rotate(small12.angle);
        for (var i = 0; i < 12; i++) {
            small12.rhomb(0, zero, right.clone());
            small12.triangleA(0, true, top.clone(), right.clone(), mHigh.clone());
            small12.triangleA(0, false, bottom.clone(), right.clone(), mLow.clone());

            // test
            //     small12.triangleB(0, true, top, right, mHigh);
            //     small12.triangleA(0,false,bottom,right,mLow);
            //    small12.triangleC(0,false,bottom,right,mLow);
            //    small12.quarterSquare(0,zero,right);
            bottom.rotate(small12.angle);
            top.rotate(small12.angle);
            right.rotate(small12.angle);
            mLow.rotate(small12.angle);
            mHigh.rotate(small12.angle);
        }
    };

    small12.rhomb = function(ite, left, right) {
        // create the corner points
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(small12.angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        iterateTiling.structure[ite].addPolygon(left, bottom, right, top);
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points
            const leftBottom = Vector2.lerp(left, small12.ratio, bottom);
            const bottomLeft = Vector2.lerp(bottom, small12.rt32 * small12.ratio, left);
            const rightBottom = Vector2.lerp(right, small12.ratio, bottom);
            const bottomRight = Vector2.lerp(bottom, small12.rt32 * small12.ratio, right);
            const leftTop = Vector2.lerp(left, small12.ratio, top);
            const topLeft = Vector2.lerp(top, small12.rt32 * small12.ratio, left);
            const rightTop = Vector2.lerp(right, small12.ratio, top);
            const topRight = Vector2.lerp(top, small12.rt32 * small12.ratio, right);
            const centerLeftRatio = 1 / (1 + Math.sqrt(2) * 2 * Fast.cos(Math.PI / 12));
            const centerLeft = Vector2.lerp(center, centerLeftRatio, left);
            const centerRight = Vector2.lerp(center, centerLeftRatio, right);
            // iterating tiles
            small12.rhomb(ite + 1, left, centerLeft);
            small12.rhomb(ite + 1, right, centerRight);
            small12.triangleA(ite + 1, false, leftBottom, centerLeft, bottomLeft);
            small12.triangleA(ite + 1, true, leftTop, centerLeft, topLeft);
            small12.triangleA(ite + 1, true, rightBottom, centerRight, bottomRight);
            small12.triangleA(ite + 1, false, rightTop, centerRight, topRight);
            small12.triangleC(ite + 1, true, bottom, centerLeft, bottomLeft);
            small12.triangleC(ite + 1, false, top, centerLeft, topLeft);
            small12.triangleC(ite + 1, false, bottom, centerRight, bottomRight);
            small12.triangleC(ite + 1, true, top, centerRight, topRight);
            small12.quarterSquare(ite + 1, bottom, center);
            small12.quarterSquare(ite + 1, top, center);
            small12.quarterSquare(ite + 1, centerLeft, center);
            small12.quarterSquare(ite + 1, centerRight, center);
        } else {
            // end iteration, make an image tile
            imageTiles.addParallelogram(small12.angle, left, right);
        }

    };

    small12.halfTriangleImage = function(counterclockwise, a, b, c) {
        const ab = Vector2.center(a, b);
        const ac = Vector2.lerp(a, 0.66666, c);
        console.log(counterclockwise);
        if (counterclockwise) {
            imageTiles.polygons.addPolygon(a, ab, ac).addBaseline(a, ab);
            imageTiles.polygons.addPolygon(b, ac, ab).addBaseline(b, ab);
            imageTiles.polygons.addPolygon(b, c, ac).addBaseline(b, c);
        } else {
            imageTiles.polygons.addPolygon(ab, a, ac).addBaseline(a, ab);
            imageTiles.polygons.addPolygon(ac, b, ab).addBaseline(b, ab);
            imageTiles.polygons.addPolygon(c, b, ac).addBaseline(b, c);
        }
    };

    small12.triangleA = function(ite, counterclockwise, a, b, c) {
        iterateTiling.structure[ite].addPolygon(a, b, c);
        if (ite < iterateTiling.maxIterations) {
            const bc = Vector2.lerp(c, small12.ratio, b);
            const ca = Vector2.lerp(c, 1 / (3 + small12.rt3), a);
            const center = Vector2.difference(bc, c).add(ca);
            const ac = Vector2.lerp(a, 2 / (3 + small12.rt3), c);
            const ba = Vector2.lerp(b, small12.ratio, a);
            const ab = Vector2.lerp(a, small12.rt32 * small12.ratio, b);
            // iterating tiles
            // same for all
            small12.quarterSquare(ite + 1, center, c);
            small12.triangleB(ite + 1, counterclockwise, ac, center, ca);
            small12.triangleB(ite + 1, !counterclockwise, b, center, bc);
            // different
            small12.rhomb(ite + 1, b, ac);
            small12.triangleA(ite + 1, counterclockwise, ba, ac, ab);
            small12.triangleB(ite + 1, !counterclockwise, a, ac, ab);
        } else {
            small12.halfTriangleImage(counterclockwise, a, b, c);
        }
    };

    small12.triangleB = function(ite, counterclockwise, a, b, c) {
        iterateTiling.structure[ite].addPolygon(a, b, c);
        if (ite < iterateTiling.maxIterations) {
            const bc = Vector2.lerp(c, small12.ratio, b);
            const ca = Vector2.lerp(c, 1 / (3 + small12.rt3), a);
            const center = Vector2.difference(bc, c).add(ca);
            const ac = Vector2.lerp(a, 2 / (3 + small12.rt3), c);
            const ba = Vector2.lerp(b, small12.rt32 * small12.ratio, a);
            const ab = Vector2.lerp(a, small12.ratio, b);
            // iterating tiles
            // same for all
            small12.quarterSquare(ite + 1, center, c);
            small12.triangleA(ite + 1, counterclockwise, ac, center, ca);
            small12.triangleB(ite + 1, !counterclockwise, b, center, bc);
            // different
            small12.rhomb(ite + 1, a, center);
            small12.triangleA(ite + 1, !counterclockwise, ab, center, ba);
            small12.triangleC(ite + 1, counterclockwise, b, center, ba);
        } else {
            small12.halfTriangleImage(counterclockwise, a, b, c);
        }

    };

    small12.triangleC = function(ite, counterclockwise, a, b, c) {
        iterateTiling.structure[ite].addPolygon(a, b, c);
        if (ite < iterateTiling.maxIterations) {
            const bc = Vector2.lerp(c, small12.ratio, b);
            const ca = Vector2.lerp(c, 1 / (3 + small12.rt3), a);
            const center = Vector2.difference(bc, c).add(ca);
            const ac = Vector2.lerp(a, 2 / (3 + small12.rt3), c);
            const ba = Vector2.lerp(b, small12.rt32 * small12.ratio, a);
            const ab = Vector2.lerp(a, small12.rt32 * small12.ratio, b);
            const m = Vector2.center(a, b);
            // iterating tiles
            // same for all
            small12.quarterSquare(ite + 1, center, c);
            small12.triangleC(ite + 1, counterclockwise, ac, center, ca);
            small12.triangleB(ite + 1, !counterclockwise, b, center, bc);
            // different
            small12.triangleB(ite + 1, !counterclockwise, a, ac, ab);
            small12.triangleB(ite + 1, counterclockwise, b, center, ba);
            small12.quarterSquare(ite + 1, ac, m);
            small12.quarterSquare(ite + 1, center, m);
        } else {
            small12.halfTriangleImage(counterclockwise, a, b, c);
        }
    };

    small12.quarterSquare = function(ite, corner, center) {
        const a = Vector2.difference(corner, center).scale(Math.sqrt(0.5)).rotate(Math.PI / 4).add(center);
        const b = Vector2.difference(corner, center).scale(Math.sqrt(0.5)).rotate(-Math.PI / 4).add(center);
        iterateTiling.structure[ite].addPolygon(center, b, corner, a);
        if (ite < iterateTiling.maxIterations) {
            const aCorner = Vector2.lerp(a, small12.ratio, corner);
            const bCorner = Vector2.lerp(b, small12.ratio, corner);
            const aCenter = Vector2.lerp(a, small12.ratio, center);
            const bCenter = Vector2.lerp(b, small12.ratio, center);
            const ab = Vector2.difference(aCenter, a).add(aCorner);
            const ba = Vector2.difference(bCenter, b).add(bCorner);
            // iterating tiles
            small12.rhomb(ite + 1, corner, center);
            small12.quarterSquare(ite + 1, ab, a);
            small12.quarterSquare(ite + 1, ba, b);
            small12.triangleB(ite + 1, false, corner, ab, aCorner);
            small12.triangleB(ite + 1, true, center, ab, aCenter);
            small12.triangleB(ite + 1, false, center, ba, bCenter);
            small12.triangleB(ite + 1, true, corner, ba, bCorner);
        } else {
            // a.scale(2).sub(corner);
            // imageTiles.addSymmetricPolygon(4, corner, a);
            imageTiles.polygons.addPolygon(corner, a, center).addBaseline(corner, a);
            imageTiles.polygons.addPolygon(b, corner, center).addBaseline(corner, b);

        }
    };

}());
