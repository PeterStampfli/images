/**
 * creating mirroring tiles for an image and collecting them
 * simple tiles for quasiperiodic lattices, cutting pieces out of an input image an putting them together with mirror symmetry at joints
 * all tiles have the same length for the sides
 * @namespace imageTiles
 */
/* jshint esversion:6 */

var imageTiles = {};

// the bins for polygons
imageTiles.bins = new Bins();

// scaling for the tiles (make them independent of size)
imageTiles.scale = 1;

// working around ... to pass parameter
Polygon.imageShift = 0;

/**
 * setup the dimensions (region and bin size)
 * @method imageTiles.dimensions
 * @param {float}  xMin 
 * @param {float}  xMax
 * @param {float}  yMin 
 * @param {float}  yMax
 * @param {float}  side - length of the squares mapping to bins
 */
imageTiles.dimensions = function(xMin, xMax, yMin, yMax, side) {
    this.bins.dimensions(xMin, xMax, yMin, yMax, side);
};

/**
 * reset, simply clearing all polygons and bins
 * @method imageTiles.reset
 */
imageTiles.reset = function() {
    imageTiles.polygons = new Polygons();
    imageTiles.bins.empty();
};

// making maps, using the (generic) map(position) method of polygons
/**
 * creating structure data depending on the position of a point
 * @method imageTiles.mapStructure
 * @param {Vector2} p - position
 * @return +1 for a valid point, -1 for an invalid point outside tiling
 */
imageTiles.mapStructure = function(p) {
    let result = imageTiles.bins.map(p);
    p.x = result;
    return result;
};

/**
 * creating image data depending on the position of a point
 * @method imageTiles.mapImage
 * @param {Vector2} p - position
 * @return +1 for a valid point, -1 for an invalid point outside tiling
 */
imageTiles.mapImage = function(p) {
    if (imageTiles.bins.map(p) < 0) {
        return -1;
    } else {
        p.scale(imageTiles.scale);
        return 1;
    }
};

/**
 * set the mapping methods
 * @method imageTiles.setMapping
 */
imageTiles.setMapping = function() {
    Make.setMapping(imageTiles.mapImage, imageTiles.mapStructure);
};

// the tiles



// for more versatility: generic addParallelogram and addRegularPolygon

/**
 * create an image parallelogram composed of tiles
 * add the tiles to imageTiles.polygons
 * (here generic do nothing interface)
 * @method imageTiles.addParallelogram
 * @param {float} angle
 * @param {Vector2} left
 * @param {Vector2} right
 * @param {boolean} leftCornerMapsToZero - for "two color" parallelgrams (may be omitted)
 */
imageTiles.addParallelogram = function(angle, left, right, leftCornerMapsToZero) {};

/**
 * create a regular polygon
 * given a first and a second corner, the polygon lies at left of the line from first to second
 * @method imageTiles.addRegularPolygon
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner - of type A, matching (0,0)
 * @param {Vector2} secondCorner 
 * @param {boolean} firstCornerMapsToZero - for "two color" polygons (may be omitted)
 */
imageTiles.addRegularPolygon = function(n, firstCorner, secondCorner, firstCornerMapsToZero) {};

/**
 * create a regular polygon, only first half
 * given a first and a second corner, the polygon lies at left of the line from first to second
 * @method imageTiles.addRegularPolygon
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner - of type A, matching (0,0)
 * @param {Vector2} secondCorner 
 * @param {boolean} firstCornerMapsToZero - for "two color" polygons (may be omitted)
 */
imageTiles.addRegularHalfPolygon = function(n, firstCorner, secondCorner, firstCornerMapsToZero) {};

