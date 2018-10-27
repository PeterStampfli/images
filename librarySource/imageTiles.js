/**
 * creating mirroring tiles for an image and collecting them
 * simple tiles for quasiperiodic lattices, cutting pieces out of an input image an putting them together with mirror symmetry at joints
 * all tiles have the same length for the sides
 * @namespace imageTiles
 */
/* jshint esversion:6 */

var imageTiles = {};

(function() {
    "use strict";


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
        imageTiles.bins.dimensions(xMin, xMax, yMin, yMax, side);
    };

    /**
     * reset, simply clearing all polygons and bins
     * @method imageTiles.reset
     */
    imageTiles.reset = function() {
        imageTiles.polygons = [];
        imageTiles.bins.empty();
    };

    /**
     * add triangle tiles to the array
     * @method imageTiles.addPolygons
     * @param {ArrayOfPolygons} polygons, with mapping
     */
    imageTiles.addPolygons = function(polygons) {
        polygons.forEach(polygon => {
            imageTiles.polygons.push(polygon);
        });
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

    // fast efficient rotation
    /**
     * set the rotation angle
     * @method imageTiles.setRotationAngle
     * @param {float} angle
     */
    imageTiles.setRotationAngle = function(angle) {
        Fast.cosSin(angle);
        imageTiles.cosAngle = Fast.cosResult;
        imageTiles.sinAngle = Fast.sinResult;
    };

    /**
     * rotate a vector by the given angle
     * @method imageTiles.rotate
     * @param {Vector2} p
     * @return the changed vector for chaining
     */
    imageTiles.rotate = function(p) {
        const h = imageTiles.cosAngle * p.x - imageTiles.sinAngle * p.y;
        p.y = imageTiles.sinAngle * p.x + imageTiles.cosAngle * p.y;
        p.x = h;
        return p;
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
        imageTiles.polygons.push(new Polygon(left, bottom, center).addBaseline(left, bottom, leftCornerMapsToZero));
        imageTiles.polygons.push(new Polygon(bottom, right, center).addBaseline(right, bottom, leftCornerMapsToZero));
        imageTiles.polygons.push(new Polygon(right, top, center).addBaseline(right, top, leftCornerMapsToZero));
        imageTiles.polygons.push(new Polygon(top, left, center).addBaseline(left, top, leftCornerMapsToZero));
        Vector2.toPool(halfDiagonal);
    };

    /**
     * create a "two-color" regular polygon, all corners of the same type
     * given even number n of sides, a first and a second corner, the polygon lies at left of the line from first to second
     * choose whether the "first" corner maps to zero (or the "second" corner)
     * @method imageTiles.addTwoColorRegularPolygon
     * @param {boolean} firstCornerMapsToZero
     * @param {integer} n - number of sides
     * @param {Vector2} firstCorner - of type A, matching (0,0)
     * @param {Vector2} secondCorner 
     */
    imageTiles.addTwoColorRegularPolygon = function(n, firstCorner, secondCorner, firstCornerMapsToZero) {
        const middle = Vector2.center(firstCorner, secondCorner);
        const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
        const center = Vector2.difference(middle, centerMiddle);
        const centerFirst = Vector2.difference(firstCorner, center);
        const centerSecond = Vector2.difference(secondCorner, center);
        imageTiles.setRotationAngle(2 * Math.PI / n);
        for (var i = 0; i < n; i++) {
            let first = Vector2.sum(center, centerFirst);
            let second = Vector2.sum(center, centerSecond);
            imageTiles.polygons.push(new Polygon(first, second, center).addBaseline(first, second, firstCornerMapsToZero != (i & 1)));
            imageTiles.rotate(centerFirst);
            imageTiles.rotate(centerSecond);
        }
        Vector2.toPool(middle, centerMiddle, centerFirst, centerSecond);
    };

    /**
     * create half of a "two-color" regular polygon, all corners of the same type
     * given even number n of sides, a first and a second corner, the polygon lies at left of the line from first to second
     * choose whether the "first" corner maps to zero (or the "second" corner)
     * @method imageTiles.addTwoColorRegularHalfPolygon
     * @param {boolean} firstCornerMapsToZero
     * @param {integer} n - number of sides
     * @param {Vector2} firstCorner - of type A, matching (0,0)
     * @param {Vector2} secondCorner 
     */
    imageTiles.addTwoColorRegularHalfPolygon = function(n, firstCorner, secondCorner, firstCornerMapsToZero) {
        const middle = Vector2.center(firstCorner, secondCorner);
        const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
        const center = Vector2.difference(middle, centerMiddle);
        const centerFirst = Vector2.difference(firstCorner, center);
        const centerSecond = Vector2.difference(secondCorner, center);
        imageTiles.setRotationAngle(2 * Math.PI / n);
        const n2 = n / 2;
        for (var i = 0; i < n2; i++) {
            let first = Vector2.sum(center, centerFirst);
            let second = Vector2.sum(center, centerSecond);
            imageTiles.polygons.push(new Polygon(first, second, center).addBaseline(first, second, firstCornerMapsToZero != (i & 1)));
            imageTiles.rotate(centerFirst);
            imageTiles.rotate(centerSecond);
        }
        Vector2.toPool(middle, centerMiddle, centerFirst, centerSecond);
    };

    /**
     * create a symmetric image parallelogram, all corners of same type, 4 triangles and 4 quads
     * all corners map to (0,0), no shear
     * @method imageTiles.addStraightSingleColorParallelogram
     * @param {float} angle
     * @param {Vector2} left
     * @param {Vector2} right
     */
    imageTiles.addStraightSingleColorParallelogram = function(angle, left, right) {
        const tanAngle2 = Math.tan(angle * 0.5);
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(tanAngle2).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        const bottomRight = Vector2.center(bottom, right);
        const bottomLeft = Vector2.center(bottom, left);
        const topRight = Vector2.center(top, right);
        const topLeft = Vector2.center(top, left);
        const centerLeft = Vector2.difference(bottomLeft, left).scale(tanAngle2).rotate90().add(bottomLeft);
        const centerRight = Vector2.difference(topRight, right).scale(tanAngle2).rotate90().add(topRight);
        imageTiles.polygons.push(new Polygon(left, bottomLeft, centerLeft).addBaseline(left, bottomLeft));
        imageTiles.polygons.push(new Polygon(bottom, bottomRight, centerRight, center).addBaseline(bottom, bottomRight));
        imageTiles.polygons.push(new Polygon(right, topRight, centerRight).addBaseline(right, topRight));
        imageTiles.polygons.push(new Polygon(top, topLeft, centerLeft, center).addBaseline(top, topLeft));
        imageTiles.polygons.push(new Polygon(bottomLeft, bottom, center, centerLeft).addBaseline(bottom, bottomLeft));
        imageTiles.polygons.push(new Polygon(bottomRight, right, centerRight).addBaseline(right, bottomRight));
        imageTiles.polygons.push(new Polygon(topRight, top, center, centerRight).addBaseline(top, topRight));
        imageTiles.polygons.push(new Polygon(topLeft, left, centerLeft).addBaseline(left, topLeft));
        Vector2.toPool(halfDiagonal);
    };

    /**
     * create a "directed" regular polygon, all corners of the same type
     * given number n of sides, a first and a second corner, 
     * the polygon lies at left of the line from first to second
     * all corners map to (0,0)
     * @method imageTiles.addSingleColorRegularPolygon
     * @param {integer} n - number of sides
     * @param {Vector2} firstCorner 
     * @param {Vector2} secondCorner 
     */
    imageTiles.addSingleColorRegularPolygon = function(n, firstCorner, secondCorner) {
        const middle = Vector2.center(firstCorner, secondCorner);
        const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
        const center = Vector2.difference(middle, centerMiddle);
        const centerFirst = Vector2.difference(firstCorner, center);
        const centerSecond = Vector2.difference(secondCorner, center);
        imageTiles.setRotationAngle(2 * Math.PI / n);
        for (var i = 0; i < n; i++) {
            let first = Vector2.sum(center, centerFirst);
            let middle = Vector2.sum(center, centerMiddle);
            let second = Vector2.sum(center, centerSecond);
            imageTiles.polygons.push(new Polygon(first, middle, center).addBaseline(first, middle));
            imageTiles.polygons.push(new Polygon(middle, second, center).addBaseline(second, middle));
            imageTiles.rotate(centerFirst);
            imageTiles.rotate(centerMiddle);
            imageTiles.rotate(centerSecond);
        }
        Vector2.toPool(centerFirst, centerSecond, centerMiddle, middle);
    };

    /**
     * create a half of a regular polygon, all corners of the same type
     * given number n of sides, a first and a second corner, 
     * the polygon lies at left of the line from first to second
     * all corners map to (0,0)
     * @method imageTiles.addSingleColorRegularHalfPolygon
     * @param {integer} n - number of sides
     * @param {Vector2} firstCorner 
     * @param {Vector2} secondCorner 
     */
    imageTiles.addSingleColorRegularHalfPolygon = function(n, firstCorner, secondCorner) {
        const middle = Vector2.center(firstCorner, secondCorner);
        const centerMiddle = Vector2.difference(firstCorner, middle).scale(1 / Math.tan(Math.PI / n)).rotate90();
        const center = Vector2.difference(middle, centerMiddle);
        const centerFirst = Vector2.difference(firstCorner, center);
        const centerSecond = Vector2.difference(secondCorner, center);
        imageTiles.setRotationAngle(2 * Math.PI / n);
        const n2 = n / 2;
        for (var i = 0; i < n2; i++) {
            let first = Vector2.sum(center, centerFirst);
            let middle = Vector2.sum(center, centerMiddle);
            let second = Vector2.sum(center, centerSecond);
            imageTiles.polygons.push(new Polygon(first, middle, center).addBaseline(first, middle));
            imageTiles.polygons.push(new Polygon(middle, second, center).addBaseline(second, middle));
            imageTiles.rotate(centerFirst);
            imageTiles.rotate(centerMiddle);
            imageTiles.rotate(centerSecond);
        }
        Vector2.toPool(centerFirst, centerSecond, centerMiddle, middle);
    };

    /**
     * create a symmetric image parallelogram with sheared mapping, all corners of same type, 4 triangles
     * all corners map to (0,0)
     * @method imageTiles.addShearedSingleColorParallelogram
     * @param {float} angle
     * @param {Vector2} left
     * @param {Vector2} right
     */
    imageTiles.addShearedSingleColorParallelogram = function(angle, left, right) {
        const center = Vector2.center(left, right);
        const halfDiagonal = Vector2.difference(center, left);
        halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
        const top = Vector2.sum(center, halfDiagonal);
        const bottom = Vector2.difference(center, halfDiagonal);
        const bottomRight = Vector2.center(bottom, right);
        const bottomLeft = Vector2.center(bottom, left);
        const topRight = Vector2.center(top, right);
        const topLeft = Vector2.center(top, left);
        const shear = 1 / Math.tan(angle);
        imageTiles.polygons.push(new Polygon(bottom, bottomRight, center).addBaseline(bottom, bottomRight).setShear(shear));
        imageTiles.polygons.push(new Polygon(top, topLeft, center).addBaseline(top, topLeft).setShear(shear));
        imageTiles.polygons.push(new Polygon(bottomLeft, bottom, center).addBaseline(bottom, bottomLeft).setShear(shear));
        imageTiles.polygons.push(new Polygon(topRight, top, center).addBaseline(top, topRight).setShear(shear));
        imageTiles.polygons.push(new Polygon(left, bottomLeft, center).addBaseline(left, bottomLeft).setShear(-shear));
        imageTiles.polygons.push(new Polygon(right, topRight, center).addBaseline(right, topRight).setShear(-shear));
        imageTiles.polygons.push(new Polygon(topLeft, left, center).addBaseline(left, topLeft).setShear(-shear));
        imageTiles.polygons.push(new Polygon(bottomRight, right, center).addBaseline(right, bottomRight).setShear(-shear));
        Vector2.toPool(halfDiagonal);
    };


    /** calculate gamma for an array of polygons, typically triangles, 
     * with given center, and baseline, resulting from the dissection  of a polygon
     * note: gamma does not depend on orientation and size of the polygon. 
     * If all polygons have the same shape we need only calculate gamma once.
     * @method imageTiles.calculateGamma
     * @param {Vector2} gamma - will have result
     * @param {Vector2} center - common center of triangles
     * @param {ArrayOfPolygons} triangles
     */
    imageTiles.calculateGamma = function(gamma, center, triangles) {
        let sumX = 0;
        let sumY = 0;
        let nTriangles = triangles.length;
        for (var i = 0; i < nTriangles; i++) {
            gamma.set(center);
            triangles[i].applyBaseline(gamma);
            sumX += gamma.x;
            sumY += gamma.y;
        }
        gamma.setComponents(sumX / nTriangles, sumY / nTriangles);
    };

    /**
     * for given Polygon.center and Polygon.gamma adjust the mapping for polygons
     * @method imageTiles.adjustTriangleMapping
     * @param {ArrayOfPolygons} triangles
     */
    imageTiles.adjustTriangleMapping = function(triangles) {
        triangles.forEach(triangle => {
            triangle.adjustScaleShearTriangleMapping();
        });
    };

    // more general mapping
    let triangles = [];
    let gamma = new Vector2();

    // decompositions for quads:

    // penrose note: can build full kites and darts
    // iteration generates halfs that are themselves not mirrorsymmetric!
    // they are mirrorsymmetric with respect to each other
    // so draw the entire tile from one half or nothing depending on orientation

    /**
     * decompose a quadrangle into image triangles tiles, one for each side
     * based on a two-color labeling for the corners
     * adjust the triangle mapping, add to tiles
     * @method imageTiles.addTwoColorQuad
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {Vector2} c
     * @param {Vector2} d
     * @param {Vector2} center
     * @param {boolean} aMapsToZero
     */
    imageTiles.addTwoColorQuad = function(a, b, c, d, center, aMapsToZero) {
        triangles.length = 0;
        triangles.push(new Polygon(a, b, center).addBaseline(a, b, aMapsToZero));
        triangles.push(new Polygon(b, c, center).addBaseline(b, c, !aMapsToZero));
        triangles.push(new Polygon(c, d, center).addBaseline(c, d, aMapsToZero));
        triangles.push(new Polygon(d, a, center).addBaseline(d, a, !aMapsToZero));
        imageTiles.calculateGamma(gamma, center, triangles);
        Polygon.setCenter(center);
        Polygon.setGamma(gamma);
        imageTiles.adjustTriangleMapping(triangles);
        imageTiles.addPolygons(triangles);
    };

    /**
     * decompose a quadrangle into image triangles tiles, two for each side
     * each corner is the same
     * adjust the triangle mapping, add to tiles
     * @method imageTiles.addSingleColorQuad
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {Vector2} c
     * @param {Vector2} d
     * @param {Vector2} center
     */
    imageTiles.addSingleColorQuad = function(a, b, c, d, center) {
        var middle;
        triangles.length = 0;
        middle = Vector2.center(a, b);
        triangles.push(new Polygon(a, middle, center).addBaseline(a, middle));
        triangles.push(new Polygon(middle, b, center).addBaseline(b, middle));
        middle = Vector2.center(b, c);
        triangles.push(new Polygon(b, middle, center).addBaseline(b, middle));
        triangles.push(new Polygon(middle, c, center).addBaseline(c, middle));
        middle = Vector2.center(c, d);
        triangles.push(new Polygon(c, middle, center).addBaseline(c, middle));
        triangles.push(new Polygon(middle, d, center).addBaseline(d, middle));
        middle = Vector2.center(d, a);
        triangles.push(new Polygon(d, middle, center).addBaseline(d, middle));
        triangles.push(new Polygon(middle, a, center).addBaseline(a, middle));

        imageTiles.calculateGamma(gamma, center, triangles);
        Polygon.setCenter(center);
        Polygon.setGamma(gamma);
        imageTiles.adjustTriangleMapping(triangles);
        imageTiles.addPolygons(triangles);
    };

    /**
     * decompose half of a quadrangle into image triangles tiles, two for each side
     * each corner is the same
     * adjust the triangle mapping, add to tiles
     * @method imageTiles.addSingleColorHalfQuad
     * @param {Vector2} a
     * @param {Vector2} b
     * @param {Vector2} c
     * @param {Vector2} center
     */
    imageTiles.addSingleColorHalfQuad = function(a, b, c, center) {
        var middle;
        triangles.length = 0;
        middle = Vector2.center(a, b);
        triangles.push(new Polygon(a, middle, center).addBaseline(a, middle));
        triangles.push(new Polygon(middle, b, center).addBaseline(b, middle));
        middle = Vector2.center(b, c);
        triangles.push(new Polygon(b, middle, center).addBaseline(b, middle));
        triangles.push(new Polygon(middle, c, center).addBaseline(c, middle));


        imageTiles.calculateGamma(gamma, center, triangles);
        Polygon.setCenter(center);
        Polygon.setGamma(gamma);
        imageTiles.adjustTriangleMapping(triangles);
        imageTiles.addPolygons(triangles);
    };

    /**
     * decompose an irregular polygon into image triangles tiles, two for each side
     * each corner is the same
     * adjust the triangle mapping, add to tiles
     * @method imageTiles.addSingleColorQuad
     * @param {Vector2List} corners - list of corner vectors
     */
    imageTiles.addSingleColorPolygon = function(corners) {
        var a, b, middle, i;
        triangles.length = 0;
        const cornersLength = arguments.length;
        let sumX = 0;
        let sumY = 0;
        for (i = 0; i < cornersLength; i++) {
            sumX += arguments[i].x;
            sumY += arguments[i].y;
        }
        const center = new Vector2(sumX / cornersLength, sumY / cornersLength);
        for (i = 1; i < cornersLength; i++) {
            a = arguments[i - 1];
            b = arguments[i];
            middle = Vector2.center(a, b);
            triangles.push(new Polygon(a, middle, center).addBaseline(a, middle));
            triangles.push(new Polygon(middle, b, center).addBaseline(b, middle));
        }
        a = arguments[cornersLength - 1];
        b = arguments[0];
        middle = Vector2.center(a, b);
        triangles.push(new Polygon(a, middle, center).addBaseline(a, middle));
        triangles.push(new Polygon(middle, b, center).addBaseline(b, middle));
        imageTiles.calculateGamma(gamma, center, triangles);
        Polygon.setCenter(center);
        Polygon.setGamma(gamma);
        imageTiles.adjustTriangleMapping(triangles);
        imageTiles.addPolygons(triangles);
    };

    /**
     * decompose an irregular polygon into image triangles tiles, one for each side
     * should have an even number of sides
     * two kinds of corners
     * adjust the triangle mapping, add to tiles
     * @method imageTiles.addSingleColorQuad
     * @param {Vector2List} corners - list of corner vectors
     * @param {boolean} firstCornerMapsToZero
     */
    imageTiles.addTwoColorPolygon = function(corners, firstCornerMapsToZeroParameter) {
        var a, b, i;
        triangles.length = 0;
        const cornersLength = arguments.length - 1;
        let firstCornerMapsToZero = arguments[cornersLength];
        let sumX = 0;
        let sumY = 0;
        for (i = 0; i < cornersLength; i++) {
            sumX += arguments[i].x;
            sumY += arguments[i].y;
        }
        const center = new Vector2(sumX / cornersLength, sumY / cornersLength);
        for (i = 1; i < cornersLength; i++) {
            a = arguments[i - 1];
            b = arguments[i];
            triangles.push(new Polygon(a, b, center).addBaseline(a, b, firstCornerMapsToZero != (i & 1)));
        }
        a = arguments[cornersLength - 1];
        b = arguments[0];
        triangles.push(new Polygon(a, b, center).addBaseline(a, b, firstCornerMapsToZero != (cornersLength & 1)));
        imageTiles.calculateGamma(gamma, center, triangles);
        Polygon.setCenter(center);
        Polygon.setGamma(gamma);
        imageTiles.adjustTriangleMapping(triangles);
        imageTiles.addPolygons(triangles);
    };

}());
