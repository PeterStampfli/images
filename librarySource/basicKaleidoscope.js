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

    basicKaleidoscope.dihedral = new Dihedral();
    const dihedral = basicKaleidoscope.dihedral;
    const getSectorIndex = dihedral.getSectorIndex;

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
     * set the rotational symmetries at corners, and set mapping to basic kaleidoscope
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
            basicKaleidoscope.circle.setRadius(1);
            basicKaleidoscope.circle.center.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            dihedral.generateCircles(basicKaleidoscope.circle, basicKaleidoscope.circles);
            basicKaleidoscope.calculateWorldRadius();
        }
        // euklidic, final
        else if (angleSum > 0.999999) {
            basicKaleidoscope.geometry = basicKaleidoscope.euclidic;
            basicKaleidoscope.line.a.setComponents(basicKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicKaleidoscope.line.b.setComponents(basicKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicKaleidoscope.line.update();
            dihedral.generateLines(basicKaleidoscope.line, basicKaleidoscope.lines);
            dihedral.update(lines);
        }
        // hyperbolic, raw, adjust
        else {
            basicKaleidoscope.geometry = basicKaleidoscope.hyperbolic;
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

    /**
     * draw the triangle mirror lines
     * @method basicKaleidoscope.drawTriangle
     */
    basicKaleidoscope.drawTriangle = function(v) {
        dihedral.drawMirrors();
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


    // gehört zum triangleKaleidoscope
    //------------------------------------------------------------

    /**
     * check if a point is inside the triangle
     * @method basicKaleidoscope.isInsideTriangle
     * @param {Vector2} v
     * @return true if v is inside the triangle
     */
    basicKaleidoscope.isInsideTriangle = function(v) {
        if (!dihedral.isInside(v)) {
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
        return true;
    };

    // the mappings (as building blocks)

    /**
     * maps a vector into the polygon, for elliptic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * @method basicKaleidoscope.mappingElliptic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mappingElliptic = function(v) {
        let lyapunov = 1;
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = circles[getSectorIndex(v)].invertOutsideIn(v);
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
     * @method basicKaleidoscope.mappingEuclidic
     * @param {Vector2} v - the vector to map
     * @return float, if 1 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mappingEuclidic = function(v) {
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = lines[getSectorIndex(v)].mirrorLeftToRight(v);
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
     * @method basicKaleidoscope.mappingElliptic
     * @param {Vector2} v - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mappingHyperbolic = function(v) {
        let lyapunov = 1;
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = circles[getSectorIndex(v)].invertInsideOut(v);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                basicKaleidoscope.reflections = iter;
                return lyapunov;
            }
        }
        return -1;
    };

    // and drawing the trajectories, without the ends



    /**
     * maps a vector into the polygon, for elliptic geometry
     * draws the trajectory
     * @method basicKaleidoscope.trajectoryElliptic
     * @param {Vector2} v - the vector to map
     * @return float lyapunov coefficient, relative size of output/input region
     */
    basicKaleidoscope.trajectoryElliptic = function(v) {
        let lyapunov = 1;
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = circles[getSectorIndex(v)].drawInvertOutsideIn(v);
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
     * draws the trajectory
     * @method basicKaleidoscope.trajectoryEuclidic
     * @param {Vector2} v - the vector to map
     * @return float lyapunov coefficient, relative size of output/input region
     */
    basicKaleidoscope.trajectoryEuclidic = function(v) {
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = lines[getSectorIndex(v)].drawMirrorLeftToRight(v);
            if (factor < 0) {
                basicKaleidoscope.reflections = iter;
                return 1;
            }
        }
        return -1;
    };


    /**
     * maps a vector into the polygon, for hyperbolic geometry
     * draws the trajectory
     * @method basicKaleidoscope.trajectoryElliptic
     * @param {Vector2} v - the vector to map
     * @return float lyapunov coefficient, relative size of output/input region
     */
    basicKaleidoscope.trajectoryHyperbolic = function(v) {
        let lyapunov = 1;
        var iter;
        for (iter = 0; iter < maxIterations; iter++) {
            let factor = circles[getSectorIndex(v)].drawInvertInsideOut(v);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                basicKaleidoscope.reflections = iter;
                return lyapunov;
            }
        }
        return -1;
    };




}());
