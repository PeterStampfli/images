// eight folr rotational symmetry with octagons
// use things defined for ammann-beenker
/* jshint esversion:6 */


var octagon = {};


(function() {
    "use strict";

    octagon.ratio = 1 / (2 + Math.sqrt(2));



    octagon.start = function() {
        const side = 3.5;
        const zero = new Vector2(0, 0);
        const rhomb1Right = new Vector2(side * (1 + 1 / ambe.rt2), side / ambe.rt2);
        const rhomb1RightMirrored = new Vector2(side * (1 + 1 / ambe.rt2), -side / ambe.rt2);
        const rhomb1Bottom = new Vector2(side, 0);
        for (var i = 0; i < 8; i++) {
            octagon.rhomb(0, zero, rhomb1Right.clone());
            octagon.triangle(0, rhomb1Right.clone(), rhomb1Bottom.clone(), rhomb1RightMirrored.clone());
            rhomb1Right.rotate(ambe.angle);
            rhomb1RightMirrored.rotate(ambe.angle);
            rhomb1Bottom.rotate(ambe.angle);
        }
        //  octagon.octagon(0,new Vector2(6,0),new Vector2(9,0));
    };





    octagon.rhomb = function(ite, left, right) {
        // create the corner points
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(ambe.angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        iterateTiling.structure[ite].addPolygon(left, bottom, right, top);
        if (ite < iterateTiling.maxIterations) {
            const leftBottom = Vector2.lerp(left, octagon.ratio, bottom);
            const leftTop = Vector2.lerp(left, octagon.ratio, top);
            const leftCenter = Vector2.sum(leftBottom, leftTop).sub(left);
            octagon.rhomb(ite + 1, left, leftCenter);
            const bottomLeft = Vector2.lerp(bottom, octagon.ratio, left);
            const topLeft = Vector2.lerp(top, octagon.ratio, left);
            octagon.triangle(ite + 1, bottomLeft, leftCenter, leftBottom);
            octagon.triangle(ite + 1, leftTop, leftCenter, topLeft);
            const rightBottom = Vector2.lerp(right, octagon.ratio, bottom);
            const rightTop = Vector2.lerp(right, octagon.ratio, top);
            const rightCenter = Vector2.sum(rightBottom, rightTop).sub(right);
            octagon.rhomb(ite + 1, right, rightCenter);
            const bottomRight = Vector2.lerp(bottom, octagon.ratio, right);
            const topRight = Vector2.lerp(top, octagon.ratio, right);
            octagon.triangle(ite + 1, rightBottom, rightCenter, bottomRight);
            octagon.triangle(ite + 1, topRight, rightCenter, rightTop);
            octagon.octagon(ite + 1, leftCenter, rightCenter);
        } else {
            // end iteration, make an image tile
            imageTiles.addParallelogram(Math.PI / 4, left, right);
        }
    };

    // 45,90,45 triangle counterclockwise
    octagon.triangle = function(ite, a, b, c) {
        iterateTiling.structure[ite].addPolygon(a, b, c);

        if (ite < iterateTiling.maxIterations) {
            //create points for the new generation
            const ab = Vector2.lerp(a, octagon.ratio, b);
            const ba = Vector2.lerp(b, octagon.ratio, a);
            const bc = Vector2.lerp(b, octagon.ratio, c);
            const cb = Vector2.lerp(c, octagon.ratio, b);
            const center = Vector2.center(a, c);
            const aCenter = Vector2.lerp(center, ambe.ratio, a);
            const bCenter = Vector2.lerp(center, ambe.ratio, b);
            const cCenter = Vector2.lerp(center, ambe.ratio, c);
            let bcCenter = Vector2.difference(center, cCenter).add(cb);
            let abCenter = Vector2.difference(center, aCenter).add(ab);


        } else {
            imageTiles.addRegularHalfPolygon(4, a, b);

        }
    };

    octagon.octagon = function(ite, left, right) {
        // iterateTiling.structure[ite].addPolygon(a, b, c);
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        //    generate all corner points, begins with right
        const corners = new Array(8);
        for (var i = 0; i < 8; i++) {
            corners[i] = Vector2.sum(center, halfDiagonal);
            halfDiagonal.rotate(ambe.angle);
        }
        iterateTiling.structure[ite].add(new Polygon(corners));



        if (ite < iterateTiling.maxIterations) {
            //create points for the new generation


        } else {
            imageTiles.addRegularPolygon(8, corners[0], corners[1]);
        }
    };

}());
