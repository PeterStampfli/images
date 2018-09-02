/**
 * creating mirroring tiles for an image and collecting them
 * @namespace imageTiles
 */
/* jshint esversion:6 */

var imageTiles = {};

imageTiles.polygons = new UniquePolygons();

/**
 * create a parallelgram of four triangle tiles, add the tiles to polygons
 * specifying two points across the diagonal and the opening angle at these points
 * the points get mapped to (0,0) (A-points)
 * @method imageTiles.addParallelogramA
 * @param {float} angle
 * @param {Vector2} left
 * @param {Vector2} right
 */
imageTiles.addParallelogramA = function(angle, left, right) {
    left.log("left");
    right.log("right");

    const center = Vector2.center(left, right);
    center.log();
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.log("hd");
    halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
    halfDiagonal.log("hd");
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);

    imageTiles.polygons.addImagePolygon(left, bottom, center);
    imageTiles.polygons.addInvertedImagePolygon(bottom, right, center);
    imageTiles.polygons.addImagePolygon(right, top, center);
    imageTiles.polygons.addInvertedImagePolygon(top, left, center);

};
