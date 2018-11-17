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
    this.maps = [];

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
     * map the position 
     * @method Dihedral.mapping
     * @param {Vector2} v - the vector to map
     * @param {Object} furtherResults - with fields reflections and lyapunov
     */

    this.mapping = function(position, furtherResults) {
        dihedral.map(position);
        furtherResults.lyapunov = 1;
        furtherResults.reflections = Dihedral.reflections;
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
        // generate the mapping function to map a point in each sector to the sector 0
        this.maps.length = 2 * n + 1;
        for (var i = 0; i < n; i++) {
            this.maps[2 * i] = rotation.create(-2 * i * this.angle);
            this.maps[2 * i + 1] = rotation.createMirrored(-2 * (i + 1) * this.angle);
        }
        this.maps[2 * n] = rotation.create(0);
    };


    // mapping a vector

    /**
     * maps a vector into the first sector using rotations and mirror image
     * given the sector number of the point
     * sets Dihedral.reflections to the number of reflections
     * @method Dihedral#mapOfSector
     * @param {integer} i - index of the sector
     * @param {Vector2} v - the vector of the point to map
     */
    Dihedral.prototype.mapOfSector = function(i, p) {
        Dihedral.reflections = i;
        if (this.maps[i] == null) {
            console.log(i);
            p.log();
        }
        this.maps[i](p);
    };


    /**
     * maps a vector into the first sector using rotations and mirror image
     * sets Dihedral.reflections to the number of reflections
     * @method Dihedral#map
     * @param {Vector2} v - the vector of the point to map
     */

    Dihedral.prototype.map = function(p) {
        this.mapOfSector(this.getSectorIndex(p), p);
    };


    function drawLine(angle) {
        Dihedral.vector.setPolar(big, angle);
        Draw.line(Dihedral.pointZero, Dihedral.vector);
    }

    /**
     * draw the mirror lines on outputimage
     * @method Dihedral#drawMirrors
     */
    Dihedral.prototype.drawMirrors = function() {
        drawLine(0);
        drawLine(this.angle);
    };

    /**
     * draw the all mirror lines resulting from dihedral symmetry
     * @method Dihedral#drawMirrors
     */
    Dihedral.prototype.drawAddMirrors = function() {
        for (var i = 0; i < 2 * this.n; i++) {
            drawLine(i * this.angle);
        }
    };

    // creating symmetric elements


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
        // circle centers are transformed according to the dihedral group
        const circleCenter = basicCircle.center.clone();
        const circleCenterMirrored = basicCircle.center.clone();
        circleCenterMirrored.mirrorAtXAxis();
        circleCenterMirrored.rotate(rotationAngle);
        for (i = 0; i < circlesLength; i += 2) {
            circles[i].setRadius(basicCircle.radius);
            circles[i].center.set(circleCenter);
            circles[i + 1].setRadius(basicCircle.radius);
            circles[i + 1].center.set(circleCenterMirrored);
            circleCenter.rotate(rotationAngle);
            circleCenterMirrored.rotate(rotationAngle);
        }
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
        let endPointAMirrored = basicLine.b.clone();
        endPointAMirrored.mirrorAtXAxis();
        endPointAMirrored.rotate(rotationAngle);
        let endPointBMirrored = basicLine.a.clone();
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
        // get the angle
        // mirror symmetry at x-axis: angle=>-angle
        let result = Fast.atan2(v.y, v.x);
        if (result < 0) {
            result += zpi;
        }
        return Math.floor(this.nDivPi * result);
    };

}());
