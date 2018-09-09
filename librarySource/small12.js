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
        const side = 2;
        const zero = new Vector2(0, 0);
        const bottom = new Vector2(side, 0);
        const top = bottom.clone().rotate(small12.angle);
        const right = new Vector2(side * (1 + small12.rt32), side * 0.5);
        const mLow = new Vector2(right.x, 0);
        const mHigh = mLow.clone().rotate(small12.angle);
        for (var i = 0; i < 12; i++) {
            small12.rhomb(0, zero, right);
            small12.triangleC(0, true, top, right, mHigh);
            //  small12.triangleC(0,false,bottom,right,mLow);


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
        if (iterateTiling.structure[ite].isNewPolygon(left, bottom, right, top)) {
            if (ite < iterateTiling.maxIterations) {
                // continue iteration, create more points
                const center = Vector2.center(left, right);
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
            } else {
                // end iteration, make an image tile
                imageTiles.addSymmetricParallelogram(small12.angle, left, right);
            }
        }
    };

    small12.triangleC = function(ite, counterclockwise, a, b, c) {
        if (iterateTiling.structure[ite].isNewPolygon(a, b, c)) {
            if (ite < iterateTiling.maxIterations) {
                const bc = Vector2.lerp(c, small12.ratio, b);
                const ca = Vector2.lerp(c, 1 / (3 + small12.rt3), a);
                const center = Vector2.difference(bc, c).add(ca);
                const ac = Vector2.lerp(a, 2 / (1 + small12.rt3), c);
                const ba = Vector2.lerp(b, small12.ratio, a);
                const ab = Vector2.lerp(a, small12.rt32 * small12.ratio, b);
                const m = Vector2.center(a, b);
            } else {
                if (counterclockwise) {
                    imageTiles.addSymmetricPolygon(3, a, b);
                } else {
                    imageTiles.addSymmetricPolygon(3, b, a);
                }
            }
        }
    };

    small12.quarterSquare = function(ite, corner, center) {
        const a = Vector2.difference(corner, center).scale(Math.sqrt(0.5)).rotate(Math.pi / 4).add(center);
        const b = Vector2.difference(corner, center).scale(Math.sqrt(0.5)).rotate(-Math.pi / 4).add(center);
        if (iterateTiling.structure[ite].isNewPolygon(center, b, corner, a)) {
            if (ite < iterateTiling.maxIterations) {
                const aCorner = Vector2.lerp(a, small12.ratio, corner);
                const bCorner = Vector2.lerp(b, small12.ratio, corner);
                const aCenter = Vector2.lerp(a, small12.ratio, center);
                const bCenter = Vector2.lerp(b, small12.ratio, center);
                const ab = Vector2.difference(aCenter, a).add(aCorner);
                const ba = Vector2.difference(bCenter, b).add(bCorner);
            } else {
                // corner of the full triangle
                a.scale(2).sub(corner);
                if (counterclockwise) {
                    imageTiles.addSymmetricPolygon(4, corner, a);
                } else {
                    imageTiles.addSymmetricPolygon(4, a, corner);
                }
            }
        }

    };



}());
