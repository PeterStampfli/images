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
    this.excenter = new Vector2();
    this.excenterToCenter = new Vector2();
    this.setExcenter(this.center);
}

(function() {
    "use strict";

    Circle.vector = new Vector2();

    /**
     * set radius, square of radius 
     * no negative radius!
     * @method Circle#setRadius
     * @param {float} radius 
     */
    Circle.prototype.setRadius = function(radius) {
        radius = Math.max(0, radius);
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
     * set excentric center for circle inversion
     * @method Circle#setExcenter
     * @param {Vector2} center, to be copied
     */
    Circle.prototype.setExcenter = function(center) {
        this.setExcenterXY(center.x, center.y);
    };

    /**
     * set excentric center for circle inversion using components
     * @method Circle#setExcenterXY
     * @param {float} x
     * @param {float} y
     */
    Circle.prototype.setExcenterXY = function(x, y) {
        this.excenter.setComponents(x, y);
        this.excenterToCenter.setComponents(this.center.x - x, this.center.y - y);
        this.excenterToCenter2 = this.excenterToCenter.length2();
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

    // beware of hitting the circle center
    const epsilon = 0.0001;
    const epsilonPlus = 1.1 * epsilon;
    const epsilon2 = epsilon * epsilon;
    const iEpsilon2 = 1 / epsilon2;

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
        if (pointR2 < epsilon2) {
            v.x = this.center.x + iEpsilon2;
            v.y = this.center.y + iEpsilon2;
            return iEpsilon2;
        } else {
            const factor = this.radius2 / pointR2;
            v.x = this.center.x + dx * factor;
            v.y = this.center.y + dy * factor;
            return factor;
        }
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
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 - 0.0001 > pointR2) {
            if (pointR2 < epsilon2) {
                v.x = this.center.x + iEpsilon2;
                v.y = this.center.y + iEpsilon2;
                return iEpsilon2;
            } else {
                const factor = this.radius2 / pointR2;
                v.x = this.center.x + dx * factor;
                v.y = this.center.y + dy * factor;
                return factor;
            }
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
     * invert a point at the circle using the excentric inversion center
     * @method Circle#invertExcentric
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.invertExcentric = function(v) {
        const excenterToPointX = v.x - this.excenter.x;
        const excenterToPointY = v.y - this.excenter.y;
        const excenterToPoint2 = excenterToPointX * excenterToPointX + excenterToPointY * excenterToPointY;
        //  console.log("excenterToPoint2 "+excenterToPoint2);
        if (excenterToPoint2 < epsilon2) {
            v.x = this.excenter.x + iEpsilon2;
            v.y = this.excenter.y + iEpsilon2;
            return 1;
        }
        let d2 = this.excenterToCenter.x * excenterToPointY - this.excenterToCenter.y * excenterToPointX;
        d2 = d2 * d2 / excenterToPoint2;
        // console.log("d2 "+d2);
        //  console.log("this.excenterToCenter2 "+this.excenterToCenter2);
        let sign = excenterToPointX * this.excenterToCenter.x + excenterToPointY * this.excenterToCenter.y;
        if (sign > 0) {
            sign = 1;
        } else {
            sign = -1;
        }
        let excenterToCircle2 = Math.sqrt(this.radius2 - d2) + sign * Math.sqrt(this.excenterToCenter2 - d2);
        excenterToCircle2 *= excenterToCircle2;
        //   console.log("excenterToCircle2 "+excenterToCircle2);
        const factor = excenterToCircle2 / excenterToPoint2;
        v.x = this.excenter.x + factor * excenterToPointX;
        v.y = this.excenter.y + factor * excenterToPointY;
        return 1;
    };


    /**
     * invert a point at the circle using the excentric inversion center if inside the circle
     * @method Circle#invertExcentricInsideOut
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.invertExcentricInsideOut = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 - 0.0001 > pointR2) {
            this.invertExcentric(v);
            return 1;
        }
        return -1;
    };


    /**
     * invert a point at the circle using the excentric inversion center if outside the circle
     * @method Circle#invertExcentricOutsideIn
     * @param {Vector2} v - vector, position of the point
     * @return {float} local scale factor of the mapping (Lyapunov coefficient)
     */
    Circle.prototype.invertExcentricOutsideIn = function(v) {
        const dx = v.x - this.center.x;
        const dy = v.y - this.center.y;
        const pointR2 = dx * dx + dy * dy;
        if (this.radius2 + 0.0001 < pointR2) {
            this.invertExcentric(v);
            return 1;
        }
        return -1;
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

    /**
     * intersections of a circle with a line
     * results in intersection1 and intersection2
     * @method Circle#IntersectsLine
     * @param {Line} line
     * @param {Vector2} intersection1
     * @param {Vector2} intersection2
     * @return boolean, true if there are intersection(s)
     */
    Circle.prototype.intersectsLine = function(line, intersection1, intersection2) {
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
            intersection1.setComponents(baseX + a * line.ex, baseY + a * line.ey);
            intersection2.setComponents(baseX - a * line.ex, baseY - a * line.ey);
            return true;
        } else {
            intersection1.setComponents(0, 0);
            intersection2.setComponents(0, 0);
            return false;
        }
    };


    /**
     * intersections of a circle with a second circle
     * results in Circle.intersection1 and Circle.intersection2
     * (Vector2 objs, will be overwritten)
     * @method Circle#intersectsCircle
     * @param {Circle} circle
     * @param {Vector2} intersection1
     * @param {Vector2} intersection2
     * @return boolean, true if there are intersection(s)
     */
    Circle.prototype.intersectsCircle = function(circle, intersection1, intersection2) {
        let ex = circle.center.x - this.center.x;
        let ey = circle.center.y - this.center.y;
        let d = Math.hypot(ex, ey);
        if (d > circle.radius + this.radius) {
            intersection1.setComponents(0, 0);
            intersection2.setComponents(0, 0);
            return false;
        } else {
            ex /= d;
            ey /= d;
            d = 0.5 * (d + (this.radius2 - circle.radius2) / d);
            const baseX = this.center.x + ex * d;
            const baseY = this.center.y + ey * d;
            const h = Math.sqrt(this.radius2 - d * d);
            intersection1.setComponents(baseX - h * ey, baseY + h * ex);
            intersection2.setComponents(baseX + h * ey, baseY - h * ex);
            return true;
        }
    };

    /**
     * create a line that connects the intersection points of this circle and another one
     * @method Circle#lineOfCircleIntersection
     * @param {Circle} circle
     * @return Line connecting the intersection points, or zero
     */
    Circle.prototype.lineOfCircleIntersection = function(circle) {
        const a = Vector2.fromPool();
        const b = Vector2.fromPool();
        if (this.intersectsCircle(circle, a, b)) {
            return new Line(a, b);
        } else {
            a.toPool();
            b.toPool();
            return null;
        }
    };

    /**
     * invert a line at this circle, returning a circle
     * @method Circle#invertLine
     * @param {Line} line
     * @return Circle from inversion
     */
    Circle.prototype.invertLine = function(line) {
        const dParallel = (this.center.x - line.a.x) * line.ex + (this.center.y - line.a.y) * line.ey;
        const invertedCenter = new Vector2(line.a.x + line.ex * dParallel, line.a.y + line.ey * dParallel);
        this.invert(invertedCenter);
        invertedCenter.lerp(0.5, this.center);
        const radius = this.center.distance(invertedCenter);
        return new Circle(radius, invertedCenter);
    };

    /**
     * invert a circle at this circle, returning a circle
     * @method Circle#invertCircle
     * @param {Line} circle
     * @return Circle from inversion
     */
    Circle.prototype.invertCircle = function(circle) {
        const d = this.center.distance(circle.center);
        let circleRadius = circle.radius;
        if (Math.abs(d - circleRadius) < epsilonPlus) {
            console.log("pfff");
            if (d - circleRadius >= 0) {
                circleRadius -= epsilonPlus;
            } else {
                circleRadius += epsilonPlus;
            }
        }
        const near = Vector2.lerp(this.center, 1 - circleRadius / d, circle.center);
        const far = Vector2.lerp(this.center, 1 + circleRadius / d, circle.center);
        //  near.log("near");
        this.invert(near);
        //  near.log("near inverted");
        this.invert(far);
        const radius = 0.5 * near.distance(far);
        const invertedCenter = Vector2.middle(near, far);
        near.toPool();
        far.toPool();
        return new Circle(radius, invertedCenter);
    };

}());
