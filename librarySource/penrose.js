// doing the penrose tiling using iteration methods ..
/* jshint esversion:6 */



var penrose = {};


(function() {
    "use strict";

    penrose.pi25 = 2 * Math.PI / 5;
    penrose.pi5 = Math.PI / 5;
    penrose.pi10 = Math.PI / 10;

    penrose.start = function() {
        const side = 5;
        const zero = new Vector2(0, 0);
        const base = new Vector2(side, 0);
        const cornerUp = base.clone().rotate(penrose.pi5);
        const cornerDown = base.clone().rotate(-penrose.pi5);

        base.log("bas");
        cornerUp.log("up");
        cornerDown.log("down");
        for (var i = 0; i < 1; i++) {

            penrose.halfKite(0, true, zero, base, cornerUp);
            penrose.halfKite(0, false, zero, base, cornerDown);


            base.rotate(penrose.pi25);
            cornerUp.rotate(penrose.pi25);
            cornerDown.rotate(penrose.pi25);
        }
    };


    penrose.halfKite = function(ite, counterClockwise, a, b, c) {
        console.log(iterateTiling.maxIterations);
        console.log(ite);

        if (iterateTiling.structure[ite].isNewPolygon(a, b, c)) {
            if (ite < iterateTiling.maxIterations) {

                const ba = Vector2.lerp(b, 1 - Fast.cos(penrose.pi5), a);
                const ab = Vector2.lerp(b, 2 * (1 - Fast.cos(penrose.pi5)), a);


                ba.log("ba");
                ab.log("ab");

                const ac = Vector2.difference(ab, c);


                if (counterClockwise) {
                    ac.rotate(-penrose.pi5).add(c);
                } else {
                    ac.rotate(penrose.pi5).add(c);
                }
                ac.log("ac");

                penrose.halfKite(ite + 1, counterClockwise, c, ab, b);
                penrose.halfKite(ite + 1, !counterClockwise, c, ab, ac);

            } else {
                if (counterClockwise) {
                    Polygon.imageShift = 0;

                    imageTiles.polygons.addImagePolygon(true, c, a, b);
                } else {
                    imageTiles.polygons.addImagePolygon(false, a, c, b);
                }
            }


        }

    };

}());