/**
 * create an image parallelgram with directed sides, two different corner types
 * consists of four triangle tiles, add the tiles to polygons
 * specifying two points across the diagonal and the opening angle at these points
 * the points get mapped to (0,0) (A-points)
 * choose whether the "left" corner maps to zero (or the "bottom" corner)
 * @method imageTiles.addTwoColorParallelogram
 * @param {boolean} leftCornerMapsToZero
 * @param {float} angle
 * @param {Vector2} left - clone if changed later
 * @param {Vector2} right - clone if changed later
 */
imageTiles.addTwoColorParallelogram = function(angle, left, right, leftCornerMapsToZero) {
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);
    imageTiles.polygons.addPolygon(left, bottom, center).addBaseline(left, bottom, leftCornerMapsToZero);
    imageTiles.polygons.addPolygon(bottom, right, center).addBaseline(right, bottom, leftCornerMapsToZero);
    imageTiles.polygons.addPolygon(right, top, center).addBaseline(right, top, leftCornerMapsToZero);
    imageTiles.polygons.addPolygon(top, left, center).addBaseline(left, top, leftCornerMapsToZero);
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
imageTiles.addTwoColorPolygon = function(n, firstCorner, secondCorner, firstCornerMapsToZero) {
    const middle = Vector2.center(firstCorner, secondCorner);
    const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
    const center = Vector2.difference(middle, centerMiddle);
    const centerFirst = Vector2.difference(firstCorner, center);
    const centerSecond = Vector2.difference(secondCorner, center);
    const alpha = 2 * Math.PI / n;
    for (var i = 0; i < n; i++) {
        let first = Vector2.sum(center, centerFirst);
        let second = Vector2.sum(center, centerSecond);
        imageTiles.polygons.addPolygon(first, second, center).addBaseline(first, second, firstCornerMapsToZero != (i & 1));
        centerFirst.rotate(alpha);
        centerSecond.rotate(alpha);
    }
};

/**
 * create half of a "two-color" regular polygon, all corners of the same type
 * given even number n of sides, a first and a second corner, the polygon lies at left of the line from first to second
 * choose whether the "first" corner maps to zero (or the "second" corner)
 * @method imageTiles.addTwoColorPolygon
 * @param {boolean} firstCornerMapsToZero
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner - of type A, matching (0,0)
 * @param {Vector2} secondCorner 
 */
imageTiles.addTwoColorHalfPolygon = function(n, firstCorner, secondCorner, firstCornerMapsToZero) {
    const middle = Vector2.center(firstCorner, secondCorner);
    const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
    const center = Vector2.difference(middle, centerMiddle);
    const centerFirst = Vector2.difference(firstCorner, center);
    const centerSecond = Vector2.difference(secondCorner, center);
    const alpha = 2 * Math.PI / n;
    const n2 = n / 2;
    for (var i = 0; i < n2; i++) {
        let first = Vector2.sum(center, centerFirst);
        let second = Vector2.sum(center, centerSecond);
        imageTiles.polygons.addPolygon(first, second, center).addBaseline(first, second, firstCornerMapsToZero != (i & 1));
        centerFirst.rotate(alpha);
        centerSecond.rotate(alpha);
    }
};

/**
 * create a symmetric image parallelogram, all corners of same type, 4 triangles and 4 quads
 * all corners map to (0,0), no shear
 * @method imageTiles.addStraightSymmetricParallelogram
 * @param {float} angle
 * @param {Vector2} left
 * @param {Vector2} right
 */
