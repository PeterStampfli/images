/**
 * actions and other things of a dihedral goup
 * @constructor Dihedral
 */

/* jshint esversion:6 */

function Dihedral() {
    "use strict";

    this.n = 0;
    this.angle = 0; // angle between mirror lines, of sectors
    this.nDivPi = 0;
    this.nDiv2Pi = 0; // n/2pi is inverse of two times the angle
    this.cosAngle = 1;
    this.sinAngle = 0;
    this.endPointA = new Vector2(); // endpoint of mirror line a
    this.endPointB = new Vector2(); // endpoint of mirror line b

    const dihedral = this;


    /**
     * check if a point is in the first sector between the mirror lines
     * @method Dihedral#isInside.
     * @param {Vector2} v - point to test
     * @return true if polar angle of v between 0 and PI/2k
     */
    this.isInside = function(v) {
        if (v.y < 0) {
            return false;
        }
        return (v.y * dihedral.cosAngle <= v.x * dihedral.sinAngle);
    };


    /**
     * a vector mapping, creating a rosette from an input image, for use in the VectorMap
     * @method Dihedral#vectorMapping
     * @param {Vector2} input - will remain unchanged
     * @param {Vector2} output - changed, gets mapped input
     * @return {float} 1 - any point is ok, lyapunov value 1 trivially
     */
    this.vectorMapping = function(input, output) {
        output.set(input);
        dihedral.map(output);
        return 1;
    };


    /**
     * mapping to the number of reflections
     * @method Dihedral#reflectionsMapping
     * @param {Vector2} input
     * @param {Vector2} output - x-component will be number of relections
     * @return {float} 1 - any point is ok, lyapunov value 1 trivially
     */
    this.reflectionsMapping = function(input, output) {
        output.set(input);
        dihedral.map(output);
        output.x = Dihedral.reflections;
        return 1;
    };


    /**
     * do the mapping using simple mirrors and draw the trajectory
     * @method Dihedral#drawMap
     * @param {Vector2} v - the vector of the point to map, will be changed to mapped position
     */
    this.drawMap = function(v) {
        Dihedral.vector.set(v);
        dihedral.map(v);
        if (Dihedral.reflections != 0) {
            Draw.arc(v, Dihedral.vector, Dihedral.pointZero);
        }
    };

}



