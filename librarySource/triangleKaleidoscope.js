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
        // for semiregular
        bisectorPoint.setComponents(big * Fast.cos(0.5 * Math.PI / k), big * Fast.sin(0.5 * Math.PI / k));
        bisectorLine.update();
        // elliptic, raw, adjust
        if (angleSum > 1.000001) {
            geometry = elliptic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryElliptic;
            basicCircle.setRadius(1);
            basicCircleCenter.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            // semiregular extensions
            //mirror rotate border for cutting corners using special symmetry
            cutCornersCenter.set(basicCircleCenter);
            cutCornersCenter.mirrorAtXAxis();
            cutCornersCenter.rotate(Math.PI / k);
            cutCornersCircle.setRadius(1);
            // cutting sides
            triangleKaleidoscope.calculateWorldRadius();
            let intersection = basicCircleCenter.x + Fast.cathe(basicCircle.radius, basicCircleCenter.y);
            let d = 0.5 * (worldRadius2 - intersection * intersection) / intersection / cosGamma;
            cutSidesCenter.setComponents(-d * cosGamma, -d * sinGamma);
            cutSidesCircle.setRadius(Math.hypot(d, worldRadius));
        }
        // euklidic, final
        else if (angleSum > 0.999999) {
            geometry = euclidic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryEuclidic;
            basicLineEndA.setComponents(triangleKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicLineEndB.setComponents(triangleKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicLine.update();
            //semiregular, cutting corners
            cutCornersLineEndA.set(basicLineEndA);
            cutCornersLineEndA.mirrorAtXAxis();
            cutCornersLineEndA.rotate(Math.PI / k);
            cutCornersLineEndB.set(basicLineEndB);
            cutCornersLineEndB.mirrorAtXAxis();
            cutCornersLineEndB.rotate(Math.PI / k);
            cutCornersLine.update();
            // cutting sides
            let d = triangleKaleidoscope.intersectionMirrorXAxis;
            cutSidesLineEndA.setComponents(d, 0);
            cutSidesLineEndB.setComponents(d * (1 - sinGamma * sinGamma), d * sinGamma * cosGamma);
            cutSidesLine.update();
        }
        // hyperbolic, raw, adjust
        else {
            geometry = hyperbolic;
            triangleKaleidoscope.drawTrajectory = triangleKaleidoscope.drawTrajectoryHyperbolic;
            basicCircle.setRadius(1);
            basicCircleCenter.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            // semiregular extensions
            //mirror rotate border for cutting corners using special symmetry
            cutCornersCenter.set(basicCircleCenter);
            cutCornersCenter.mirrorAtXAxis();
            cutCornersCenter.rotate(Math.PI / k);
            cutCornersCircle.setRadius(1);
            // cutting side with angle of 90 degrees
            triangleKaleidoscope.calculateWorldRadius();
            let intersection = basicCircleCenter.x - Fast.cathe(basicCircle.radius, basicCircleCenter.y);
            let d = 0.5 * (worldRadius2 + intersection * intersection) / intersection / cosGamma;
            cutSidesCenter.setComponents(d * cosGamma, d * sinGamma);
            cutSidesCircle.setRadius(Fast.cathe(d, worldRadius));
        }
        triangleKaleidoscope.regular();
    };

    /**
     * setup for the regular tiling
     * @method triangleKaleidoscope.regular
     */
    triangleKaleidoscope.regular = function() {
        switch (geometry) {
            case elliptic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageElliptic, triangleKaleidoscope.mappingStructureElliptic);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesElliptic;
                break;
            case euclidic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEuclidic, triangleKaleidoscope.mappingStructureEuclidic);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEuclidic;
                break;
            case hyperbolic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageHyperbolic, triangleKaleidoscope.mappingStructureHyperbolic);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesHyperbolic;
                break;
        }
    };

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
     * @method triangleKaleidoscope.cutSides
     */
    triangleKaleidoscope.cutSides = function() {
        switch (geometry) {
            case elliptic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEllipticCutSides, triangleKaleidoscope.mappingStructureEllipticCutSides);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEllipticCutSides;
                break;
            case euclidic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageEuclidicCutSides, triangleKaleidoscope.mappingStructureEuclidicCutSides);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesEuclidicCutSides;
                break;
            case hyperbolic:
                Make.setMapping(triangleKaleidoscope.mappingInputImageHyperbolicCutSides, triangleKaleidoscope.mappingStructureHyperbolicCutSides);
                triangleKaleidoscope.drawLines = triangleKaleidoscope.drawLinesHyperbolicCutSides;
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

    triangleKaleidoscope.drawLinesEllipticCutSides = function() {
        twoMirrors.drawLines();
        basicCircle.draw();
        Draw.setColor("green");
        cutSidesCircle.draw();
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

    triangleKaleidoscope.drawLinesEuclidicCutSides = function() {
        twoMirrors.drawLines();
        basicLine.draw();
        Draw.setColor("green");
        cutSidesLine.draw();
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

    triangleKaleidoscope.drawLinesHyperbolicCutSides = function() {
        twoMirrors.drawLines();
        basicCircle.draw();
        Draw.setColor("green");
        cutSidesCircle.draw();
    };

    /**
     * mapping to create an image based on an input image, symmetry dependent
     * @method TriangleKaleidoscope#mappingInputImage
     * @param {Vector2} mapIn
     * @param {Vector2} position - input->output
     */
    triangleKaleidoscope.mappingInputImageElliptic = function(position) {
        let lyapunov = 1;
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(position);
            let factor = basicCircle.invertOutsideIn(position);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                return lyapunov;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageEuclidic = function(position) {
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(position);
            if (basicLine.mirrorLeftToRight(position) < 0) {
                return 1;
            }
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageHyperbolic = function(position) {
        if (position.x * position.x + position.y * position.y > worldRadius2) { // eliminate points outside the world
            return -1;
        }
        let lyapunov = 1;
        let iter = 0;
        while (iter < maxIterations) {
            iter++;
            twoMirrors.map(position);
            let factor = basicCircle.invertInsideOut(position);
            if (factor >= 0) {
                lyapunov *= factor;
            } else {
                return lyapunov;
            }
        }
        return -1;
    };

    // for the semiregular tiling cutting corners

    triangleKaleidoscope.mappingInputImageEllipticCutCorners = function(position) {
        let lyapunov = triangleKaleidoscope.mappingInputImageElliptic(position);
        if (lyapunov >= 0) {
            let factor = cutCornersCircle.invertOutsideIn(position);
            if (factor >= 0) {
                lyapunov *= factor;
            }
            bisectorLine.mirrorLeftToRight(position);
            return lyapunov;
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageEllipticCutSides = function(position) {
        let lyapunov = triangleKaleidoscope.mappingInputImageElliptic(position);
        if (lyapunov >= 0) {
            let factor = cutSidesCircle.invertOutsideIn(position);
            if (factor >= 0) {
                lyapunov *= factor;
            }
            return lyapunov;
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageEuclidicCutCorners = function(position) {
        if (triangleKaleidoscope.mappingInputImageEuclidic(position) >= 0) {
            cutCornersLine.mirrorRightToLeft(position);
            bisectorLine.mirrorLeftToRight(position);
            return 1;
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageEuclidicCutSides = function(position) {
        if (triangleKaleidoscope.mappingInputImageEuclidic(position) >= 0) {
            cutSidesLine.mirrorRightToLeft(position);
            return 1;
        }
        return -1;
    };

    triangleKaleidoscope.mappingInputImageHyperbolicCutCorners = function(position) {
        let lyapunov = triangleKaleidoscope.mappingInputImageHyperbolic(position);
        if (lyapunov >= 0) {
            let factor = cutCornersCircle.invertInsideOut(position);
            if (factor >= 0) {
                lyapunov *= factor;
            }
            bisectorLine.mirrorLeftToRight(position);
            return lyapunov;
        }
        return -1;
    };


    triangleKaleidoscope.mappingInputImageHyperbolicCutSides = function(position) {
        let lyapunov = triangleKaleidoscope.mappingInputImageHyperbolic(position);
        if (lyapunov >= 0) {
            let factor = cutSidesCircle.invertInsideOut(position);
            if (factor >= 0) {
                lyapunov *= factor;
            }
            return lyapunov;
        }
        return -1;
    };

    /**
     * generic: calculate number of reflections due to mapping, symmetry dependent, regular tiling
     * @method TriangleKaleidoscope#numberOfReflections
     * @param {Vector2} mapIn
     * @param {Vector2} position 
     * @return absolute value of reflections>0 if valid point, <0 if invalid
     */
    triangleKaleidoscope.numberOfReflectionsElliptic = function(position) {
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(position);
            if (basicCircle.invertOutsideIn(position) >= 0) {
                reflections++;
            } else {
                return Math.abs(reflections);
            }
        }
        return -1;
    };

    triangleKaleidoscope.numberOfReflectionsEuclidic = function(position) {
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(position);
            if (basicLine.mirrorLeftToRight(position) >= 0) {
                reflections++;
            } else {
                return Math.abs(reflections);
            }
        }
        return -1;
    };

    triangleKaleidoscope.numberOfReflectionsHyperbolic = function(position) {
        if (position.x * position.x + position.y * position.y > worldRadius2) { // eliminate points outside the world
            return -1;
        }
        let iter = 0;
        let reflections = 0;
        while (iter < maxIterations) {
            iter++;
            reflections += twoMirrors.map(position);
            if (basicCircle.invertInsideOut(position) >= 0) {
                reflections++;
            } else {
                return Math.abs(reflections);
            }
        }
        return -1;
    };

    /**
     * generic: mapping to create an image based on an input image, symmetry dependent
     * @method TriangleKaleidoscope#mappingStructure
     * @param {Vector2} position - x component will have number of reflections
     * @return >0 if valid point, <0 if invalid
     */
    triangleKaleidoscope.mappingStructureElliptic = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsElliptic(position);
        position.x = reflections;
        return reflections;
    };

    triangleKaleidoscope.mappingStructureEuclidic = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsEuclidic(position);
        position.x = reflections;
        return reflections;
    };

    triangleKaleidoscope.mappingStructureHyperbolic = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsHyperbolic(position);
        position.x = reflections;
        return reflections;
    };

    triangleKaleidoscope.mappingStructureEllipticCutCorners = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsElliptic(position);
        if (reflections >= 0) {
            if (cutCornersCircle.invertOutsideIn(position) > 0) {
                reflections++;
            }
            if (bisectorLine.mirrorLeftToRight(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return reflections;

    };

    triangleKaleidoscope.mappingStructureEllipticCutSides = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsElliptic(position);
        if (reflections >= 0) {
            if (cutSidesCircle.invertOutsideIn(position) >= 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return reflections;
    };

    triangleKaleidoscope.mappingStructureEuclidicCutCorners = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsEuclidic(position);
        if (reflections >= 0) {
            if (cutCornersLine.mirrorRightToLeft(position) > 0) {
                reflections++;
            }
            if (bisectorLine.mirrorLeftToRight(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return reflections;
    };

    triangleKaleidoscope.mappingStructureEuclidicCutSides = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsEuclidic(position);
        if (reflections >= 0) {
            if (cutSidesLine.mirrorRightToLeft(position) > 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return reflections;
    };


    triangleKaleidoscope.mappingStructureHyperbolicCutCorners = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsHyperbolic(position);
        if (reflections >= 0) {
            if (cutCornersCircle.invertInsideOut(position) >= 0) {
                reflections++;
            }
            if (bisectorLine.mirrorLeftToRight(position) >= 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return reflections;
    };

    // cutting the side for hyperbolic geometry
    triangleKaleidoscope.mappingStructureHyperbolicCutSides = function(position) {
        let reflections = triangleKaleidoscope.numberOfReflectionsHyperbolic(position);
        if (reflections >= 0) {
            if (cutSidesCircle.invertInsideOut(position) >= 0) {
                reflections++;
            }
        }
        position.x = reflections;
        return reflections;
    };

    /**
     * draw the trajectory
     * @method triangleKaleidoscope.drawTrajectory
     * @param {float} radius - for the smaller circle
     * @param {Vector2} point - starting point in space coordinates
     * @param {String} lineColor
     * @param {String} dotColor
     */

    // decreasing lyapunov<<1
    triangleKaleidoscope.drawTrajectoryElliptic = function(radius, point, lineColor, dotColor) {
        let iter = 0;
        let factor = 0;
        let startPoint = new Vector2();
        startPoint.set(point);
        let radiusStart = radius;
        Draw.setColor(lineColor);
        while (iter < maxIterations) {
            iter++;
            twoMirrors.drawMap(point);
            factor = basicCircle.drawInvertOutsideIn(point);
            if (factor >= 0) {
                radiusStart /= factor;
            } else {
                Draw.setColor(dotColor);
                Draw.circle(radiusStart, startPoint);
                Draw.circle(radius, point);
                return;
            }
        }
    };

    // same size, lyapunov==1
    triangleKaleidoscope.drawTrajectoryEuclidic = function(radius, point, lineColor, dotColor) {
        let iter = 0;
        Draw.setColor(dotColor);
        Draw.circle(radius, point);
        Draw.setColor(lineColor);
        while (iter < maxIterations) {
            iter++;
            twoMirrors.drawMap(point);
            if (basicLine.drawMirrorLeftToRight(point) < 0) {
                Draw.setColor(dotColor);
                Draw.circle(radius, point);
                return;
            }
        }
    };

    // last point will be large lyapunov >>1
    triangleKaleidoscope.drawTrajectoryHyperbolic = function(radius, point, lineColor, dotColor) {
        if (point.x * point.x + point.y * point.y > worldRadius2) { // eliminate points outside the world
            return;
        }
        let iter = 0;
        let factor = 0;
        Draw.setColor(dotColor);
        Draw.circle(radius, point);
        let radiusEnd = radius;
        Draw.setColor(lineColor);
        while (iter < maxIterations) {
            iter++;
            twoMirrors.drawMap(point);
            factor = basicCircle.drawInvertInsideOut(point);
            if (factor >= 0) {
                radiusEnd *= factor;
            } else {
                Draw.setColor(dotColor);
                Draw.circle(radiusEnd, point);
                return;
            }
        }
    };

}());
