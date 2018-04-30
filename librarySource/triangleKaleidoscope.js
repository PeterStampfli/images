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
    let basicLineEndA = new Vector2();
    let basicLineEndB = new Vector2();
    let basicLine = new Line(basicLineEndA, basicLineEndB);
    let cutCornersLineEndA = new Vector2();
    let cutCornersLineEndB = new Vector2();
    let cutCornersLine = new Line(cutCornersLineEndA, cutCornersLineEndB);
    let cutSidesLineEndA = new Vector2();
    let cutSidesLineEndB = new Vector2();
    let cutSidesLine = new Line(cutSidesLineEndA, cutSidesLineEndB);

    // for elliptic and hyperbolic geometry
    let basicCircleCenter = new Vector2();
    let basicCircle = new Circle(0, basicCircleCenter);

    let cutCornersCenter = new Vector2();
    let cutCornersCircle = new Circle(0, cutCornersCenter);
    let cutSidesCenter = new Vector2();
    let cutSidesCircle = new Circle(0, cutSidesCenter);
    let bisectorPoint = new Vector2();
    let pointZero = new Vector2(0, 0);
    let bisectorLine = new Line(pointZero, bisectorPoint);



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
        bisectorPoint.setComponents(big * Fast.cos(0.5 * Math.PI / k), big * Fast.sin(0.5 * Math.PI / k));
        bisectorLine.update();
        if (angleSum > 1.000001) { // elliptic, raw, adjust
            geometry = elliptic;
            basicCircle.setRadius(1);
            basicCircleCenter.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesElliptic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryElliptic;
            Make.setMapping(triangleKaleidoscope.mappingInputImageElliptic, triangleKaleidoscope.mappingStructureElliptic);
            // semiregular extensions
            triangleKaleidoscope.calculateWorldRadius();
            //mirror rotate border for cutting corners using special symmetry
            cutCornersCenter.set(basicCircleCenter);
            cutCornersCenter.mirrorAtXAxis();
            cutCornersCenter.rotate(Math.PI / k);
            cutCornersCircle.setRadius(1);

        } else if (angleSum > 0.999999) { // euklidic, final
            geometry = euclidic;
            basicLineEndA.setComponents(triangleKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicLineEndB.setComponents(triangleKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicLine.update();
            triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEuclidic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryEuclidic;
            Make.setMapping(triangleKaleidoscope.mappingInputImageEuclidic, triangleKaleidoscope.mappingStructureEuclidic);
            cutCornersLineEndA.set(basicLineEndA);
            cutCornersLineEndA.mirrorAtXAxis();
            cutCornersLineEndA.rotate(Math.PI / k);
            cutCornersLineEndB.set(basicLineEndB);
            cutCornersLineEndB.mirrorAtXAxis();
            cutCornersLineEndB.rotate(Math.PI / k);
            cutCornersLine.update();
        } else { // hyperbolic, raw, adjust
            geometry = hyperbolic;
            basicCircle.setRadius(1);
            basicCircleCenter.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesHyperbolic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryHyperbolic;
            Make.setMapping(triangleKaleidoscope.mappingInputImageHyperbolic, triangleKaleidoscope.mappingStructureHyperbolic);
            // semiregular extensions
            triangleKaleidoscope.calculateWorldRadius();
            //mirror rotate border for cutting corners using special symmetry
            cutCornersCenter.set(basicCircleCenter);
            cutCornersCenter.mirrorAtXAxis();
            cutCornersCenter.rotate(Math.PI / k);
            cutCornersCircle.setRadius(1);

        }
        triangleKaleidoscope.calculateWorldRadius();
    };

    // semiregular extensions
    /**
     * setup for the semiregular tiling cutting corners
     * @method triangleKaleidoscope.cutCorners
     */
    triangleKaleidoscope.cutCorners = function() {
        switch (geometry) {
            case elliptic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEllipticCutCorners, triangleKaleidoscope.mappingStructureEllipticCutCorners);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEllipticCutCorners;
                break;
            case euclidic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEuclidicCutCorners, triangleKaleidoscope.mappingStructureEuclidicCutCorners);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEuclidicCutCorners;
                break;
            case hyperbolic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageHyperbolicCutCorners, triangleKaleidoscope.mappingStructureHyperbolicCutCorners);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesHyperbolicCutCorners;

                break;
        }
    };

    /**
     * setup for the semiregular tiling cutting sides
     * @method triangleKaleidoscope.cutCorners
     */
    triangleKaleidoscope.cutSides = function() {
        switch (geometry) {
            case elliptic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEllipticCutSides, triangleKaleidoscope.mappingStructureEllipticCutSides);
                break;
            case euclidic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEuclidicCutSides, triangleKaleidoscope.mappingStructureEuclidicCutSides);
                break;
            case hyperbolic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageHyperbolicCutSides, triangleKaleidoscope.mappingStructureHyperbolicCutSides);
                break;
        }
    };

    /**
     * calculate worldradius from data of the basicCircle and type of geometry
     * @method triangleKaleidoscope.calculateWorldRadius
     */
    triangleKaleidoscope.calculateWorldRadius = function() {
        let radius2 = 0;
        switch (geometry) {
            case elliptic:
                radius2 = basicCircle.radius * basicCircle.radius - basicCircleCenter.length2();
                break;
            case euclidic:
                radius2 = 1e10;
                break;
            case hyperbolic:
                radius2 = basicCircleCenter.length2() - basicCircle.radius * basicCircle.radius;
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
        let factor = newRadius / worldRadius;
        basicCircle.scale(factor);
        cutSidesCircle.scale(factor);
        cutCornersCircle.scale(factor);
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
                actualIntersection = basicCircleCenter.x + basicCircle.radius * Fast.sin(Math.PI / m);
                basicCircle.scale(triangleKaleidoscope.intersectionMirrorXAxis / actualIntersection);
                break;
            case euclidic:
                break;
            case hyperbolic:
                actualIntersection = basicCircleCenter.x - basicCircle.radius * Fast.sin(Math.PI / m);
                basicCircle.scale(triangleKaleidoscope.intersectionMirrorXAxis / actualIntersection);
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
                return basicCircle.contains(v);
            case euclidic:
                return !basicLine.isAtLeft(v);
            case hyperbolic:
                return (v.x * v.x + v.y * v.y < worldRadius2) && !basicCircle.contains(v);
        }
        return true;
    };

    /**
     * draw the mirror lines
     * @method triangleKaleidoscope.drawLines
     */
    triangleKaleidoscope.drawLinesElliptic = function() {
        twoMirrors.drawLines();
        basicCircle.draw();
    };


    triangleKaleidoscope.drawLinesEllipticCutCorners = function() {
        twoMirrors.drawLines();
        basicCircle.draw();
        Draw.setColor("green");
        cutCornersCircle.draw();
        bisectorLine.draw();
    };


    triangleKaleidoscope.drawLinesEuclidic = function() {
        twoMirrors.drawLines();
        basicLine.draw();
    };

    triangleKaleidoscope.drawLinesEuclidicCutCorners = function() {
        twoMirrors.drawLines();
        basicLine.draw();
        Draw.setColor("green");
        cutCornersLine.draw();
        bisectorLine.draw();
    };

    triangleKaleidoscope.drawLinesHyperbolic = function() {
        twoMirrors.drawLines();
        basicCircle.draw();
    };

    triangleKaleidoscope.drawLinesHyperbolicCutCorners = function() {
        twoMirrors.drawLines();
        basicCircle.draw();
        Draw.setColor("green");
        cutCornersCircle.draw();
        bisectorLine.draw();
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
            let factor = basicCircle.invertOutsideIn(mapOut);
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
            if (basicLine.mirrorLeftToRight(mapOut) < 0) {
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
            let factor = basicCircle.invertInsideOut(mapOut);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                return lyapunov;
            }
        }
        return -1;
    };

    // for the semiregular tiling cutting corners

    triangleKaleidoscope.mappingInputImageEllipticCutCorners = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        let lyapunov = 1;
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(mapOut);
            let factor = basicCircle.invertOutsideIn(mapOut);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                // now cur corner
                factor = cutCornersCircle.invertOutsideIn(mapOut);
                if (factor >= 0) {
                    lyapunov *= factor;
                }
                bisectorLine.mirrorLeftToRight(mapOut);
                return lyapunov;
            }
        }
        return -1;
    };


    triangleKaleidoscope.mappingInputImageEuclidicCutCorners = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(mapOut);
            if (basicLine.mirrorLeftToRight(mapOut) < 0) {
                cutCornersLine.mirrorRightToLeft(mapOut);
                bisectorLine.mirrorLeftToRight(mapOut);
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageHyperbolicCutCorners = function(mapIn, mapOut) {
        if (mapIn.x * mapIn.x + mapIn.y * mapIn.y > worldRadius2) { // eliminate points outside the world
            return -1;
        }
        mapOut.set(mapIn);
        let lyapunov = 1;
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(mapOut);
            let factor = basicCircle.invertInsideOut(mapOut);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                // now cur corner
                factor = cutCornersCircle.invertInsideOut(mapOut);
                if (factor >= 0) {
                    lyapunov *= factor;
                }
                bisectorLine.mirrorLeftToRight(mapOut);
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
            if (basicCircle.invertOutsideIn(mapOut) >= 0) {
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
            if (basicLine.mirrorLeftToRight(mapOut) >= 0) {
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
            if (basicCircle.invertInsideOut(mapOut) >= 0) {
                reflections++;
            } else {
                mapOut.x = reflections;
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingStructureEllipticCutCorners = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(mapOut);
            if (basicCircle.invertOutsideIn(mapOut) >= 0) {
                reflections++;
            } else {
                if (cutCornersCircle.invertOutsideIn(mapOut) >= 0) {
                    reflections++;
                }
                if (bisectorLine.mirrorLeftToRight(mapOut) >= 0) {
                    reflections++;
                }
                mapOut.x = reflections;
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingStructureEuclidicCutCorners = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        mapOut.set(mapIn);
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(mapOut);
            if (basicLine.mirrorLeftToRight(mapOut) >= 0) {
                reflections++;
            } else {
                if (cutCornersLine.mirrorRightToLeft(mapOut) > 0) {
                    reflections++;
                }
                if (bisectorLine.mirrorLeftToRight(mapOut) > 0) {
                    reflections++;
                }
                mapOut.x = reflections;
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingStructureHyperbolicCutCorners = function(mapIn, mapOut) {
        if (mapIn.x * mapIn.x + mapIn.y * mapIn.y > worldRadius2) { // eliminate points outside the world
            return -1;
        }
        mapOut.set(mapIn);
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(mapOut);
            if (basicCircle.invertInsideOut(mapOut) >= 0) {
                reflections++;
            } else {


                if (cutCornersCircle.invertInsideOut(mapOut) >= 0) {
                    reflections++;
                }
                if (bisectorLine.mirrorLeftToRight(mapOut) >= 0) {
                    reflections++;
                }

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
            factor = basicCircle.drawInvertOutsideIn(point);
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
            if (basicLine.drawMirrorLeftToRight(point) < 0) {
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
            factor = basicCircle.drawInvertInsideOut(point);
            if (factor >= 0) {
                radiusEnd *= factor;
            } else {
                Draw.circle(radiusEnd, point);
                return;
            }
        }
    };

}());