imageTiles.addStraightSymmetricParallelogram = function(angle, left, right) {
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
    imageTiles.polygons.addPolygon(left, bottomLeft, centerLeft).addBaseline(left, bottomLeft);
    imageTiles.polygons.addPolygon(bottom, bottomRight, centerRight, center).addBaseline(bottom, bottomRight);
    imageTiles.polygons.addPolygon(right, topRight, centerRight).addBaseline(right, topRight);
    imageTiles.polygons.addPolygon(top, topLeft, centerLeft, center).addBaseline(top, topLeft);
    imageTiles.polygons.addPolygon(bottomLeft, bottom, center, centerLeft).addBaseline(bottom, bottomLeft);
    imageTiles.polygons.addPolygon(bottomRight, right, centerRight).addBaseline(right, bottomRight);
    imageTiles.polygons.addPolygon(topRight, top, center, centerRight).addBaseline(top, topRight);
    imageTiles.polygons.addPolygon(topLeft, left, centerLeft).addBaseline(left, topLeft);
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
        let first = Vector2.sum(center, centerFirst);
        let middle = Vector2.sum(center, centerMiddle);
        let second = Vector2.sum(center, centerSecond);
        imageTiles.polygons.addPolygon(first, middle, center).addBaseline(first, middle);
        imageTiles.polygons.addPolygon(middle, second, center).addBaseline(second, middle);
        centerFirst.rotate(alpha);
        centerMiddle.rotate(alpha);
        centerSecond.rotate(alpha);
    }
};

/**
 * create a half of a regular polygon, all corners of the same type
 * given number n of sides, a first and a second corner, 
 * the polygon lies at left of the line from first to second
 * all corners map to (0,0)
 * @method imageTiles.addSymmetricHalfPolygon
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner 
 * @param {Vector2} secondCorner 
 */
imageTiles.addSymmetricHalfPolygon = function(n, firstCorner, secondCorner) {
    const middle = Vector2.center(firstCorner, secondCorner);
    const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
    const center = Vector2.difference(middle, centerMiddle);
    const centerFirst = Vector2.difference(firstCorner, center);
    const centerSecond = Vector2.difference(secondCorner, center);
    const alpha = 2 * Math.PI / n;
    const first = new Vector2();
    const second = new Vector2();
    const n2 = n / 2;
    for (var i = 0; i < n2; i++) {
        let first = Vector2.sum(center, centerFirst);
        let middle = Vector2.sum(center, centerMiddle);
        let second = Vector2.sum(center, centerSecond);
        imageTiles.polygons.addPolygon(first, middle, center).addBaseline(first, middle);
        imageTiles.polygons.addPolygon(middle, second, center).addBaseline(second, middle);
        centerFirst.rotate(alpha);
        centerMiddle.rotate(alpha);
        centerSecond.rotate(alpha);
    }
};

/**
 * create a symmetric image parallelogram with sheared mapping, all corners of same type, 4 triangles
 * all corners map to (0,0)
 * @method imageTiles.addShearedSymmetricParallelogram
 * @param {float} angle
 * @param {Vector2} left
 * @param {Vector2} right
 */
imageTiles.addShearedSymmetricParallelogram = function(angle, left, right) {
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);
    const bottomRight = Vector2.center(bottom, right);
    const bottomLeft = Vector2.center(bottom, left);
    const topRight = Vector2.center(top, right);
    const topLeft = Vector2.center(top, left);
    const shift = 1 / Math.tan(angle);
    const shear = 1 / Math.tan(angle);
    imageTiles.polygons.addPolygon(bottom, bottomRight, center).addBaseline(bottom, bottomRight).setShear(shear);
    imageTiles.polygons.addPolygon(top, topLeft, center).addBaseline(top, topLeft).setShear(shear);
    imageTiles.polygons.addPolygon(bottomLeft, bottom, center).addBaseline(bottom, bottomLeft).setShear(shear);
    imageTiles.polygons.addPolygon(topRight, top, center).addBaseline(top, topRight).setShear(shear);
    imageTiles.polygons.addPolygon(left, bottomLeft, center).addBaseline(left, bottomLeft).setShear(-shear);
    imageTiles.polygons.addPolygon(right, topRight, center).addBaseline(right, topRight).setShear(-shear);
    imageTiles.polygons.addPolygon(topLeft, left, center).addBaseline(left, topLeft).setShear(-shear);
    imageTiles.polygons.addPolygon(bottomRight, right, center).addBaseline(right, bottomRight).setShear(-shear);
};
