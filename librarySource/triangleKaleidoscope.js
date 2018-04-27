/**
 * kaleidoscopes using triangles in different geometries depending on sum of angles
 * @constructor TriangleKaleidoscope
 */

/* jshint esversion:6 */

function TriangleKaleidoscope() {
    "use strict";

    this.twoMirrors = new TwoMirrors();
    this.geometry = 0;
    // for euclidic geometry
    this.big = 100;
    this.pointP = new Vector2();
    this.pointQ = new Vector2();
    this.mirrorLine = new Line(this.pointP, this.pointQ);
    // for elliptic and hyperbolic geometry
    this.circleCenter = new Vector2();
    this.mirrorCircle = new Circle(0, this.circleCenter);

    this.intersectionMirrorXAxis = 0.5; // target value, intersection between third mirror and x-axis, especially for euclidic case
    this.worldRadius = 0; // call this.calculateWorldRadius to update value
    this.worldRadius2 = 0;

    /**
     * draw the mirror lines
     * @method TriangleKaleidoscope.drawLines
     */
    this.drawLines = function() {}; // symmetry dependent drawing

    /**
     * draw the trajectory
     * @method TriangleKaleidoscope.drawTrajectory
     * @param {Vector2} start
     */
    this.drawTrajectory = function(start) {};
}

