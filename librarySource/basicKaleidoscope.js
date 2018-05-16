/**
 * the straight lines of a kaleidoscope triangle make a dihedral group
 * the elements of this group create images of the curved side
 * all these images together form a nearly regular polygon:
 * its sides have the same length
 * seen from its center the sides subtend same angles
 * the corners lie at integer multiples of an anglesthe corner angles have two alternating values.
 * The basic kaleidoscope makes reflections at this polygon until a point is inside the polygon.
 * @namespace basicKaleidoscope
 */

/* jshint esversion:6 */

basicKaleidoscope = {};


(function() {
    "use strict";

    const big = 100;
    const maxIterations = 100;

    // the mapping, automatically symmetry dependent
    basicKaleidoscope.map = basicKaleidoscope.mapHyperbolic;

    basicKaleidoscope.dihedral = new Dihedral();
    const dihedral = basicKaleidoscope.dihedral;

    // parameters of the triangle
    basicKaleidoscope.k = 0;
    basicKaleidoscope.m = 0;
    basicKaleidoscope.n = 0;

    // switching between different geometries
    basicKaleidoscope.geometry = 0;
    basicKaleidoscope.elliptic = 1;
    basicKaleidoscope.euclidic = 2;
    basicKaleidoscope.hyperbolic = 3;

    // the third sides of the triangle
    basicKaleidoscope.circle = new Circle(0, new Vector2());
    basicKaleidoscope.line = new Line(new Vector2(), new Vector2());

    // the images of the third side of the triangle
    basicKaleidoscope.circles = [];
    basicKaleidoscope.lines = [];
    const circles = basicKaleidoscope.circles;
    const lines = basicKaleidoscope.lines;

    // characteristic data
    basicKaleidoscope.worldRadius = 0;
    basicKaleidoscope.worldRadius2 = 0;
    basicKaleidoscope.intersectionMirrorXAxis = 0.5; // intersection of third mirror with x-axis

    // setup
    //==================================================================


    /**
     * calculate worldradius from data of the circle and type of geometry
     * @method basicKaleidoscope.calculateWorldRadius
     */
    basicKaleidoscope.calculateWorldRadius = function() {
        let radius2 = 0;
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                radius2 = basicKaleidoscope.circle.radius * basicKaleidoscope.circle.radius - basicKaleidoscope.circle.center.length2();
                break;
            case basicKaleidoscope.euclidic:
                radius2 = 1e10;
                break;
            case basicKaleidoscope.hyperbolic:
                radius2 = basicKaleidoscope.circle.center.length2() - basicKaleidoscope.circle.radius * basicKaleidoscope.circle.radius;
                break;
        }
        basicKaleidoscope.worldRadius = Math.sqrt(radius2);
        basicKaleidoscope.worldRadius2 = radius2;
    };

    /**
     * adjust worldradius to given value for hyperbolic and elliptic geometry
     * @method basicKaleidoscope.adjustWorldRadius
     * @param {float} newRadius
     */
    basicKaleidoscope.adjustWorldRadius = function(newRadius) {
        basicKaleidoscope.calculateWorldRadius();
        let factor = newRadius / basicKaleidoscope.worldRadius;
        basicKaleidoscope.circle.scale(factor);
        dihedral.scale(basicKaleidoscope.circles, factor);
        basicKaleidoscope.calculateWorldRadius();
    };


    /**
     * adjust the intersection point at x-axis to make it given value, and recalculate the worldradius
     * @method basicKaleidoscope.adjustIntersection
     */
    basicKaleidoscope.adjustIntersection = function() {
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                let actualIntersection = basicKaleidoscope.circle.center.x + basicKaleidoscope.circle.radius * Fast.sin(Math.PI / m);
                let factor = basicKaleidoscope.intersectionMirrorXAxis / actualIntersection;
                basicKaleidoscope.circle.scale(factor);
                scaleCircles(factor);
                break;
            case basicKaleidoscope.euclidic:
                break;
            case basicKaleidoscope.hyperbolic:
                actualIntersection = basicKaleidoscope.circle.center.x - basicKaleidoscope.circle.radius * Fast.sin(Math.PI / m);
                factor = basicKaleidoscope.intersectionMirrorXAxis / actualIntersection;
                basicKaleidoscope.circle.scale(factor);
                scaleCircles(factor);
                break;
        }
        basicKaleidoscope.calculateWorldRadius();
    };

    /**
     * set the rotational symmetries at corners
     * @method basicKaleidoscope.setKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    basicKaleidoscope.setKMN = function(k, m, n) {
        basicKaleidoscope.k = k;
        basicKaleidoscope.m = m;
        basicKaleidoscope.n = n;
        dihedral.setOrder(k);
        const angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
        const cosGamma = Fast.cos(Math.PI / k);
        const sinGamma = Fast.sin(Math.PI / k);
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        // elliptic, raw, adjust
        if (angleSum > 1.000001) {
            basicKaleidoscope.geometry = basicKaleidoscope.elliptic;
            basicKaleidoscope.map = basicKaleidoscope.mapElliptic;
            basicKaleidoscope.circle.setRadius(1);
            basicKaleidoscope.circle.center.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            dihedral.generateCircles(basicKaleidoscope.circle, basicKaleidoscope.circles);
            basicKaleidoscope.calculateWorldRadius();
        }
        // euklidic, final
        else if (angleSum > 0.999999) {
            basicKaleidoscope.geometry = basicKaleidoscope.euclidic;
            basicKaleidoscope.map = basicKaleidoscope.mapEuclidic;
            basicKaleidoscope.line.a.setComponents(basicKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicKaleidoscope.line.b.setComponents(basicKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicKaleidoscope.line.update();
            dihedral.generateLines(basicKaleidoscope.line, basicKaleidoscope.lines);
            dihedral.update(lines);
        }
        // hyperbolic, raw, adjust
        else {
            basicKaleidoscope.geometry = basicKaleidoscope.hyperbolic;
            basicKaleidoscope.map = basicKaleidoscope.mapHyperbolic;
            basicKaleidoscope.circle.setRadius(1);
            basicKaleidoscope.circle.center.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            dihedral.generateCircles(basicKaleidoscope.circle, basicKaleidoscope.circles);
            basicKaleidoscope.calculateWorldRadius();
        }
    };

    // drawing, basic building block for different kaleidoscopes
    //=========================================================

    /**
     * drawing the kaleidoscope polygon
     * @method basicKaleidoscope.drawPolygon
     */
    basicKaleidoscope.drawPolygon = function() {
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                Draw.array(circles);
                break;
            case basicKaleidoscope.euclidic:
                Draw.array(lines);
                break;
            case basicKaleidoscope.hyperbolic:
                Draw.array(circles);
                break;
        }
    };

    //-----------------------------------------------------------------


    // the mappings (as building blocks)

    /**
     * maps a vector into the polygon, for elliptic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * @method basicKaleidoscope.mapElliptic
     * @param {Vector2} position - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mapElliptic = function(position) {
        let lyapunov = 1;
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = circles[dihedral.getSectorIndex(position)].invertOutsideIn(position);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                basicKaleidoscope.reflections = iter;
                return lyapunov;
            }
        }
        return -1;
    };


    /**
     * maps a vector into the polygon, for euclidic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * @method basicKaleidoscope.mapEuclidic
     * @param {Vector2} position - the vector to map
     * @return float, if 1 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mapEuclidic = function(position) {
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = lines[dihedral.getSectorIndex(position)].mirrorLeftToRight(position);
            if (factor < 0) {
                basicKaleidoscope.reflections = iter;
                return 1;
            }
        }
        return -1;
    };


    /**
     * maps a vector into the polygon, for hyperbolic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * @method basicKaleidoscope.mapElliptic
     * @param {Vector2} position - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mapHyperbolic = function(position) {
        if (position.x * position.x + position.y * position.y > basicKaleidoscope.worldRadius2) { // eliminate points outside the world
            return -1;
        }
        let lyapunov = 1;
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = circles[dihedral.getSectorIndex(position)].invertInsideOut(position);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                basicKaleidoscope.reflections = iter;
                return lyapunov;
            }
        }
        return -1;
    };

    // and drawing the trajectories


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


}());
