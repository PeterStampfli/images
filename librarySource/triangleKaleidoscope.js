/**
 * kaleidoscopes using triangles in different geometries depending on sum of angles
 * @namespace triangleKaleidoscope
 */

/* jshint esversion:6 */

triangleKaleidoscope = {};

(function() {
    "use strict";

    const maxIterations = 100;

    let geometry = 0;

    // geometries
    const elliptic = 1;
    const euclidic = 2;
    const hyperbolic = 3;
    var k, m, n;

    // for euclidic geometry
    let big = 100;
    let pointP = new Vector2();
    let pointQ = new Vector2();
    let pointZero = new Vector2(0, 0);
    let mirrorLine = new Line(pointP, pointQ);
    // for elliptic and hyperbolic geometry
    let circleCenter = new Vector2();
    let mirrorCircle = new Circle(0, circleCenter);

    triangleKaleidoscope.intersectionMirrorXAxis = 0.5; // target value, intersection between third mirror and x-axis, especially for euclidic case
    let worldRadius = 0; // call let calculateWorldRadius to update value
    let worldRadius2 = 0;






    /**
     * set the rotational symmetries at corners
     * @method triangleKaleidoscope.setKMN
     * @param {integer} kp - symmetry at center corner
     * @param {integer} mp - symmetry at "right" corner
     * @param {integer} np - symmetry at "left" corner
     */
    triangleKaleidoscope.setKMN = function(kp, mp, np) {
        k = kp;
        m = mp;
        n = np;
        twoMirrors.setK(k);
        const angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
        const cosGamma = Fast.cos(Math.PI / k);
        const sinGamma = Fast.sin(Math.PI / k);
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        if (angleSum > 1.000001) { // elliptic, raw, adjust
            geometry = elliptic;
            mirrorCircle.setRadius(1);
            circleCenter.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesElliptic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryElliptic;
            Make.setMapping(triangleKaleidoscope.mappingInputImageElliptic, triangleKaleidoscope.mappingStructureElliptic);
        } else if (angleSum > 0.999999) { // euklidic, final
            geometry = euclidic;
            pointP.setComponents(triangleKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            pointQ.setComponents(triangleKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            mirrorLine.update();
            triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEuclidic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryEuclidic;
            Make.setMapping(triangleKaleidoscope.mappingInputImageEuclidic, triangleKaleidoscope.mappingStructureEuclidic);
        } else { // hyperbolic, raw, adjust
            geometry = hyperbolic;
            mirrorCircle.setRadius(1);
            circleCenter.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesHyperbolic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryHyperbolic;
            Make.setMapping(triangleKaleidoscope.mappingInputImageHyperbolic, triangleKaleidoscope.mappingStructureHyperbolic);
        }
        triangleKaleidoscope.calculateWorldRadius();
    };

    /**
     * calculate worldradius from data of the mirrorCircle and type of geometry
     * @method triangleKaleidoscope.calculateWorldRadius
     */
    triangleKaleidoscope.calculateWorldRadius = function() {
        let radius2 = 0;
        switch (geometry) {
            case elliptic:
                radius2 = mirrorCircle.radius * mirrorCircle.radius - circleCenter.length2();
                break;
            case euclidic:
                radius2 = 1e10;
                break;
            case hyperbolic:
                radius2 = circleCenter.length2() - mirrorCircle.radius * mirrorCircle.radius;
                break;
        }
        worldRadius = Math.sqrt(radius2);
        worldRadius2 = radius2;
    };

    /**
     * adjust worldradius to given value for hyperbolic and elliptic geometry
     * @method triangleKaleidoscope.adjustWorldRadius
     * @param {float} newRadius
     */
    triangleKaleidoscope.adjustWorldRadius = function(newRadius) {
        triangleKaleidoscope.calculateWorldRadius();
        mirrorCircle.scale(newRadius / worldRadius);
        triangleKaleidoscope.calculateWorldRadius();
    };

    /**
     * adjust the intersection point at x-axis to make it given value, and recalculate the worldradius
     * @method triangleKaleidoscope.adjustIntersection
     */
    triangleKaleidoscope.adjustIntersection = function() {
        let actualIntersection = 0;
        switch (geometry) {
            case elliptic:
                actualIntersection = circleCenter.x + mirrorCircle.radius * Fast.sin(Math.PI / m);
                mirrorCircle.scale(triangleKaleidoscope.intersectionMirrorXAxis / actualIntersection);
                break;
            case euclidic:
                break;
            case hyperbolic:
                actualIntersection = circleCenter.x - mirrorCircle.radius * Fast.sin(Math.PI / m);
                mirrorCircle.scale(triangleKaleidoscope.intersectionMirrorXAxis / actualIntersection);
                break;
        }
        triangleKaleidoscope.calculateWorldRadius();
    };

    /**
     * check if a point is inside the triangle
     * @method triangleKaleidoscope.isInside
     * @param {Vector2} v
     * @return true if v is inside the triangle
     */
    triangleKaleidoscope.isInside = function(v) {
        if (!twoMirrors.isInside(v)) {
            return false;
        }
        switch (geometry) {
            case elliptic:
                return mirrorCircle.contains(v);
            case euclidic:
                return !mirrorLine.isAtLeft(v);
            case hyperbolic:
                return (v.x * v.x + v.y * v.y < worldRadius2) && !mirrorCircle.contains(v);
        }
        return true;
    };

    /**
     * draw the mirror lines
     * @method triangleKaleidoscope.drawLines
     */
    triangleKaleidoscope.drawLinesElliptic = function() {
        twoMirrors.drawLines();
        mirrorCircle.draw();
    };

    triangleKaleidoscope.drawLinesEuclidic = function() {
        twoMirrors.drawLines();
        mirrorLine.draw();
    };

    triangleKaleidoscope.drawLinesHyperbolic = function() {
        twoMirrors.drawLines();
        mirrorCircle.draw();
    };

    /**
     * mapping to create an image based on an input image, symmetry dependent
     * @method TriangleKaleidoscope#mappingInputImage
     * @param {Vector2} mapIn
     * @param {Vector2} mapOut
     */
    triangleKaleidoscope.mappingInputImageElliptic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        let lyapunov = 1;
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(mapOut);
            let factor = mirrorCircle.invertOutsideIn(mapOut);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                return lyapunov;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageEuclidic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        mapOut.set(mapIn);
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(mapOut);
            if (mirrorLine.mirrorLeftToRight(mapOut) < 0) {
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageHyperbolic = function(mapIn, mapOut) {
        if (mapIn.x * mapIn.x + mapIn.y * mapIn.y > worldRadius2) { // eliminate points outside the world
            return -1;
        }
        mapOut.set(mapIn);
        let lyapunov = 1;
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(mapOut);
            let factor = mirrorCircle.invertInsideOut(mapOut);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                return lyapunov;
            }
        }
        return -1;
    };

    /**
     * mapping to create an image based on an input image, symmetry dependent
     * @method TriangleKaleidoscope#mappingStructure
     * @param {Vector2} mapIn
     * @param {Vector2} mapOut
     */
    triangleKaleidoscope.mappingStructureElliptic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(mapOut);
            if (mirrorCircle.invertOutsideIn(mapOut) >= 0) {
                reflections++;
            } else {
                mapOut.x = reflections;
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingStructureEuclidic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        mapOut.set(mapIn);
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(mapOut);
            if (mirrorLine.mirrorLeftToRight(mapOut) >= 0) {
                reflections++;
            } else {
                mapOut.x = reflections;
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingStructureHyperbolic = function(mapIn, mapOut) {
        if (mapIn.x * mapIn.x + mapIn.y * mapIn.y > worldRadius2) { // eliminate points outside the world
            return -1;
        }
        mapOut.set(mapIn);
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(mapOut);
            if (mirrorCircle.invertInsideOut(mapOut) >= 0) {
                reflections++;
            } else {
                mapOut.x = reflections;
                return 1;
            }
        }
        return -1;
    };

    /**
     * draw the trajectory
     * @method triangleKaleidoscope.drawTrajectory
     * @param {float} radius - for the smaller circle
     * @param {Vector2} point
     */

    // decreasing lyapunov<<1
    triangleKaleidoscope.drawTrajectoryElliptic = function(radius, point) {
        let iter = 0;
        let factor = 0;
        let startPoint = new Vector2();
        startPoint.set(point);
        let radiusStart = radius;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.drawMap(point);
            factor = mirrorCircle.drawInvertOutsideIn(point);
            if (factor >= 0) {
                radiusStart /= factor;
            } else {
                Draw.circle(radiusStart, startPoint);
                Draw.circle(radius, point);
                return;
            }
        }
    };

    // same size, lyapunov==1
    triangleKaleidoscope.drawTrajectoryEuclidic = function(radius, point) {
        let iter = 0;
        Draw.circle(radius, point);
        while (iter < maxIterations) {
            iter++;
            twoMirrors.drawMap(point);
            if (mirrorLine.drawMirrorLeftToRight(point) < 0) {
                Draw.circle(radius, point);
                return;
            }
        }
    };

    // last point will be large lyapunov >>1
    triangleKaleidoscope.drawTrajectoryHyperbolic = function(radius, point) {
        if (point.x * point.x + point.y * point.y > worldRadius2) { // eliminate points outside the world
            return;
        }
        let iter = 0;
        let factor = 0;
        Draw.circle(radius, point);
        let radiusEnd = radius;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.drawMap(point);
            factor = mirrorCircle.drawInvertInsideOut(point);
            if (factor >= 0) {
                radiusEnd *= factor;
            } else {
                Draw.circle(radiusEnd, point);
                return;
            }
        }
    };

}());
