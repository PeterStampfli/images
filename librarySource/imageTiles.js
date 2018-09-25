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

// use shifting to adjust symmetric polygons
imageTiles.shiftForSymmetricParallelograms = true;

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
    imageTiles.polygons = new UniquePolygons();
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

/**
 * switch to always using symmetric polygons
 * @var {boolean} imageTiles.allSymmetric
 */
imageTiles.allSymmetric = false;

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
        if (leftCornerMapsToZero) {
            imageTiles.polygons.addPolygon(left, bottom, center).addBaseline(left, bottom);
            imageTiles.polygons.addPolygon(bottom, right, center).addBaseline(right, bottom);
            imageTiles.polygons.addPolygon(right, top, center).addBaseline(right, top);
            imageTiles.polygons.addPolygon(top, left, center).addBaseline(left, top);
        } else {
            imageTiles.polygons.addPolygon(left, bottom, center).addBaseline(bottom, left);
            imageTiles.polygons.addPolygon(bottom, right, center).addBaseline(bottom, right);
            imageTiles.polygons.addPolygon(right, top, center).addBaseline(top, right);
            imageTiles.polygons.addPolygon(top, left, center).addBaseline(top, left);
        }
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
    if (imageTiles.shiftForSymmetricParallelograms) {
        const shift = 1 / Math.tan(angle);
        Polygon.imageShift = shift;
        imageTiles.polygons.addImagePolygon(true, bottom, bottomRight, center);
        imageTiles.polygons.addImagePolygon(true, top, topLeft, center);
        imageTiles.polygons.addImagePolygon(false, bottomLeft, bottom, center);
        imageTiles.polygons.addImagePolygon(false, topRight, top, center);
        Polygon.imageShift = -shift;
        imageTiles.polygons.addImagePolygon(true, left, bottomLeft, center);
        imageTiles.polygons.addImagePolygon(true, right, topRight, center);
        imageTiles.polygons.addImagePolygon(false, topLeft, left, center);
        imageTiles.polygons.addImagePolygon(false, bottomRight, right, center);
        Polygon.imageShift = 0;
    } else {
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
    }
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
