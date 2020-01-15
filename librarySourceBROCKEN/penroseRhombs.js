// penrose tiling with rhombs p3-tiling
/* jshint esversion:6 */

var penroseRhombs = {};


(function() {
    "use strict";

    const largeAngle = Math.PI / 2.5;
    const smallAngle = Math.PI / 5;
    const ratio = 2 / (1 + Math.sqrt(5));
    const centerRatio = ratio / 2 / Fast.cos(smallAngle);

    // select decoration for each one
    penroseRhombs.slimWithStraightDeco = true;
    penroseRhombs.fatWithStraightDeco = true;

    penroseRhombs.start = function() {
        const side = 13.5;
        const zero = new Vector2(0, 0);
        const b1 = new Vector2(side, 0);
        const b2 = b1.clone().rotate72();
        for (var i = 0; i < 5; i++) {
            let c = Vector2.sum(b1, b2);
            penroseRhombs.fat(0, true, zero, b1.clone(), c);
            penroseRhombs.fat(0, false, zero, b2.clone(), c);
            b1.rotate72();
            b2.rotate72();
        }
    };

    penroseRhombs.slim = function(ite, counterclockwise, a, b, c) {
        if (iterateTiling.isOutside(a, b, c)) {
            return;
        }
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        if (ite < iterateTiling.maxIterations) {
            const ab = Vector2.lerp(b, ratio, a);
            penroseRhombs.fat(ite + 1, counterclockwise, c, ab, b);
            penroseRhombs.slim(ite + 1, counterclockwise, ab, c, a);
        } else {
            if (counterclockwise) {
                if (penroseRhombs.slimWithStraightDeco) {
                    imageTiles.addStraightSingleColorParallelogram(smallAngle, b, Vector2.sum(a, c).sub(b));
                } else {
                    imageTiles.addShearedSingleColorParallelogram(smallAngle, b, Vector2.sum(a, c).sub(b));
                }
            }
        }
    };

    penroseRhombs.fat = function(ite, counterclockwise, a, b, c) {
        if (iterateTiling.isOutside(a, b, c)) {
            return;
        }
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        if (ite < iterateTiling.maxIterations) {
            const ba = Vector2.lerp(a, ratio, b);
            const ca = Vector2.lerp(c, centerRatio, a);
            penroseRhombs.fat(ite + 1, !counterclockwise, ca, ba, a);
            penroseRhombs.fat(ite + 1, counterclockwise, c, ca, b);
            penroseRhombs.slim(ite + 1, !counterclockwise, ba, ca, b);
        } else {
            if (counterclockwise) {
                if (penroseRhombs.fatWithStraightDeco) {
                    imageTiles.addStraightSingleColorParallelogram(largeAngle, a, c);
                } else {
                    imageTiles.addShearedSingleColorParallelogram(largeAngle, a, c);
                }
            }
        }
    };

}());
