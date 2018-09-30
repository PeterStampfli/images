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
        for (var i = 0; i < 12; i++) {
            stampfli.rhomb(0, zero, right.clone());
            //     stampfli.triangle(0, bottom.clone(), rightMirrored.clone(), right.clone());
            //     stampfli.square(0,right.clone(),extra.clone());

            bottom.rotate(stampfli.angle);
            top.rotate(stampfli.angle);
            right.rotate(stampfli.angle);
            rightMirrored.rotate(stampfli.angle);
            extra.rotate(stampfli.angle);
        }
        //  stampfli.border(0,new Vector2(-3,0),new Vector2(3,0));
    };

    stampfli.border = function(ite, a, b) {
        console.log("border");
        const center = Vector2.center(a, b);
        const ey = Vector2.difference(b, a).scale(stampfli.ratio);
        const ey30 = ey.clone().rotate(stampfli.angle);
        const ey60 = ey30.clone().rotate(stampfli.angle);




        stampfli.rhomb(ite + 1, a, centerLeft);
        //  stampfli.triangle(ite+1,


    };


    stampfli.rhomb = function(ite, left, right) {
        // create the corner points
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(small12.angle * 0.5)).rotate90();

        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        iterateTiling.structure[ite].addPolygon(left, bottom, right, top);
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


        iterateTiling.structure[ite].addPolygon(a, b, c);
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points


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

        iterateTiling.structure[ite].addPolygon(left, bottom, right, top);
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points


        } else {
            // end iteration, make an image tile
            imageTiles.addRegularPolygon(4, left, bottom);
        }

    };


}());
