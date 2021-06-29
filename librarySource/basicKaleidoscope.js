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
basicKaleidoscope.hasLens = false;

(function() {
    "use strict";

    const big = 100;
    basicKaleidoscope.maxIterations = 100;
    basicKaleidoscope.minIterations = 0;

    // parameters that determine the image size
    //  access from outside to be able to change values. defaults:
    basicKaleidoscope.worldRadiusElliptic = 0.97;
    basicKaleidoscope.worldRadiusHyperbolic = 0.97;
    basicKaleidoscope.intersectionMirrorXAxis = 0.3; // intersection of third mirror with x-axis

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

    // actual size data
    basicKaleidoscope.worldRadius = 0;
    basicKaleidoscope.worldRadius2 = 0;

    // elliptic geometry fills the entire plane, no cutoff at disc for negative radius
    basicKaleidoscope.ellipticDiscRadius = -1;

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
        basicKaleidoscope.xMax *= factor;
        basicKaleidoscope.yMax *= factor;
        Fast.scale(basicKaleidoscope.circles, factor);
        basicKaleidoscope.calculateWorldRadius();
    };

    /**
     * adjust the intersection point at x-axis to make it given value, and recalculate the worldradius
     * @method basicKaleidoscope.adjustIntersection
     */
    basicKaleidoscope.adjustIntersection = function() {
        var actualIntersection, factor;
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                actualIntersection = basicKaleidoscope.circle.center.x + basicKaleidoscope.circle.radius * Fast.sin(Math.PI / basicKaleidoscope.m);
                factor = basicKaleidoscope.intersectionMirrorXAxis / actualIntersection;
                basicKaleidoscope.circle.scale(factor);
                Fast.scale(basicKaleidoscope.circles, factor);
                break;
            case basicKaleidoscope.euclidic:
                break;
            case basicKaleidoscope.hyperbolic:
                actualIntersection = basicKaleidoscope.circle.center.x - basicKaleidoscope.circle.radius * Fast.sin(Math.PI / basicKaleidoscope.m);
                factor = basicKaleidoscope.intersectionMirrorXAxis / actualIntersection;
                basicKaleidoscope.circle.scale(factor);
                Fast.scale(basicKaleidoscope.circles, factor);
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
        basicKaleidoscope.angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
        //console.log(180/n);
        const cosGamma = Fast.cos(Math.PI / k);
        const sinGamma = Fast.sin(Math.PI / k);
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        // elliptic, raw, adjust
        if (basicKaleidoscope.angleSum > 1.000001) {
            basicKaleidoscope.geometry = basicKaleidoscope.elliptic;
            basicKaleidoscope.map = basicKaleidoscope.mapElliptic;
            basicKaleidoscope.circle.setRadius(1);
            basicKaleidoscope.circle.center.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            // check ranges
            const x = -(cosAlpha * cosGamma + cosBeta) / sinGamma;
            const y = -cosAlpha;
            basicKaleidoscope.yMax = y - Math.cos(Math.PI / k + Math.PI / n);
            basicKaleidoscope.xMax = Math.max(x + Math.sin(Math.PI / k + Math.PI / n), x + sinAlpha);
            dihedral.generateCircles(basicKaleidoscope.circle, basicKaleidoscope.circles);
            basicKaleidoscope.adjustWorldRadius(basicKaleidoscope.worldRadiusElliptic);
            projection.elliptic();
        }
        // euklidic, final
        else if (basicKaleidoscope.angleSum > 0.999999) {
            basicKaleidoscope.geometry = basicKaleidoscope.euclidic;
            basicKaleidoscope.map = basicKaleidoscope.mapEuclidic;
            basicKaleidoscope.line.a.setComponents(basicKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicKaleidoscope.line.b.setComponents(basicKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicKaleidoscope.line.update();
            dihedral.generateLines(basicKaleidoscope.line, basicKaleidoscope.lines);
            Fast.update(lines);
            projection.makeSpiralVector(k, m, n);
            projection.euclidic();

        }
        // hyperbolic, raw, adjust
        else {
            basicKaleidoscope.geometry = basicKaleidoscope.hyperbolic;
            basicKaleidoscope.map = basicKaleidoscope.mapHyperbolic;
            basicKaleidoscope.circle.setRadius(1);
            basicKaleidoscope.circle.center.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            // check ranges
            const x = (cosAlpha * cosGamma + cosBeta) / sinGamma;
            const y = cosAlpha;
            basicKaleidoscope.yMax = y + Math.cos(Math.PI / k + Math.PI / n);
            basicKaleidoscope.xMax = Math.max(x - Math.sin(Math.PI / k + Math.PI / n), x - sinAlpha);
            dihedral.generateCircles(basicKaleidoscope.circle, basicKaleidoscope.circles);
            basicKaleidoscope.adjustWorldRadius(basicKaleidoscope.worldRadiusHyperbolic);
            projection.hyperbolic();
        }
    };

    // what depends on the projection and the geometry
    //  Make.map.discRadius 
    // the projection

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
    // the number of reflections
    basicKaleidoscope.reflections = 0;
    // the sector containing the position
    basicKaleidoscope.sectorIndex = 0;

    /**
     * maps a vector into the polygon, for elliptic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * @method basicKaleidoscope.mapElliptic
     * @param {Vector2} position - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mapElliptic = function(position) {
        if (projection.map(position) > 0) {
            for (var iter = 0; iter < basicKaleidoscope.maxIterations; iter++) {
                basicKaleidoscope.sectorIndex = dihedral.getSectorIndex(position);
                if (circles[basicKaleidoscope.sectorIndex].invertOutsideIn(position) < 0) {
                    basicKaleidoscope.reflections = iter;
                    return 1;
                }
            }
        }
        return -1;
    };

    /**
     * maps a vector into the polygon, for euclidic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * @method basicKaleidoscope.mapEuclidic
     * @param {Vector2} position - the vector to map
     * @return float, if 1 iteration has converged, if <0 iteration has failed
     */
    basicKaleidoscope.mapEuclidic = function(position) {
        if (projection.map(position) > 0) {
            for (var iter = 0; iter < basicKaleidoscope.maxIterations; iter++) {
                basicKaleidoscope.sectorIndex = dihedral.getSectorIndex(position);
                if (lines[basicKaleidoscope.sectorIndex].mirrorLeftToRight(position) < 0) {
                    basicKaleidoscope.reflections = iter;
                    return 1;
                }
            }
        }
        return -1;
    };

    /**
     * maps a vector into the polygon, for hyperbolic geometry
     * sets basicKaleidoscope.reflections to the number of iterations
     * call only for points inside the hyperbolic world radius
     * @method basicKaleidoscope.mapElliptic
     * @param {Vector2} position - the vector to map
     * @return float if >0 iteration has converged, lyapunov coefficient, if <0 iteration has failed
     */
    basicKaleidoscope.mapHyperbolic = function(position) {
        if (basicKaleidoscope.hasLens) {
            const r2 = position.x * position.x + position.y * position.y;
            if (r2 < basicKaleidoscope.worldRadius2) {
                var factor;
                if (basicKaleidoscope.lensPositive) {
                    factor = basicKaleidoscope.lensNorm / (1 + Math.sqrt(1 - basicKaleidoscope.lensAbs * r2 / basicKaleidoscope.worldRadius2));
                } else {
                    factor = 1 / (1 - basicKaleidoscope.lensAbs + basicKaleidoscope.lensAbs * Math.sqrt(r2 / basicKaleidoscope.worldRadius2));
                }
                position.x *= factor;
                position.y *= factor;
            }
        }
        if (projection.map(position) > 0) {
            for (var iter = 0; iter < basicKaleidoscope.maxIterations; iter++) {
                basicKaleidoscope.sectorIndex = dihedral.getSectorIndex(position);
                if (circles[basicKaleidoscope.sectorIndex].invertInsideOut(position) < 0) {
                    if (iter < basicKaleidoscope.minIterations) {
                        return -1;
                    }
                    basicKaleidoscope.reflections = iter;
                    const r2 = position.x * position.x + position.y * position.y;
                    // check if point outside the poincare disc. If yes: Invert at border.
                    if (r2 > basicKaleidoscope.worldRadius2) {
                        const factor = basicKaleidoscope.worldRadius2 / r2;
                        position.x *= factor;
                        position.y *= factor;
                    }
                    return 1;
                }
            }
        }
        return -1;
    };
}());