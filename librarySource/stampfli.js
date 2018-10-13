// doing the stampfli tiling with 12 fold rotational symmetry using iteration methods ..
/* jshint esversion:6 */

var stampfli = {};


(function() {
    "use strict";

    stampfli.rt3 = Math.sqrt(3);
    stampfli.rt32 = stampfli.rt3 / 2;
    stampfli.angle = Math.PI / 6;
    stampfli.ratio = 1 / (2 + stampfli.rt3);



    // starting the iteration with a dodecagon
    stampfli.start = function() {
        const side = 4;
        const zero = new Vector2(0, 0);
        const bottom = new Vector2(side, 0);
        const top = bottom.clone().rotate(stampfli.angle);
        const right = new Vector2(side * (1 + stampfli.rt32), side * 0.5);
        const rightMirrored = new Vector2(side * (1 + stampfli.rt32), -side * 0.5);

        const extra = new Vector2(side * (2 + stampfli.rt32), -side * 0.5);
        for (var i = 0; i < 1; i++) {
            // stampfli.rhomb(0, zero, right.clone());
            //      stampfli.triangle(0, bottom.clone(), rightMirrored.clone(), right.clone());
            stampfli.square(0, zero, new Vector2(8, 8));

            bottom.rotate(stampfli.angle);
            top.rotate(stampfli.angle);
            right.rotate(stampfli.angle);
            rightMirrored.rotate(stampfli.angle);
            extra.rotate(stampfli.angle);
        }
        //  stampfli.border(0,new Vector2(-3,0),new Vector2(3,0));
    };


    stampfli.rhomb = function(ite, left, right) {
        // create the corner points
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(small12.angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        iterateTiling.structure[ite].push(new Polygon(left, bottom, right, top));
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points
            const er = Vector2.difference(bottom, left).scale(stampfli.ratio);
            const er2 = er.clone().rotate(-stampfli.angle);
            const el = Vector2.difference(top, left).scale(stampfli.ratio);
            const el2 = el.clone().rotate(stampfli.angle);
            const leftBottom = Vector2.sum(left, er);
            const leftCenter = Vector2.sum(leftBottom, el);
            stampfli.rhomb(ite + 1, left, leftCenter);
            stampfli.triangle(ite + 1, leftBottom, Vector2.sum(leftBottom, er2), leftCenter);
            const topLeft = Vector2.difference(top, el);
            stampfli.triangle(ite + 1, leftCenter, topLeft, Vector2.difference(topLeft, er));
            const bottomLeft = Vector2.sum(leftCenter, er2);
            const centerLeft = Vector2.sum(bottomLeft, el2);
            stampfli.square(ite + 1, leftCenter, centerLeft);
            stampfli.triangle(ite + 1, bottomLeft, bottom, centerLeft);
            stampfli.triangle(ite + 1, topLeft, centerLeft, top);
            stampfli.rhomb(ite + 1, top, bottom);
            const topRight = Vector2.sum(top, er);
            const centerRight = Vector2.difference(topRight, el2);
            stampfli.triangle(ite + 1, top, centerRight, topRight);
            const bottomRight = Vector2.sum(bottom, el);
            stampfli.triangle(ite + 1, bottom, bottomRight, centerRight);
            const rightCenter = Vector2.sum(topRight, er2);
            stampfli.square(ite + 1, centerRight, rightCenter);
            stampfli.triangle(ite + 1, bottomRight, Vector2.sum(bottomRight, er), rightCenter);
            stampfli.rhomb(ite + 1, right, rightCenter);
            stampfli.triangle(ite + 1, rightCenter, Vector2.difference(right, er), Vector2.sum(topRight, el));
        } else {
            // end iteration, make an image tile
            imageTiles.addParallelogram(stampfli.angle, left, right);
        }
    };

    stampfli.triangle = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new Polygon(a, b, c));
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points
            const ab = Vector2.lerp(a, stampfli.ratio, b);
            const er = Vector2.difference(ab, a);
            const er2 = er.clone().rotate(-stampfli.angle);
            const e = er.clone().rotate(stampfli.angle);
            const el = e.clone().rotate(stampfli.angle);
            const el2 = el.clone().rotate(stampfli.angle);
            const ac = Vector2.sum(el, a);
            const am = Vector2.sum(e, a);
            const mc = Vector2.sum(er, am);
            const mb = Vector2.sum(el, am);
            stampfli.rhomb(ite + 1, a, mc);
            stampfli.rhomb(ite + 1, a, mb);
            stampfli.triangle(ite + 1, am, mc, mb);
            const caOut = Vector2.difference(mb, er2);
            const ca = Vector2.sum(caOut, e);
            stampfli.triangle(ite + 1, mb, ca, caOut);
            stampfli.rhomb(ite + 1, c, mb);
            const cm = Vector2.sum(el, mb);
            const ma = Vector2.sum(mb, er);
            stampfli.rhomb(ite + 1, c, ma);
            stampfli.triangle(ite + 1, cm, mb, ma);
            stampfli.triangle(ite + 1, ma, mb, mc);
            stampfli.triangle(ite + 1, ma, Vector2.sum(ma, er2), Vector2.sum(ma, e));
            stampfli.rhomb(ite + 1, b, ma);
            stampfli.rhomb(ite + 1, b, mc);
            stampfli.triangle(ite + 1, ma, mc, Vector2.sum(mc, er));
            stampfli.triangle(ite + 1, mc, ab, Vector2.sum(ab, er2));
        } else {
            // end iteration, make an image tile
            imageTiles.addRegularPolygon(3, a, b);
        }
    };

    stampfli.square = function(ite, left, right) {
        // create the corner points
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.rotate90();

        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);

        iterateTiling.structure[ite].push(new Polygon(left, bottom, right, top));
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points

            const leftBottom = Vector2.lerp(left, stampfli.ratio, bottom);


            const er2 = Vector2.difference(leftBottom, left);
            const er = er2.clone().rotate(stampfli.angle);
            const el = er.clone().rotate(stampfli.angle);
            const el2 = el.clone().rotate(stampfli.angle);

            const leftTop = Vector2.sum(left, el2);

            const bottomLeft = Vector2.difference(bottom, er2);
            const topLeft = Vector2.difference(top, el2);
            const topRight = Vector2.sum(top, er2);
            const rightTop = Vector2.difference(right, er2);
            const bottomRight = Vector2.sum(bottom, el2);
            const rightBottom = Vector2.difference(right, el2);
            const leftBottomCenter = Vector2.sum(leftBottom, er);
            const centerBottom = Vector2.sum(leftBottomCenter, el);
            const rightBottomCenter = Vector2.sum(centerBottom, er);
            const centerRight = Vector2.sum(centerBottom, el2);
            const centerLeft = Vector2.difference(centerBottom, er2);
            const centerTop = Vector2.sum(centerLeft, el2);
            const rightTopCenter = Vector2.sum(centerTop, el);
            const leftTopCenter = Vector2.sum(leftTop, el);

            stampfli.rhomb(ite + 1, left, leftBottomCenter);
            stampfli.rhomb(ite + 1, left, centerLeft);
            stampfli.rhomb(ite + 1, left, leftTopCenter);
            stampfli.triangle(ite + 1, leftBottom, Vector2.difference(leftBottomCenter, el2), leftBottomCenter);
            stampfli.triangle(ite + 1, centerLeft, leftTopCenter, Vector2.difference(leftTopCenter, el2));
            stampfli.triangle(ite + 1, centerLeft, Vector2.difference(leftBottomCenter, er2), leftBottomCenter);
            stampfli.rhomb(ite + 1, centerBottom, bottom);
            stampfli.rhomb(ite + 1, leftBottomCenter, bottom);
            stampfli.rhomb(ite + 1, rightBottomCenter, bottom);
            stampfli.triangle(ite + 1, bottomRight, Vector2.sum(rightBottomCenter, er2), rightBottomCenter);
            stampfli.triangle(ite + 1, centerBottom, leftBottomCenter, Vector2.sum(leftBottomCenter, er2));
            stampfli.triangle(ite + 1, centerBottom, Vector2.difference(rightBottomCenter, el2), rightBottomCenter);

            stampfli.rhomb(ite + 1, right, rightBottomCenter);
            stampfli.rhomb(ite + 1, right, centerRight);
            stampfli.rhomb(ite + 1, right, rightTopCenter);
            stampfli.triangle(ite + 1, rightTopCenter, rightTop, Vector2.sum(rightTopCenter, el2));
            stampfli.triangle(ite + 1, centerRight, rightBottomCenter, Vector2.sum(rightBottomCenter, el2));
            stampfli.triangle(ite + 1, centerRight, Vector2.sum(centerRight, el), rightTopCenter);
            stampfli.rhomb(ite + 1, top, rightTopCenter);
            stampfli.rhomb(ite + 1, top, centerTop);
            stampfli.rhomb(ite + 1, top, leftTopCenter);
            stampfli.triangle(ite + 1, topLeft, Vector2.difference(topLeft, el), leftTopCenter);
            stampfli.triangle(ite + 1, centerTop, Vector2.sum(leftTopCenter, el2), leftTopCenter);
            stampfli.triangle(ite + 1, centerTop, rightTopCenter, Vector2.difference(rightTopCenter, er2));

            stampfli.square(ite + 1, centerLeft, centerRight);
            stampfli.triangle(ite + 1, centerBottom, centerLeft, leftBottomCenter);
            stampfli.triangle(ite + 1, centerRight, centerBottom, rightBottomCenter);
            stampfli.triangle(ite + 1, centerRight, rightTopCenter, centerTop);

            stampfli.triangle(ite + 1, centerTop, leftTopCenter, centerLeft);


        } else {
            // end iteration, make an image tile
            imageTiles.addRegularPolygon(4, left, bottom);
        }

    };


}());
