/* jshint esversion:6 */


const maxIterations = 100;
const circles = basicKaleidoscope.circles;
const lines = basicKaleidoscope.lines;
const dihedral = basicKaleidoscope.dihedral;


/**
 * draws the trajectory from mapping a vector into the polygon
 * and generates points with relative sizes
 * @method basicKaleidoscope.drawTrajectory
 * @param {arrayOfVector2} positions - last position at start is starting position, all map results will be pushed onto this array
 * @param {arrayOfFloats} sizes - last size is used for start, all map results will be pushed onto
 * @return float if >0 total lyapunov coefficient, if <0 mapping failed
 */
basicKaleidoscope.drawTrajectory = function(positions, sizes) {
    let size = sizes[sizes.length - 1];
    let position = positions[positions.length - 1].clone();
    let factor = 1;
    var iter;
    for (iter = 0; iter < maxIterations; iter++) {
        switch (basicKaleidoscope.geometry) { // we draw only one trajectory and need not be efficient
            case basicKaleidoscope.elliptic:
                factor = circles[dihedral.getSectorIndex(position)].drawInvertOutsideIn(position);
                break;
            case basicKaleidoscope.euclidic:
                factor = lines[dihedral.getSectorIndex(position)].drawMirrorLeftToRight(position);
                break;
            case basicKaleidoscope.hyperbolic:
                factor = circles[dihedral.getSectorIndex(position)].drawInvertInsideOut(position);
                break;
        }
        if (factor >= 0) {
            size *= factor;
            positions.push(position.clone());
            sizes.push(size);
        } else {
            return size;
        }
    }
    return -1;
};


/**
 * draw the points of the trajectory with correct relative sizes, smallest is nullradius
 * @method basicKaleidoscope.drawEndPoints
 * @param {ArrayVector2} positions
 * @param {ArrayOfFloat} sizes
 * @param {float} nullRadius
 */
basicKaleidoscope.drawEndPoints = function(positions, sizes, nullRadius) {
    let sizesLength = sizes.length;
    let endSize = sizes[sizesLength - 1];
    if (endSize < 0) {
        return;
    }
    if (endSize < 1) {
        nullRadius /= endSize;
    }
    for (var i = 0; i < sizesLength; i++) {
        Draw.circle(nullRadius * sizes[i], positions[i]);
    }
};

/**
 * draw the triangle mirror lines for derived kaleidoscopes
 * @method basicKaleidoscope.drawTriangle
 */
basicKaleidoscope.drawTriangle = function(v) {
    basicKaleidoscope.dihedral.drawMirrors();
    switch (basicKaleidoscope.geometry) {
        case basicKaleidoscope.elliptic:
            basicKaleidoscope.circle.draw();
            break;
        case basicKaleidoscope.euclidic:
            basicKaleidoscope.line.draw();
            break;
        case basicKaleidoscope.hyperbolic:
            basicKaleidoscope.circle.draw();
            break;
    }
};


/**
 * check if a point is inside the triangle
 * @method basicKaleidoscope.isInsideTriangle
 * @param {Vector2} v
 * @return true if v is inside the triangle
 */
basicKaleidoscope.isInsideTriangle = function(v) {
    if (!basicKaleidoscope.dihedral.isInside(v)) {
        return false;
    }
    switch (basicKaleidoscope.geometry) {
        case basicKaleidoscope.elliptic:
            return basicKaleidoscope.circle.contains(v);
        case basicKaleidoscope.euclidic:
            return !basicKaleidoscope.line.isAtLeft(v);
        case basicKaleidoscope.hyperbolic:
            return (v.x * v.x + v.y * v.y < basicKaleidoscope.worldRadius2) && !basicKaleidoscope.circle.contains(v);
    }
};



/**
 * draw the trajectory with endpoints of sizes reflecting the lyapunov coefficient of the map
 * @method threeMirrorsKaleidoscope.drawTrajectory
 * @param {Vector2} position
 * @param {float} nullRadius
 * @param {String} pointColor - color for (end)ponts, css strings
 */
threeMirrorsKaleidoscope.drawTrajectory = function(position, nullRadius, pointColor) {
    let positions = [];
    positions.push(position.clone());
    let sizes = [];
    sizes.push(1);
    let lyapunov = basicKaleidoscope.drawTrajectory(positions, sizes);
    if (lyapunov > 0) {
        let position = positions[positions.length - 1].clone();
        basicKaleidoscope.dihedral.drawMap(position);
        positions.push(position);
        sizes.push(sizes[sizes.length - 1]);
        Draw.setColor(pointColor);
        basicKaleidoscope.drawEndPoints(positions, sizes, nullRadius);
    }
};

//==========================================================================================
