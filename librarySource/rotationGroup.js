/**
 * actions and other things of a rotational goup
 * including basic rosette of same order
 * @constructor RotationGroup
 */

/* jshint esversion:6 */

function RotationGroup() {
    "use strict";

    this.n = -1;
    this.radialPower = 2;
    this.angle = 0; // angle between  sectors
    this.nDiv2Pi = 0; // n/2pi is inverse of the angle
    this.cosAngle = 1;
    this.sinAngle = 0;
    this.maps = [];
    const rotationGroup = this;

}

(function() {
    "use strict";

    const zpi = 2 * Math.PI;
    RotationGroup.radialPowerMax = 6;

    const big = 100;
    RotationGroup.pointZero = new Vector2(0, 0);
    RotationGroup.vector = new Vector2();

    /**
     * set the order of the rotational group
     * @method RotationGroup#setOrder
     * @param {integer} n - order of the group
     */
    RotationGroup.prototype.setOrder = function(n) {
        if (this.n !== n) {
            this.n = n;
            this.angle = 2 * Math.PI / n;
            this.nDiv2Pi = 1 / this.angle;
            this.cosAngle = Fast.cos(this.angle);
            this.sinAngle = Fast.sin(this.angle);
            // generate the mapping function to map a point in each sector to the sector 0
            this.maps.length = n + 1;
            for (var i = 0; i <= n; i++) {
                this.maps[i] = rotation.create(i * this.angle);
            }
        }
    };

    /**
     * set the radial power for rosettes
     * @method RotationGroup#setRadialPower
     * @param {integer} m
     */
    RotationGroup.prototype.setRadialPower = function(m) {
        if (m > RotationGroup.radialPowerMax) {
            console.log("**** max radial power is " + RotationGroup.radialPowerMax + " you want too much: " + m);
        }
        this.radialPower = Fast.clamp(1, m, RotationGroup.radialPowerMax);
    };

    /**
     * calculate a rosette function
     * ATTENTION: The (polar)angle of the position has to be precalculated
     * @method RotationGroup#rosette
     * @param {Vector2} position - with precalculated angle
     */
    RotationGroup.prototype.rosette = function(position) {
        var rp = 0;
        switch (this.radialPower) {
            case 1:
                {
                    rp = Math.hypot(position.x, position.y);
                    break;
                }
            case 2:
                {
                    rp = position.x * position.x + position.y * position.y;
                    break;
                }
            case 3:
                {
                    rp = Math.hypot(position.x, position.y);
                    rp *= rp * rp;
                    break;
                }
            case 4:
                {
                    rp = position.x * position.x + position.y * position.y;
                    rp *= rp;
                    break;
                }
            case 5:
                {
                    rp = Math.hypot(position.x, position.y);
                    const r2 = rp * rp;
                    rp *= r2 * r2;
                    break;
                }
            case 6:
                {
                    rp = position.x * position.x + position.y * position.y;
                    rp *= rp * rp;
                    break;
                }
        }
        position.setPolar(rp, this.n * position.theAngle);
    };

    // mappings

    /**
     * basic rotation, negative sense, -this.angle
     * @method RotationGroup#rotateMinus
     * @param {Vector2} v
     * @return Vector2, the rotated Vector 
     */
    RotationGroup.prototype.rotateMinus = function(v) {
        const h = this.cosAngle * v.x + this.sinAngle * v.y;
        v.y = this.cosAngle * v.y - this.sinAngle * v.x;
        v.x = h;
        return v;
    };


    /**
     * basic rotation, positive sense, +this.angle
     * @method RotationGroup#rotatePlus
     * @param {Vector2} v
     * @return Vector2, the rotated Vector 
     */
    RotationGroup.prototype.rotatePlus = function(v) {
        const h = this.cosAngle * v.x - this.sinAngle * v.y;
        v.y = this.cosAngle * v.y + this.sinAngle * v.x;
        v.x = h;
        return v;
    };

    // drawing
    function drawLine(angle) {
        RotationGroup.vector.setPolar(big, angle);
        Draw.line(RotationGroup.pointZero, RotationGroup.vector);
    }

    /**
     * draw the sector lines on outputimage
     * @method RotationGroup#drawSector
     */
    RotationGroup.prototype.drawSector = function() {
        drawLine(0);
        drawLine(this.angle);
    };

    /**
     * draw images of a circle
     * @method RotationGroup#drawCircles
     * @param {Circle} circle
     */
    RotationGroup.prototype.drawCircles = function(circle) {
        RotationGroup.vector.set(circle.center);
        for (var i = this.n; i > 0; i--) {
            Draw.circle(circle.radius, RotationGroup.vector);
            this.rotatePlus(RotationGroup.vector);
        }
    };


}());
