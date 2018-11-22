/**
 * a circle as an object with a radius, square of radius and center vector
 * @constructor Circle
 * @param {float} radius, default 0
 * @param {Vector2 | float} center, default (0,0), or component x
 * @param {float} optional centerY
 */

/* jshint esversion:6 */

function Circle(radius, center, centerY) {
    switch (arguments.length) {
        case 0:
            this.setRadius(0);
            this.center = new Vector2(0, 0);
            break;
        case 1:
            this.setRadius(radius);
            this.center = new Vector2(0, 0);
            break;
        case 2:
            this.setRadius(radius);
            this.center = center;
            break;
        case 3:
            this.setRadius(radius);
            this.center = new Vector2(center, centerY);
            break;
    }
}

(function() {
    "use strict";

    Circle.vector = new Vector2();

    /**
     * set radius, square of radius 
     * @method Circle#setRadius
     * @param {float} radius 
     */
    Circle.prototype.setRadius = function(radius) {
        this.radius = radius;
        this.radius2 = radius * radius;
        this.radius07 = 0.7 * radius;
    };

    /**
     * set center vector value
     * @method Circle#setCenter
     * @param {Vector2} center, to be copied
     */
    Circle.prototype.setCenter = function(center) {
        this.center.set(center);
    };

    /**
     * set radius and center vector
     * @method Circle#setRadiusCenter
     * @param {float} radius 
     * @param {Vector2} center, to be copied
     */
    Circle.prototype.setRadiusCenter = function(radius, center) {
        this.setRadius(radius);
        this.setCenter(center);
    };

    /**
     * set radius and center vector componentrs
     * @method Circle#setRadiusCenterXY
     * @param {float} radius 
     * @param {float} centerX, x-component
     * @param {float} centerY, y-component
     */
    Circle.prototype.setRadiusCenterXY = function(radius, centerX, centerY) {
        this.setRadius(radius);
        this.center.setComponents(centerX, centerY);
    };

    /**
     * clone a circle, making a deep copy
     * @method Circle#clone
     * @return a copy of the circle
     */
    Circle.prototype.clone = function() {
        return new Circle(this.radius, this.center.clone());
    };

    /**
     * scale the circle (center and radius)
     * @method Circle#scale
     * @param {float} factor
     */
    Circle.prototype.scale = function(factor) {
        this.center.scale(factor);
        this.setRadius(factor * this.radius);
    };

    /**
     * draw the circle on an output image
     * @method Circle#draw
     */
    Circle.prototype.draw = function() {
        Draw.circle(this.radius, this.center);
    };

    /**
     * fill the circle on an output image
     * @method Circle#fill
     * @param {OutputImage} outputImage
     */
    Circle.prototype.fill = function(outputImage) {
        Draw.disc(this.radius, this.center);
    };

    /**
     * check if a vector is inside the circle
     * @method Circle#contains
     * @param {Vector2} v - the vector to check
     * @return {boolean} true if vector is inside circle
     */
    Circle.prototype.contains = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        return this.radius2 >= dx * dx + dy * dy;
    };

    /**
     * invert a point at the circle
     * @method Circle#invert
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.invert = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        const factor = this.radius2 / pointR2;
        v.x = this.center.x + dx * factor;
        v.y = this.center.y + dy * factor;
        return factor;
    };

    /**
     * invert a point at the circle and draw mapping
     * @method Circle#drawInvert
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.drawInvert = function(v) {
        Circle.vector.set(v);
        let result = this.invert(v);
        Draw.line(v, Circle.vector);
        return result;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle
     * @method Circle#invertInsideOut
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.invertInsideOut = function(v) {
        const dx = v.x - this.center.x;
        if (Math.abs(dx) > this.radius) {
            return -1;
        }
        const dy = v.y - this.center.y;
        if (Math.abs(dy) > this.radius) {
            return -1;
        }
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 - 0.0001 > pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return factor;
        }
        return -1;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle and draw the mapping
     * @method Circle#drawInvertInsideOut
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.drawInvertInsideOut = function(v) {
        Circle.vector.set(v);
        let result = this.invertInsideOut(v);
        if (result > 0) {
            Draw.line(v, Circle.vector);
        }
        return result;
    };

    /**
     * invert a point at the circle ONLY if the point lies poutside the circle
     * @method Circle#invertOutsideIn
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.invertOutsideIn = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        if ((Math.abs(dx) < this.radius07) && (Math.abs(dy) < this.radius07)) {
            return -1;
        }
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 + 0.0001 < pointR2) {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return factor;
        }
        return -1;
    };

    /**
     * invert a point at the circle ONLY if the point lies INSIDE the circle and draw mapping
     * @method Circle#ßdrawInvertOutsideIn
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)>0 if point inverted, else -1
     */
    Circle.prototype.drawInvertOutsideIn = function(v) {
        Circle.vector.set(v);
        let result = this.invertOutsideIn(v);
        if (result > 0) {
            Draw.line(v, Circle.vector);
        }
        return result;

    };

    /**
     * logging a circle on the console
     * @method circle#log 
     * @param {String} message - or nothind
     */
    Circle.prototype.log = function(message) {
        if (message) {
            message += ": ";
        } else {
            message = "";
        }
        console.log(message + "Circle of radius " + this.radius + " at (" + this.center.x + "," + this.center.y + ")");
    };

    Circle.intersection1 = new Vector2();
    Circle.intersection2 = new Vector2();

    /**
     * intersections of a circle with a line
     * results in Circle.intersection1 and Circle.intersection2
     * (Vector2 objs, will be overwritten)
     * @method Circle#IntersectsLine
     * @param {Line} line
     * @return boolean, true if there are intersection(s)
     */
    Circle.prototype.intersectsLine = function(line) {
        const aCenterX = this.center.x - line.a.x;
        const aCenterY = this.center.y - line.a.y;
        // distance between line and center of sphere
        let a = line.ex * aCenterY - line.ey * aCenterX;
        a = this.radius2 - a * a;
        if (a >= 0) {
            // half the distance between the two intersections
            a = Math.sqrt(a);
            // mean of the two intersections
            let baseX = line.ex * aCenterX + line.ey * aCenterY;
            let baseY = line.a.y + line.ey * baseX;
            baseX = line.a.x + line.ex * baseX;
            Circle.intersection1.setComponents(baseX + a * line.ex, baseY + a * line.ey);
            Circle.intersection2.setComponents(baseX - a * line.ex, baseY - a * line.ey);
            return true;
        } else {
            Circle.intersection1.setComponents(0, 0);
            Circle.intersection2.setComponents(0, 0);
            return false;
        }
    };


    /**
     * intersections of a circle with a second circle
     * results in Circle.intersection1 and Circle.intersection2
     * (Vector2 objs, will be overwritten)
     * @method Circle#intersectsCircle
     * @param {Circle} circle
     * @return boolean, true if there are intersection(s)
     */
    Circle.prototype.intersectsCircle = function(circle) {
        let ex = circle.center.x - this.center.x;
        let ey = circle.center.y - this.center.y;
        const d = Math.hypot(ex, ey);
        if (d > circle.radius + this.radius) {
            Circle.intersection1.setComponents(0, 0);
            Circle.intersection2.setComponents(0, 0);
            return false;
        } else {
            ex /= d;
            ey /= d;
            const d1 = 0.5 * (d + (this.radius2 - circle.radius2) / d);
            console.log(d1);
            const baseX = this.center.x + ex * d1;
            const baseY = this.center.y + ey * d1;
            const h = Math.sqrt(this.radius2 - d1 * d1);
            Circle.intersection1.setComponents(baseX - h * ey, baseY + h * ex);
            Circle.intersection2.setComponents(baseX + h * ey, baseY - h * ex);

            return true;
        }
    };


}());