(function() {
    "use strict";
    // geometries
    TriangleKaleidoscope.elliptic = 1;
    TriangleKaleidoscope.euclidic = 2;
    TriangleKaleidoscope.hyperbolic = 3;


    /**
     * set the rotational symmetries at corners
     * @method TriangleKaleidoscope.setKMN
     * @param {integer} k - symmetry at center corner
     * @param {integer} m - symmetry at "right" corner
     * @param {integer} n - symmetry at "left" corner
     */
    TriangleKaleidoscope.prototype.setKMN = function(k, m, n) {
        this.k = k;
        this.m = m;
        this.n = n;
        this.twoMirrors.setK(k);
        const angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
        const cosGamma = Fast.cos(Math.PI / k);
        const sinGamma = Fast.sin(Math.PI / k);
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        if (angleSum > 1.000001) { // elliptic, raw, adjust
            this.geometry = TriangleKaleidoscope.elliptic;
            this.mirrorCircle.setRadius(1);
            this.circleCenter.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
            this.drawLines = this.drawLinesElliptic;
            this.drawTrajectory = this.drawTrajectoryElliptic;
            Make.setMapping(this.mappingInputImageElliptic, this.mappingStructureElliptic);
        } else if (angleSum > 0.999999) { // euklidic, final
            this.geometry = TriangleKaleidoscope.euclidic;
            this.pointP.setComponents(this.intersectionMirrorXAxis - this.big * cosAlpha, this.big * sinAlpha);
            this.pointQ.setComponents(this.intersectionMirrorXAxis + this.big * cosAlpha, -this.big * sinAlpha);
            this.mirrorLine.update();
            this.drawLines = this.drawLinesEuclidic;
            this.drawTrajectory = this.drawTrajectoryEuclidic;
            Make.setMapping(this.mappingInputImageEuclidic, this.mappingStructureEuclidic);
        } else { // hyperbolic, raw, adjust
            this.geometry = TriangleKaleidoscope.hyperbolic;
            this.mirrorCircle.setRadius(1);
            this.circleCenter.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
            this.drawLines = this.drawLinesHyperbolic;
            this.drawTrajectory = this.drawTrajectoryHyperbolic;
            Make.setMapping(this.mappingInputImageHyperbolic, this.mappingStructureHyperbolic);
        }
        this.calculateWorldRadius();
    };

    /**
     * calculate worldradius from data of the mirrorCircle and type of geometry
     * @method TriangleKaleidoscope.calculateWorldRadius
     */
    TriangleKaleidoscope.prototype.calculateWorldRadius = function() {
        let radius2 = 0;
        switch (this.geometry) {
            case TriangleKaleidoscope.elliptic:
                radius2 = this.mirrorCircle.radius * this.mirrorCircle.radius - this.circleCenter.length2();
                break;
            case TriangleKaleidoscope.euclidic:
                radius2 = 1e10;
                break;
            case TriangleKaleidoscope.hyperbolic:
                radius2 = this.circleCenter.length2() - this.mirrorCircle.radius * this.mirrorCircle.radius;
                break;
        }
        this.worldRadius = Math.sqrt(radius2);
        this.worldRadius2 = radius2;
    };

    /**
     * adjust worldradius to given value for hyperbolic and elliptic geometry
     * @method TriangleKaleidoscope.adjustWorldRadius
     * @param {float} newRadius
     */
    TriangleKaleidoscope.prototype.adjustWorldRadius = function(newRadius) {
        this.calculateWorldRadius();
        this.mirrorCircle.scale(newRadius / this.worldRadius);
        this.calculateWorldRadius();
    };

    /**
     * adjust the intersection point at x-axis to make it given value, and recalculate the worldradius
     * @method TriangleKaleidoscope.adjustIntersection
     */
    TriangleKaleidoscope.prototype.adjustIntersection = function() {
        let actualIntersection = 0;
        switch (this.geometry) {
            case TriangleKaleidoscope.elliptic:
                actualIntersection = this.circleCenter.x + this.mirrorCircle.radius * Fast.sin(Math.PI / this.m);
                this.mirrorCircle.scale(this.intersectionMirrorXAxis / actualIntersection);
                break;
            case TriangleKaleidoscope.euclidic:
                break;
            case TriangleKaleidoscope.hyperbolic:
                actualIntersection = this.circleCenter.x - this.mirrorCircle.radius * Fast.sin(Math.PI / this.m);
                this.mirrorCircle.scale(this.intersectionMirrorXAxis / actualIntersection);
                break;
        }
        this.calculateWorldRadius();
    };

    /**
     * check if a point is inside the triangle
     * @method TriangleKaleidoscope.isInside
     * @param {Vector2} v
     * @return true if v is inside the triangle
     */
    TriangleKaleidoscope.prototype.isInside = function(v) {
        if (!this.twoMirrors.isInside(v)) {
            return false;
        }
        switch (this.geometry) {
            case TriangleKaleidoscope.elliptic:
                return this.mirrorCircle.contains(v);
            case TriangleKaleidoscope.euclidic:
                return !this.mirrorLine.isAtLeft(v);
            case TriangleKaleidoscope.hyperbolic:
                return (v.x * v.x + v.y * v.y < this.worldRadius2) && !this.mirrorCircle.contains(v);
        }
        return true;
    };

    /**
     * draw the mirror lines
     * @method TriangleKaleidoscope.drawLines
     */
    TriangleKaleidoscope.prototype.drawLinesElliptic = function() {
        this.twoMirrors.drawLines();
        this.mirrorCircle.draw();
    };

    TriangleKaleidoscope.prototype.drawLinesEuclidic = function() {
        this.twoMirrors.drawLines();
        this.mirrorLine.draw();
    };

    TriangleKaleidoscope.prototype.drawLinesHyperbolic = function() {
        this.twoMirrors.drawLines();
        this.mirrorCircle.draw();
    };

    /**
     * mapping to create an image based on an input image, symmetry dependent
     * @method TriangleKaleidoscope#mappingInputImage
     * @param {Vector2} mapIn
     * @param {Vector2} mapOut
     */
    TriangleKaleidoscope.prototype.mappingInputImageElliptic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        return true;
    };

    TriangleKaleidoscope.prototype.mappingInputImageEuclidic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        return true;
    };

    TriangleKaleidoscope.prototype.mappingInputImageHyperbolic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        return true;
    };

    /**
     * mapping to create an image based on an input image, symmetry dependent
     * @method TriangleKaleidoscope#mappingStructure
     * @param {Vector2} mapIn
     * @param {Vector2} mapOut
     */
    TriangleKaleidoscope.prototype.mappingStructureElliptic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        return true;
    };

    TriangleKaleidoscope.prototype.mappingStructureEuclidic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        return true;
    };

    TriangleKaleidoscope.prototype.mappingStructureHyperbolic = function(mapIn, mapOut) {
        mapOut.set(mapIn);
        return true;
    };

    /**
     * draw the trajectory
     * @method TriangleKaleidoscope.drawTrajectory
     * @param {Vector2} start
     */
    TriangleKaleidoscope.prototype.drawTrajectoryElliptic = function(start) {

    };

    TriangleKaleidoscope.prototype.drawTrajectoryEuclidic = function(start) {

    };

    TriangleKaleidoscope.prototype.drawTrajectoryHyperbolic = function(start) {

    };

}());
