// doing the ammann beenker tiling using iteration methods ..
/* jshint esversion:6 */

/*
 *  setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-10, 10, -10);
* for the tiling
    imageTiles.dimensions(-10, 10, -10, 10, 0.5);
    imageTiles.allSymmetric = false;
    imageTiles.setMapping();
* maybe setting up other things
    Make.initializeMap = function() {};
* special output
    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(2);
        Draw.setColor("red");
        //  polygons.draw();
       // imageTiles.polygons.draw();
    };
* the iteration
    iterateTiling.initialPolygons = ambe.initialStar;
    iterateTiling.setMaxIterations(1);
    iterateTiling.generateStructure();
    */

var ambe = {};


(function() {
    "use strict";

    ambe.rt2 = Math.sqrt(2);
    ambe.angle = Math.PI / 4;
    ambe.ratio = 1 / (1 + Math.sqrt(2));


    ambe.start = function() {
        const side = 3.5;
        const zero = new Vector2(0, 0);
        const rhomb1Right = new Vector2(side * (1 + 1 / ambe.rt2), side / ambe.rt2);
        const rhomb2Right = new Vector2(side * (1 + ambe.rt2), 0);
        const rhomb2Left = new Vector2(rhomb1Right.x, rhomb1Right.x);
        const rhomb1Bottom = new Vector2(side, 0);
        const rhomb1Top = new Vector2(side / ambe.rt2, side / ambe.rt2);
        for (var i = 0; i < 8; i++) {
            ambe.rhomb(0, true, zero, rhomb1Right.clone());
            ambe.rhomb(0, false, rhomb2Right.clone(), rhomb2Left.clone());
            ambe.triangle(0, false, true, rhomb2Right.clone(), rhomb1Right.clone(), rhomb1Bottom.clone());
            ambe.triangle(0, false, false, rhomb2Left.clone(), rhomb1Right.clone(), rhomb1Top.clone());
            rhomb1Right.rotate(ambe.angle);
            rhomb2Right.rotate(ambe.angle);
            rhomb2Left.rotate(ambe.angle);
            rhomb1Bottom.rotate(ambe.angle);
            rhomb1Top.rotate(ambe.angle);
        }
    };

    ambe.rhomb = function(ite, firstCornerMapsToZero, left, right) {
        // create the corner points
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(ambe.angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        iterateTiling.structure[ite].addPolygon(left, bottom, right, top);

        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points
            const bottomLeft = Vector2.lerp(left, ambe.ratio, bottom);
            const topLeft = Vector2.lerp(left, ambe.ratio, top);
            const bottomRight = Vector2.lerp(right, ambe.ratio, bottom);
            const topRight = Vector2.lerp(right, ambe.ratio, top);
            const centerRatio = Math.tan(Math.PI / 8) / (2 + Math.tan(Math.PI / 8));
            const centerLeft = Vector2.lerp(center, centerRatio, left);
            const centerRight = Vector2.lerp(center, centerRatio, right);
            // tiles of the new generation
            ambe.rhomb(ite + 1, firstCornerMapsToZero, left, centerLeft);
            ambe.rhomb(ite + 1, !firstCornerMapsToZero, bottom, top);
            ambe.rhomb(ite + 1, firstCornerMapsToZero, right, centerRight);
            ambe.triangle(ite + 1, !firstCornerMapsToZero, true, bottom, centerLeft, bottomLeft);
            ambe.triangle(ite + 1, !firstCornerMapsToZero, false, top, centerLeft, topLeft);
            ambe.triangle(ite + 1, !firstCornerMapsToZero, false, bottom, centerRight, bottomRight);
            ambe.triangle(ite + 1, !firstCornerMapsToZero, true, top, centerRight, topRight);
        } else {
            // end iteration, make an image tile
            imageTiles.addParallelogram(Math.PI / 4, left, right, firstCornerMapsToZero);
        }
    };

    ambe.triangle = function(ite, firstCornerMapsToZero, counterclockwise, a, b, c) {
        if (counterclockwise) {
            iterateTiling.structure[ite].addPolygon(a, b, c);
        } else {
            iterateTiling.structure[ite].addPolygon(c, b, a);
        }
        if (ite < iterateTiling.maxIterations) {
            //create points for the new generation
            const ab = Vector2.lerp(a, ambe.ratio, b);
            const bc = Vector2.lerp(b, ambe.ratio, c);
            const hypoRatio = 1 / (ambe.rt2 + 2);
            const ac = Vector2.lerp(a, hypoRatio, c);
            const ca = Vector2.lerp(c, hypoRatio, a);
            const m = Vector2.center(a, c);
            const center = Vector2.lerp(b, 1 / (1 + 1 / ambe.rt2), m);
            // tiles of the new generation
            ambe.rhomb(ite + 1, firstCornerMapsToZero, a, center);
            ambe.rhomb(ite + 1, !firstCornerMapsToZero, b, ca);
            ambe.triangle(ite + 1, !firstCornerMapsToZero, counterclockwise, b, center, ab);
            ambe.triangle(ite + 1, !firstCornerMapsToZero, !counterclockwise, ca, center, ac);
            ambe.triangle(ite + 1, firstCornerMapsToZero, counterclockwise, c, ca, bc);
        } else {
            if (counterclockwise) {
                imageTiles.addRegularHalfPolygon(4, a, b, firstCornerMapsToZero);
            } else {
                imageTiles.addRegularHalfPolygon(4, c, b, firstCornerMapsToZero);
            }
        }
    };

    // choosing the different "colorings"

    /**
     * choose the "two color" mode for image tiles
     * @method ambe.twoColorImage
     */
    ambe.twoColorImage = function() {
        imageTiles.addParallelogram = imageTiles.addTwoColorParallelogram;
        imageTiles.addRegularPolygon = imageTiles.addTwoColorPolygon;
        imageTiles.addRegularHalfPolygon = imageTiles.addTwoColorHalfPolygon;
        Polygon.mapWithShiftRotateMirror();
    };

    /**
     * choose "symmetric" image without shear
     * @method ambe.straightSymmetricImage
     */
    ambe.straightSymmetricImage = function() {
        imageTiles.addParallelogram = imageTiles.addStraightSymmetricParallelogram;
        imageTiles.addRegularPolygon = imageTiles.addSymmetricPolygon;
        imageTiles.addRegularHalfPolygon = imageTiles.addSymmetricHalfPolygon;
        Polygon.mapWithShiftRotateMirror();

    };

    /**
     * choose "sheared symmetric" image
     * @method ambe.shearedSymmetricImage
     */
    ambe.shearedSymmetricImage = function() {
        imageTiles.addParallelogram = imageTiles.addShearedSymmetricParallelogram;
        imageTiles.addRegularPolygon = imageTiles.addSymmetricPolygon;
        imageTiles.addRegularHalfPolygon = imageTiles.addSymmetricHalfPolygon;
        Polygon.mapWithShiftRotateMirrorShear();

    };


}());