(function() {
    "use strict";

    const big = 100;
    Dihedral.pointZero = new Vector2(0, 0);
    Dihedral.vector = new Vector2();
    Dihedral.reflections = 0;

    /**
     * set the order of the dihedral group
     * @method Dihedral#setOrder
     * @param {integer} n - order of the group
     */
    Dihedral.prototype.setOrder = function(n) {
        this.n = n;
        this.angle = Math.PI / n;
        this.nDivPi = n / Math.PI;
        this.nDiv2Pi = 0.5 / this.angle;
        Fast.cosSin(this.angle);
        this.cosAngle = Fast.cosResult;
        this.sinAngle = Fast.sinResult;
        this.endPointA.setPolar(big, 0);
        this.endPointB.setPolar(big, this.angle);
    };


    // mapping a vector

    /**
     * maps a vector into the first sector using rotations and mirror image
     * sets Dihedral.reflections to the number of reflections
     * @method Dihedral#map
     * @param {Vector2} v - the vector of the point to map
     */
    Dihedral.prototype.map = function(v) {
        let angleOfV = Fast.atan2(v.y, v.x);
        angleOfV *= this.nDiv2Pi;
        let reflections = Math.floor(angleOfV);
        angleOfV -= reflections;
        reflections = Math.abs(reflections) << 1; // take care of "negative" rotations,shift-multiply by two
        if (angleOfV > 0.5) {
            angleOfV = 1 - angleOfV;
            reflections++;
        }
        angleOfV /= this.nDiv2Pi;
        let r = Math.hypot(v.x, v.y);
        Fast.cosSin(angleOfV);
        v.x = r * Fast.cosResult;
        v.y = r * Fast.sinResult;
        Dihedral.reflections = reflections;
    };


    /**
     * draw the mirror lines on outputimage
     * @method Dihedral#drawMirrors
     */
    Dihedral.prototype.drawMirrors = function() {
        Draw.line(Dihedral.pointZero, this.endPointA);
        Draw.line(Dihedral.pointZero, this.endPointB);
    };

    // creating symmetric elements

    /**
     * scale an array of circles, or other objects with a scale(factor) method
     * @method Dihedral#scale
     * @param {ArrayOfCircle} circles - will be scaled
     * @param {float} factor
     */
    Dihedral.prototype.scale = function(circles, factor) {
        circles.forEach(circle => {
            circle.scale(factor);
        });
    };


    /**
     * generate an array of symmetric copies of a circle
     * @method Dihedral#generateCircles
     * @param {Circle} basicCircle
     * @param {ArrayOfCircle} circles - will be changed to have symmetric copies of the basicCircle
     */
    Dihedral.prototype.generateCircles = function(basicCircle, circles) {
        var i;
        const rotationAngle = 2 * this.angle;
        const circlesLength = 2 * (this.n + 1);
        // adjust length of array
        if (circles.length > circlesLength) {
            circles.length = circlesLength;
        } else if (circles.length < circlesLength) {
            for (i = circles.length; i < circlesLength; i++) {
                circles[i] = new Circle(0, new Vector2());
            }
        }
        // all have the same radius
        circles.forEach(circle => {
            circle.setRadius(basicCircle.radius);
        });
        // circle centers are transformed according to the dihedral group
        const circleCenter = new Vector2();
        circleCenter.set(basicCircle.center);
        const circleCenterMirrored = new Vector2();
        circleCenterMirrored.set(basicCircle.center);
        circleCenterMirrored.mirrorAtXAxis();
        circleCenterMirrored.rotate(rotationAngle);
        for (i = 0; i < circlesLength; i += 2) {
            circles[i].center.set(circleCenter);
            circles[i + 1].center.set(circleCenterMirrored);
            circleCenter.rotate(rotationAngle);
            circleCenterMirrored.rotate(rotationAngle);
        }
    };

    /**
     * update an array of lines, or other objects with an update-method
     * @method Dihedral#update
     * @param {ArrayOfLine} lines - their update method will be called
     */
    Dihedral.prototype.update = function(lines) {
        lines.forEach(line => {
            line.update();
        });
    };

    /**
     * generate an array of symmetric copies of a line, making a continous chain if the basic line endpoint a is on the x-axis and endpoint b is on the limit between the first and second sector,endpoint b falls then on endpoint a of the second line
     * @method Dihedral#generateLines
     * @param {Line} basicLine
     * @param {ArrayOfLine} lines - will be changed to have symmetric copies of the basicLine
     */
    Dihedral.prototype.generateLines = function(basicLine, lines) {
        var i;
        const rotationAngle = 2 * this.angle;
        const linesLength = 2 * (this.n + 1);
        // adjust length of array
        if (lines.length > linesLength) {
            lines.length = linesLength;
        } else if (lines.length < linesLength) {
            for (i = lines.length; i < linesLength; i++) {
                lines[i] = new Line(new Vector2(), new Vector2());
            }
        }
        // line endpoints are transformed according to the dihedral group
        let endPointA = new Vector2();
        endPointA.set(basicLine.a);
        let endPointB = new Vector2();
        endPointB.set(basicLine.b);
        let endPointAMirrored = new Vector2();
        // make a continous chain
        endPointAMirrored.set(basicLine.b);
        endPointAMirrored.mirrorAtXAxis();
        endPointAMirrored.rotate(rotationAngle);
        let endPointBMirrored = new Vector2();
        endPointBMirrored.set(basicLine.a);
        endPointBMirrored.mirrorAtXAxis();
        endPointBMirrored.rotate(rotationAngle);
        for (i = 0; i < linesLength; i += 2) {
            lines[i].a.set(endPointA);
            lines[i].b.set(endPointB);
            lines[i + 1].a.set(endPointAMirrored);
            lines[i + 1].b.set(endPointBMirrored);
            endPointA.rotate(rotationAngle);
            endPointB.rotate(rotationAngle);
            endPointAMirrored.rotate(rotationAngle);
            endPointBMirrored.rotate(rotationAngle);
        }
    };

    const zpi = 2 * Math.PI;

    /**
     * get the index of the sector containing a given point
     * @method Dihedral#getSectorIndex
     * @param {Vector2} v
     * @return integer index of the sector with point v
     */
    Dihedral.prototype.getSectorIndex = function(v) {
        let result = Fast.atan2(v.y, v.x);
        if (result < 0) {
            result += zpi;
        }
        return Math.floor(this.nDivPi * result);
    };

}());
