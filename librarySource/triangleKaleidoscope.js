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
        console.log("angle sum " + angleSum);
        const cosGamma = Fast.cos(Math.PI / k);
        const sinGamma = Fast.sin(Math.PI / k);
        const cosAlpha = Fast.cos(Math.PI / m);
        const sinAlpha = Fast.sin(Math.PI / m);
        const cosBeta = Fast.cos(Math.PI / n);
        const sinBeta = Fast.sin(Math.PI / n);
        if (angleSum > 1.000001) { // elliptic, raw, adjust
            console.log("elliptic");
            this.geometry = TriangleKaleidoscope.elliptic;
            this.mirrorCircle.setRadius(1);
            this.circleCenter.setComponents(-(cosAlpha * cosGamma + cosBeta) / sinGamma, -cosAlpha);
        } else if (angleSum > 0.999999) { // euklidic, final
            console.log("euclidic");
            this.geometry = TriangleKaleidoscope.euclidic;
            this.pointP.setComponents(this.intersectionMirrorXAxis - this.big * cosAlpha, this.big * sinAlpha);
            this.pointQ.setComponents(this.intersectionMirrorXAxis + this.big * cosAlpha, -this.big * sinAlpha);
            this.mirrorLine.update();
        } else { // hyperbolic, raw, adjust
            console.log("hyperbolic");
            this.geometry = TriangleKaleidoscope.hyperbolic;
            this.mirrorCircle.setRadius(1);
            this.circleCenter.setComponents((cosAlpha * cosGamma + cosBeta) / sinGamma, cosAlpha);
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
                console.log("a");
                radius2 = this.mirrorCircle.radius * this.mirrorCircle.radius - this.circleCenter.length2();

                break;
            case TriangleKaleidoscope.euclidic:
                radius2 = 1e10;
                break;
            case TriangleKaleidoscope.hyperbolic:
                console.log("a");

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
     * adjust the intersection point at x-axis, and recalculate the worldradius
     * @method TriangleKaleidoscope.adjustIntersection
     */
    TriangleKaleidoscope.prototype.adjustIntersection = function() {
        let actualIntersection = 0;
        switch (this.geometry) {
            case TriangleKaleidoscope.elliptic:
                console.log("a");
                actualIntersection = this.circleCenter.x + this.mirrorCircle.radius * Fast.sin(Math.PI / this.m);
                this.mirrorCircle.scale(this.intersectionMirrorXAxis / actualIntersection);
                break;
            case TriangleKaleidoscope.euclidic:
                break;
            case TriangleKaleidoscope.hyperbolic:
                console.log("a");
                actualIntersection = this.circleCenter.x - this.mirrorCircle.radius * Fast.sin(Math.PI / this.m);
                this.mirrorCircle.scale(this.intersectionMirrorXAxis / actualIntersection);

                break;
        }

        this.calculateWorldRadius();

    };



    /**
     * draw the mirror lines
     * @method TriangleKaleidoscope.drawLines
     * @param {String} color
     * @param {float} width
     * @param {OutputImage} outputImage
     */
    TriangleKaleidoscope.prototype.drawLines = function(color, width, outputImage) {
        this.twoMirrors.drawLines(color, width, Make.outputImage);

        switch (this.geometry) {
            case TriangleKaleidoscope.elliptic:
                console.log("a");
                this.mirrorCircle.setColor(color);
                this.mirrorCircle.setLineWidth(width);
                this.mirrorCircle.draw(outputImage);
                break;
            case TriangleKaleidoscope.euclidic:
                this.mirrorLine.setColor(color);
                this.mirrorLine.setLineWidth(width);
                this.mirrorLine.draw(outputImage);
                break;
            case TriangleKaleidoscope.hyperbolic:
                console.log("a");
                this.mirrorCircle.setColor(color);
                this.mirrorCircle.setLineWidth(width);
                this.mirrorCircle.draw(outputImage);
                break;
        }

    };


}());
