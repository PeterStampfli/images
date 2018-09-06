// doing the ammann beenker tiling using iteration methods ..
/* jshint esversion:6 */


ambe = {};
ambe.rt2 = Math.sqrt(2);
ambe.angle = Math.PI / 4;
ambe.ratio = 1 / (1 + Math.sqrt(2));

console.log("hi");



ambe.initialStar = function() {
    const zero = new Vector2(0, 0);
    const side = 4;
    const angle = Math.PI / 4;
    const rhomb1Left = new Vector2(side * (1 + 1 / ambe.rt2), side / ambe.rt2);
    const rhomb2Right = new Vector2(side * (1 + ambe.rt2), 0);
    const rhomb2Left = new Vector2(rhomb1Left.x, rhomb1Left.x);
    const square1A = new Vector2(side, 0);
    for (var i = 0; i < 1; i++) {

        ambe.rhomb(0, true, zero, rhomb1Left);
        //   ambe.rhomb(0,false, rhomb2Right,rhomb2Left);

        // two quarters finally
        // imageTiles.addTwoColorPolygon(true,4,rhomb1Left,square1A);
        ambe.triangle(0, false, true, rhomb2Right, rhomb1Left, square1A);
        //ambe.triangle(0,false,true,rhomb2Right,rhomb1Left,square1A);

        rhomb1Left.rotate(angle);
        rhomb2Right.rotate(angle);
        rhomb2Left.rotate(angle);
        square1A.rotate(angle);
    }

};

ambe.rhomb = function(ite, firstCornerMapsToZero, left, right) {
    // create the corner points
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.scale(Math.tan(ambe.angle * 0.5)).rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);

    if (iterateTiling.structure[ite].isNewPolygon(left, bottom, right, top)) {
        console.log("new");
        if (ite < iterateTiling.maxIterations) {
            // continue iteration, create more points
            const bottomLeft = Vector2.lerp(left, ambe.ratio, bottom);
            left.log("left");

        } else {
            // end iteration, make an image tile
            imageTiles.addTwoColorParallelogram(firstCornerMapsToZero, Math.PI / 4, left, right);

        }

    } else {
        console.log("old");
    }

};

ambe.triangle = function(ite, firstCornerMapsToZero, counterclockwise, a, b, c) {

    if (iterateTiling.structure[ite].isNewPolygon(a, b, c)) {
        console.log("new");
        if (ite < iterateTiling.maxIterations) {

        } else {
            if (counterclockwise) {
                imageTiles.addTwoColorPolygon(firstCornerMapsToZero, 4, a, b);
                a.log("a");
                b.log("b");

            } else {
                imageTiles.addTwoColorPolygon(firstCornerMapsToZero, 4, c, b);
            }

        }

    } else {
        console.log("old");
    }
};
