/**
 * the straight lines of a kaleidoscope triangle make a dihedral group
 * the elements of this group create images of the curved side
 * all these images together form a nearly regular polygon:
 * its sides have the same length
 * seen from its center the sides subtend same angles
 * the corners lie at integer multiples of an anglesthe corner angles have two alternating values
 * The basic kaleidoscope makes reflections at this polygon until a point is inside the polygon
 * @namespace basicKaleidoscope
 */

/* jshint esversion:6 */

basicKaleidoscope = {};


(function() {
    "use strict";

    const big = 100;

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

    // characteristic data
    basicKaleidoscope.worldRadius = 0;
    basicKaleidoscope.worldRadius2 = 0;
    basicKaleidoscope.intersectionMirrorXAxis = 0.5; // intersection of third mirror with x-axis

    // setup
    //==================================================================

    // generate additional reflection elements

    function generateCircles() {
        var i;
        let k = basicKaleidoscope.k;
        let angle = 2 * Math.PI / k;
        let circlesLength = 2 * k;
        // make shure that we have exactly the required number of circles
        if (basicKaleidoscope.circles.length != circlesLength) {
            basicKaleidoscope.circles.length = circlesLength;
            for (i = 0; i < circlesLength; i++) {
                basicKaleidoscope.circles[i] = new Circle(0, new Vector2());
            }

        }
        // all have the same radius
        basicKaleidoscope.circles.forEach(circle => {
            circle.setRadius(basicKaleidoscope.circle.radius);
        });
        // circle centers are transformed according to the dihedral group
        let circleCenter = new Vector2();
        circleCenter.set(basicKaleidoscope.circle.center);
        let circleCenterMirrored = new Vector2();
        circleCenterMirrored.set(circleCenter);
        circleCenterMirrored.mirrorAtXAxis();
        circleCenterMirrored.rotate(angle);
        for (i = 0; i < circlesLength; i += 2) {
            basicKaleidoscope.circles[i].center.set(circleCenter);
            basicKaleidoscope.circles[i + 1].center.set(circleCenterMirrored);
            circleCenter.rotate(angle);
            circleCenterMirrored.rotate(angle);
        }
    }

    // rescale
    function scaleCircles(factor) {
        basicKaleidoscope.circles.forEach(circle => {
            circle.scale(factor);
        });
    }

    // to draw use Draw.array(basicKaleidoscope.circles);

    function generateLines() {
        var i;
        let k = basicKaleidoscope.k;
        let angle = 2 * Math.PI / k;
        let linesLength = 2 * k;
        if (basicKaleidoscope.lines.length != linesLength) {
            basicKaleidoscope.lines.length = linesLength;
            for (i = 0; i < linesLength; i++) {
                basicKaleidoscope.lines[i] = new Line(new Vector2(), new Vector2());
            }
        }
        let endPointA = new Vector2();
        endPointA.set(basicKaleidoscope.line.a);
        let endPointB = new Vector2();
        endPointB.set(basicKaleidoscope.line.b);
        let endPointAMirrored = new Vector2();
        endPointAMirrored.set(endPointA);
        endPointAMirrored.mirrorAtXAxis();
        endPointAMirrored.rotate(angle);
        let endPointBMirrored = new Vector2();
        endPointBMirrored.set(endPointB);
        endPointBMirrored.mirrorAtXAxis();
        endPointBMirrored.rotate(angle);
        for (i = 0; i < linesLength; i += 2) {
            basicKaleidoscope.lines[i].a.set(endPointA);
            basicKaleidoscope.lines[i].b.set(endPointB);
            basicKaleidoscope.lines[i + 1].a.set(endPointAMirrored);
            basicKaleidoscope.lines[i + 1].b.set(endPointBMirrored);
            endPointA.rotate(angle);
            endPointB.rotate(angle);
            endPointAMirrored.rotate(angle);
            endPointBMirrored.rotate(angle);
        }
    }

    // update lines
    function updateLines() {
        basicKaleidoscope.lines.forEach(line => {
            line.update();
        });
    }

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
        scaleCircles(factor);
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
        twoMirrors.setK(k);
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
            generateCircles();
            basicKaleidoscope.calculateWorldRadius();
            Make.setMapping(basicKaleidoscope.mappingInputImageElliptic, basicKaleidoscope.mappingStructureElliptic);
        }
        // euklidic, final
        else if (angleSum > 0.999999) {
            basicKaleidoscope.geometry = basicKaleidoscope.euclidic;
            basicKaleidoscope.line.a.setComponents(basicKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicKaleidoscope.line.b.setComponents(basicKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicKaleidoscope.line.update();
            generateLines();
            updateLines();
            Make.setMapping(basicKaleidoscope.mappingInputImageEuclidic, basicKaleidoscope.mappingStructureEuclidic);
        }
        // hyperbolic, raw, adjust
        else {
            basicKaleidoscope.geometry = basicKaleidoscope.hyperbolic;
            basicKaleidoscope.circle.setRadius(1);
            basicKaleidoscope.circle.center.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            generateCircles();
            basicKaleidoscope.calculateWorldRadius();
            Make.setMapping(basicKaleidoscope.mappingInputImageHyperbolic, basicKaleidoscope.mappingStructureHyperbolic);
        }
    };

    // drawing
    //=========================================================

    /**
     * drawing the kaleidoscope polygon
     * @method basicKaleidoscope.drawPolygon
     */
    basicKaleidoscope.drawPolygon = function() {
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                Draw.array(basicKaleidoscope.circles);
                break;
            case basicKaleidoscope.euclidic:
                Draw.array(basicKaleidoscope.lines);
                break;
            case basicKaleidoscope.hyperbolic:
                Draw.array(basicKaleidoscope.circles);
                break;
        }
    };

    // gehört zum triangleKaleidoscope

    /**
     * check if a point is inside the triangle
     * @method basicKaleidoscope.isInside
     * @param {Vector2} v
     * @return true if v is inside the triangle
     */
    basicKaleidoscope.isInside = function(v) {
        if (!twoMirrors.isInside(v)) { // twoMirrors is a static namespace
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


    /**
     * draw the mirror lines
     * @method triangleKaleidoscope.drawLines
     */
    basicKaleidoscope.drawLines = function(v) {
        twoMirrors.drawLines();
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



}());
