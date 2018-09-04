/**
 * creating mirroring tiles for an image and collecting them
 * simple tiles for quasiperiodic lattices, cutting pieces out of an input image an putting them together with mirror symmetry at joints
 * all tiles have the same length for the sides
 * @namespace imageTiles
 */
/* jshint esversion:6 */

var imageTiles = {};

/**
 * reset, simply clearing all polygons
 * @method imageTiles.reset
 */
imageTiles.reset = function() {
    imageTiles.polygons = new UniquePolygons();
};

/**
 * switch to always using symmetric polygons
 * @var {boolean} imageTiles.allSymmetric
 */
imageTiles.allSymmetric = false;

/**
 * create an image parallelgram with directed sides, two different corner types
 * consists of four triangle tiles, add the tiles to polygons
 * specifying two points across the diagonal and the opening angle at these points
 * the points get mapped to (0,0) (A-points)
 * choose whether the "left" corner maps to zero (or the "bottom" corner)
 * @method imageTiles.addTwoColorParallelogram
 * @param {boolean} leftCornerMapsToZero
 * @param {float} angle
 * @param {Vector2} left
 * @param {Vector2} right
 */
imageTiles.addTwoColorParallelogram = function(leftCornerMapsToZero, angle, left, right) {
    if (imageTiles.allSymmetric) {
        imageTiles.addSymmetricParallelogram(angle, left, right);
    } else {
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        imageTiles.polygons.addImagePolygon(leftCornerMapsToZero, left, bottom, center);
        imageTiles.polygons.addImagePolygon(!leftCornerMapsToZero, bottom, right, center);
        imageTiles.polygons.addImagePolygon(leftCornerMapsToZero, right, top, center);
        imageTiles.polygons.addImagePolygon(!leftCornerMapsToZero, top, left, center);
    }
};

/**
 * create a "two-color" regular polygon, all corners of the same type
 * given even number n of sides, a first and a second corner, the polygon lies at left of the line from first to second
 * choose whether the "first" corner maps to zero (or the "second" corner)
 * @method imageTiles.addTwoColorPolygon
 * @param {boolean} firstCornerMapsToZero
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner - of type A, matching (0,0)
 * @param {Vector2} secondCorner 
 */
imageTiles.addTwoColorPolygon = function(firstCornerMapsToZero, n, firstCorner, secondCorner) {
    if (imageTiles.allSymmetric) {
        imageTiles.addSymmetricPolygon(n, firstCorner, secondCorner);
    } else {
        const middle = Vector2.center(firstCorner, secondCorner);
        const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
        const center = Vector2.difference(middle, centerMiddle);
        const centerFirst = Vector2.difference(firstCorner, center);
        const centerSecond = Vector2.difference(secondCorner, center);
        const alpha = 2 * Math.PI / n;
        const first = new Vector2();
        const second = new Vector2();

        for (var i = 0; i < n; i++) {
            first.set(center).add(centerFirst);
            second.set(center).add(centerSecond);
            if (i & 1) {
                imageTiles.polygons.addImagePolygon(!firstCornerMapsToZero, first, second, center);
            } else {
                imageTiles.polygons.addImagePolygon(firstCornerMapsToZero, first, second, center);
            }
            centerFirst.rotate(alpha);
            centerSecond.rotate(alpha);
        }
    }
};

/**
 * create a symmetric image parallelogram, all corners of same type, 4 triangles and 4 quads
 * all corners map to (0,0)
 * @method imageTiles.addSymmetricParallelogram
 * @param {float} angle
 * @param {Vector2} left
 * @param {Vector2} right
 */
imageTiles.addSymmetricParallelogram = function(angle, left, right) {
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);
    const bottomRight = Vector2.center(bottom, right);
    const bottomLeft = Vector2.center(bottom, left);
    const topRight = Vector2.center(top, right);
    const topLeft = Vector2.center(top, left);
    const centerLeft = Vector2.difference(bottomLeft, left).scale(Math.tan(0.5 * angle)).rotate90().add(bottomLeft);
    const centerRight = Vector2.difference(topRight, right).scale(Math.tan(0.5 * angle)).rotate90().add(topRight);
    imageTiles.polygons.addImagePolygon(true, left, bottomLeft, centerLeft);
    imageTiles.polygons.addImagePolygon(true, bottom, bottomRight, centerRight, center);
    imageTiles.polygons.addImagePolygon(true, right, topRight, centerRight);
    imageTiles.polygons.addImagePolygon(true, top, topLeft, centerLeft, center);
    imageTiles.polygons.addImagePolygon(false, bottomLeft, bottom, center, centerLeft);
    imageTiles.polygons.addImagePolygon(false, bottomRight, right, centerRight);
    imageTiles.polygons.addImagePolygon(false, topRight, top, center, centerRight);
    imageTiles.polygons.addImagePolygon(false, topLeft, left, centerLeft);
};

/**
 * create a "directed" regular polygon, all corners of the same type
 * given number n of sides, a first and a second corner, 
 * the polygon lies at left of the line from first to second
 * all corners map to (0,0)
 * @method imageTiles.addSymmetricPolygon
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner 
 * @param {Vector2} secondCorner 
 */
imageTiles.addSymmetricPolygon = function(n, firstCorner, secondCorner) {
    const middle = Vector2.center(firstCorner, secondCorner);
    const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
    const center = Vector2.difference(middle, centerMiddle);
    const centerFirst = Vector2.difference(firstCorner, center);
    const centerSecond = Vector2.difference(secondCorner, center);
    const alpha = 2 * Math.PI / n;
    const first = new Vector2();
    const second = new Vector2();
    for (var i = 0; i < n; i++) {
        first.set(center).add(centerFirst);
        middle.set(center).add(centerMiddle);
        second.set(center).add(centerSecond);
        imageTiles.polygons.addImagePolygon(true, first, middle, center);
        imageTiles.polygons.addImagePolygon(false, middle, second, center);
        centerFirst.rotate(alpha);
        centerMiddle.rotate(alpha);
        centerSecond.rotate(alpha);
    }
};
