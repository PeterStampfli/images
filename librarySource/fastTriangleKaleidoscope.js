/**
 * kaleidoscopes using triangles in different geometries depending on sum of angles
 * @namespace fastTriangleKaleidoscope
 */

/* jshint esversion:6 */

fastTriangleKaleidoscope = {};

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
    let lines = [];
    // semiregulars
    let cutCornersLineEndA = new Vector2();
    let cutCornersLineEndB = new Vector2();
    let cutCornersLine = new Line(cutCornersLineEndA, cutCornersLineEndB);
    let cutSidesLineEndA = new Vector2();
    let cutSidesLineEndB = new Vector2();
    let cutSidesLine = new Line(cutSidesLineEndA, cutSidesLineEndB);

    // for elliptic and hyperbolic geometry
    let basicCircleCenter = new Vector2();
    let basicCircle = new Circle(0, basicCircleCenter);
    let circles = [];
    // semiregulars
    let cutCornersCenter = new Vector2();
    let cutCornersCircle = new Circle(0, cutCornersCenter);
    let cutSidesCenter = new Vector2();
    let cutSidesCircle = new Circle(0, cutSidesCenter);
    let bisectorPoint = new Vector2();
    let pointZero = new Vector2(0, 0);
    let bisectorLine = new Line(pointZero, bisectorPoint);


    fastTriangleKaleidoscope.intersectionMirrorXAxis = 0.5; // target value, intersection between third mirror and x-axis, especially for euclidic case
    let worldRadius = 0; // call let calculateWorldRadius to update value
    let worldRadius2 = 0;

    // generate additional reflection elements

    function generateCircles() {
        var i;
        var circlesLength = 2 * k;
        let angle = 2 * Math.PI / k;
        for (i = circles.length; i < circlesLength; i++) { // additional circle objects
            circles.push(new Circle(1, new Vector2()));
        }

        for (i = 0; i < circlesLength; i++) {
            circles[i].setRadius(basicCircle.radius);
        }
        let circleCenter = new Vector2();
        circleCenter.set(basicCircleCenter);
        let circleCenterMirrored = new Vector2();
        circleCenterMirrored.set(basicCircleCenter);
        circleCenterMirrored.mirrorAtXAxis();
        circleCenterMirrored.rotate(angle);
        for (i = 0; i < circlesLength; i += 2) {

            circles[i].center.set(circleCenter);
            circles[i + 1].center.set(circleCenterMirrored);
            circleCenter.rotate(angle);
            circleCenterMirrored.rotate(angle);
        }

    }

    // rescale
    function scaleCircles(factor) {
        for (var i = 0; i < circles.length; i++) {
            circles[i].scale(factor);
        }
    }


    // draw
    function drawCircles(factor) {
        for (var i = 0; i < circles.length; i++) {
            Draw.circle(circles[i].radius, circles[i].center);
        }
    }

    // generate additional reflection lines

    function generateLines() {
        var i;
        var linesLength = 2 * k;
        let angle = 2 * Math.PI / k;
        for (i = lines.length; i < linesLength; i++) { // additional circle objects
            lines.push(new Line(new Vector2(), new Vector2()));
            console.log(i);
        }

        let endPointA = new Vector2();
        endPointA.set(basicLineEndA);
        let endPointB = new Vector2();
        endPointB.set(basicLineEndB);

        let endPointAMirrored = new Vector2();
        endPointAMirrored.set(basicLineEndA);
        endPointAMirrored.mirrorAtXAxis();
        endPointAMirrored.rotate(angle);
        let endPointBMirrored = new Vector2();
        endPointBMirrored.set(basicLineEndB);
        endPointBMirrored.mirrorAtXAxis();
        endPointBMirrored.rotate(angle);

        for (i = 0; i < linesLength; i += 2) {
            lines[i].a.set(endPointA);
            lines[i].b.set(endPointB);
            lines[i + 1].a.set(endPointAMirrored);
            lines[i + 1].b.set(endPointBMirrored);
            endPointA.rotate(angle);
            endPointB.rotate(angle);
            endPointAMirrored.rotate(angle);
            endPointBMirrored.rotate(angle);
            console.log(i);
        }

    }

    // update lines
    function updateLines() {
        for (var i = 0; i < lines.length; i++) {
            lines[i].update();
        }
    }

    // draw lines
    function drawLines() {
        for (var i = 0; i < lines.length; i++) {
            Draw.line(lines[i].a, lines[i].b);
        }
    }


    /**
     * set the rotational symmetries at corners
     * @method fastTriangleKaleidoscope.setKMN
     * @param {integer} kp - symmetry at center corner
     * @param {integer} mp - symmetry at "right" corner
     * @param {integer} np - symmetry at "left" corner
     */
    fastTriangleKaleidoscope.setKMN = function(kp, mp, np) {
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

        // elliptic, raw, adjust
        if (angleSum > 1.000001) {
            geometry = elliptic;
            fastTriangleKaleidoscope.drawTrajectory = fastTriangleKaleidoscope.drawTrajectoryElliptic;
            basicCircle.setRadius(1);
            basicCircleCenter.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            generateCircles();
            // semiregular extensions
            //mirror rotate border for cutting corners using special symmetry
            cutCornersCenter.set(basicCircleCenter);
            cutCornersCenter.mirrorAtXAxis();
            cutCornersCenter.rotate(Math.PI / k);
            cutCornersCircle.setRadius(1);
            // cutting sides
            fastTriangleKaleidoscope.calculateWorldRadius();
            let intersection = basicCircleCenter.x + Fast.cathe(basicCircle.radius, basicCircleCenter.y);
            let d = 0.5 * (worldRadius2 - intersection * intersection) / intersection / cosGamma;
            cutSidesCenter.setComponents(-d * cosGamma, -d * sinGamma);
            cutSidesCircle.setRadius(Math.hypot(d, worldRadius));
        }
        // euklidic, final
        else if (angleSum > 0.999999) {
            geometry = euclidic;
            fastTriangleKaleidoscope.drawTrajectory = fastTriangleKaleidoscope.drawTrajectoryEuclidic;
            basicLineEndA.setComponents(fastTriangleKaleidoscope.intersectionMirrorXAxis - big * cosAlpha, big * sinAlpha);
            basicLineEndB.setComponents(fastTriangleKaleidoscope.intersectionMirrorXAxis + big * cosAlpha, -big * sinAlpha);
            basicLine.update();
            generateLines();
            updateLines();
            //semiregular, cutting corners
            cutCornersLineEndA.set(basicLineEndA);
            cutCornersLineEndA.mirrorAtXAxis();
            cutCornersLineEndA.rotate(Math.PI / k);
            cutCornersLineEndB.set(basicLineEndB);
            cutCornersLineEndB.mirrorAtXAxis();
            cutCornersLineEndB.rotate(Math.PI / k);
            cutCornersLine.update();
            // cutting sides
            let d = fastTriangleKaleidoscope.intersectionMirrorXAxis;
            cutSidesLineEndA.setComponents(d, 0);
            cutSidesLineEndB.setComponents(d * (1 - sinGamma * sinGamma), d * sinGamma * cosGamma);
            cutSidesLine.update();
        }
        // hyperbolic, raw, adjust
        else {
            geometry = hyperbolic;
            fastTriangleKaleidoscope.drawTrajectory = fastTriangleKaleidoscope.drawTrajectoryHyperbolic;
            basicCircle.setRadius(1);
            basicCircleCenter.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            generateCircles();

            // semiregular extensions
            //mirror rotate border for cutting corners using special symmetry
            cutCornersCenter.set(basicCircleCenter);
            cutCornersCenter.mirrorAtXAxis();
            cutCornersCenter.rotate(Math.PI / k);
            cutCornersCircle.setRadius(1);
            // cutting side with angle of 90 degrees
            fastTriangleKaleidoscope.calculateWorldRadius();
            let intersection = basicCircleCenter.x - Fast.cathe(basicCircle.radius, basicCircleCenter.y);
            let d = 0.5 * (worldRadius2 + intersection * intersection) / intersection / cosGamma;
            cutSidesCenter.setComponents(d * cosGamma, d * sinGamma);
            cutSidesCircle.setRadius(Fast.cathe(d, worldRadius));
        }
        fastTriangleKaleidoscope.regular();
    };



    /**
     * calculate worldradius from data of the basicCircle and type of geometry
     * @method fastTriangleKaleidoscope.calculateWorldRadius
     */
    fastTriangleKaleidoscope.calculateWorldRadius = function() {
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
     * @method fastTriangleKaleidoscope.adjustWorldRadius
     * @param {float} newRadius
     */
    fastTriangleKaleidoscope.adjustWorldRadius = function(newRadius) {
        fastTriangleKaleidoscope.calculateWorldRadius();
        let factor = newRadius / worldRadius;
        basicCircle.scale(factor);
        scaleCircles(factor);
        cutSidesCircle.scale(factor);
        cutCornersCircle.scale(factor);
        fastTriangleKaleidoscope.calculateWorldRadius();
    };

    /**
     * adjust the intersection point at x-axis to make it given value, and recalculate the worldradius
     * @method fastTriangleKaleidoscope.adjustIntersection
     */
    fastTriangleKaleidoscope.adjustIntersection = function() {
        let actualIntersection = 0;
        var factor;
        switch (geometry) {
            case elliptic:
                actualIntersection = basicCircleCenter.x + basicCircle.radius * Fast.sin(Math.PI / m);
                factor = fastTriangleKaleidoscope.intersectionMirrorXAxis / actualIntersection;
                basicCircle.scale(factor);
                scaleCircles(factor);
                break;
            case euclidic:
                break;
            case hyperbolic:
                actualIntersection = basicCircleCenter.x - basicCircle.radius * Fast.sin(Math.PI / m);
                factor = fastTriangleKaleidoscope.intersectionMirrorXAxis / actualIntersection;
                basicCircle.scale(factor);
                scaleCircles(factor);
                break;
        }
        fastTriangleKaleidoscope.calculateWorldRadius();
    };


    /**
     * setup for the regular tiling
     * @method fastTriangleKaleidoscope.regular
     */
    fastTriangleKaleidoscope.regular = function() {
        switch (geometry) {
            case elliptic:
                Make.setMapping(fastTriangleKaleidoscope.mappingInputImageElliptic, fastTriangleKaleidoscope.mappingStructureElliptic);
                fastTriangleKaleidoscope.drawLines = fastTriangleKaleidoscope.drawLinesElliptic;
                break;
            case euclidic:
                Make.setMapping(fastTriangleKaleidoscope.mappingInputImageEuclidic, fastTriangleKaleidoscope.mappingStructureEuclidic);
                fastTriangleKaleidoscope.drawLines = fastTriangleKaleidoscope.drawLinesEuclidic;
                break;
            case hyperbolic:
                Make.setMapping(fastTriangleKaleidoscope.mappingInputImageHyperbolic, fastTriangleKaleidoscope.mappingStructureHyperbolic);
                fastTriangleKaleidoscope.drawLines = fastTriangleKaleidoscope.drawLinesHyperbolic;
                break;
        }
    };

}());
