/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    Line
} from "./line.js";

export function Circle(centerX, centerY, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = Math.abs(radius);
    this.radius2 = radius * radius;
}

Circle.minDrawingRadius = 2;
Circle.SCADtext = '';

// test if two circles are equal, if argument is not circle then they are also not equal
Circle.prototype.equals = function(other) {
    if (other instanceof Circle) {
        const eps = 0.001;
        if (Math.abs(other.centerX - this.centerX) > eps) {
            return false;
        }
        if (Math.abs(other.centerY - this.centerY) > eps) {
            return false;
        }
        if (Math.abs(other.radius - this.radius) > eps) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};

function prec(x) {
    return x.toPrecision(4);
}

Circle.prototype.writeSCAD = function() {
    // export to Circle.SCADtext
    if (Circle.planar) {
        // planar, for comparision,...
        if (Circle.first) {
            Circle.first = false;
        } else {
            Circle.SCADtext += ',';
        }
        Circle.SCADtext += '\n';
        Circle.SCADtext += '[[' + prec(Circle.size * this.centerX) + ',' + prec(Circle.size * this.centerY) + ',0],';
        Circle.SCADtext += prec(Circle.size * this.radius) + ',[0,0,1]]';
    } else {
        // inversion maps circle to the surface of the hyperbolic sphere of radius 1
        // we are now in three dimensions
        // inversion center at (0,0,1), radius sqrt(2)
        // invert the sphere that corresponds to the circle (same center and radius)
        // dx=centerX, dy=centerY, dz=-1
        let d2 = this.centerX * this.centerX + this.centerY * this.centerY + 1;
        let factor = 2 / (d2 - this.radius2);
        const invSphereCenterX = factor * this.centerX;
        const invSphereCenterY = factor * this.centerY;
        const invSphereCenterZ = 1 - factor;
        const invSphereRadius = Math.abs(factor) * this.radius;
        // inverted circle results from intersection of this inverted sphere with the hyperbolic sphere
        // center at (0,0,0), radius=1
        // should intersect hyperbolic sphere at right angles
        // intersection with hyperbolic sphere defines the image circle
        // normal vector is inverted sphere center
        d2 = invSphereCenterX * invSphereCenterX + invSphereCenterY * invSphereCenterY + invSphereCenterZ * invSphereCenterZ;
        let d = Math.sqrt(d2);
        const imageCircleRadius = 1 / d * invSphereRadius;
        factor = 1 / d2;
        const imageCircleCenterX = factor * invSphereCenterX;
        const imageCircleCenterY = factor * invSphereCenterY;
        const imageCircleCenterZ = factor * invSphereCenterZ;
        if (Circle.first) {
            Circle.first = false;
        } else {
            Circle.SCADtext += ',';
        }
        Circle.SCADtext += '\n';
        Circle.SCADtext += '[[' + prec(Circle.size * imageCircleCenterX) + ',' + prec(Circle.size * imageCircleCenterY) + ',' + prec(Circle.size * imageCircleCenterZ) + '],';
        Circle.SCADtext += prec(Circle.size * imageCircleRadius) + ',[' + prec(invSphereCenterX) + ',' + prec(invSphereCenterY) + ',' + prec(invSphereCenterZ) + ']]';
    }
};

Circle.prototype.draw = function() {
    const eps = 0.01;
    if (Circle.planar) {
        if (Circle.size * this.radius > Circle.minDrawingRadius) {
            SVG.createCircle(Circle.size * this.centerX, Circle.size * this.centerY, Circle.size * this.radius);
        }
    } else {
        // inversion maps circle to the surface of the hyperbolic sphere of radius 1
        // we are now in three dimensions
        // inversion center at (0,0,1), radius sqrt(2)
        // invert the sphere that corresponds to the circle (same center and radius)
        // dx=centerX, dy=centerY, dz=-1
        let d2 = this.centerX * this.centerX + this.centerY * this.centerY + 1;
        let factor = 2 / (d2 - this.radius2);
        const invSphereCenterX = factor * this.centerX;
        const invSphereCenterY = factor * this.centerY;
        const invSphereCenterZ = 1 - factor;
        const invSphereRadius = Math.abs(factor) * this.radius;
        // inverted circle results from intersection of this inverted sphere with the hyperbolic sphere
        // center at (0,0,0), radius=1
        // should intersect hyperbolic sphere at right angles
        // intersection with hyperbolic sphere defines the image circle
        // normal vector is inverted sphere center
        d2 = invSphereCenterX * invSphereCenterX + invSphereCenterY * invSphereCenterY + invSphereCenterZ * invSphereCenterZ;
        let d = Math.sqrt(d2);
        const imageCircleRadius = 1 / d * invSphereRadius;
        if (Circle.size * imageCircleRadius > Circle.minDrawingRadius) {
            factor = 1 / d2;
            const imageCircleCenterX = factor * invSphereCenterX;
            const imageCircleCenterY = factor * invSphereCenterY;
            const imageCircleCenterZ = factor * invSphereCenterZ;
            // project to the xy-plane
            let d = Math.sqrt(imageCircleCenterX * imageCircleCenterX + imageCircleCenterY * imageCircleCenterY + imageCircleCenterZ * imageCircleCenterZ);
            let smallHalfAxis = Math.abs(imageCircleCenterZ / d * imageCircleRadius);
            const angle = Math.atan2(imageCircleCenterY, imageCircleCenterX);
            if (Circle.size * smallHalfAxis > 0.5) {
                SVG.createEllipse(Circle.size * imageCircleCenterX, Circle.size * imageCircleCenterY, Circle.size * smallHalfAxis, Circle.size * imageCircleRadius, angle);
            } else {
                const dx = imageCircleRadius * imageCircleCenterY / d;
                const dy = -imageCircleRadius * imageCircleCenterX / d;
                SVG.createPolyline([Circle.size * (imageCircleCenterX - dx), Circle.size * (imageCircleCenterY - dy), Circle.size * (imageCircleCenterX + dx), Circle.size * (imageCircleCenterY + dy)]);
            }
        }
    }
};

// return true if circle touches another circle
Circle.prototype.touches = function(otherCircle) {
    const eps = 0.01;
    const dx = this.centerX - otherCircle.centerX;
    const dy = this.centerY - otherCircle.centerY;
    const d2 = dx * dx + dy * dy;
    // touching circles being outside of each other
    let rr = this.radius + otherCircle.radius;
    if (Math.abs(d2 - rr * rr) < eps) {
        return true;
    }
    // touching circles: One inside of the other
    rr = this.radius - otherCircle.radius;
    if (Math.abs(d2 - rr * rr) < eps) {
        return true;
    }
    return false;
};

// invert a circle, either expanding or contracting
// if inversion does not change the circle, then return false

Circle.prototype.invertCircle = function(otherCircle) {
    const eps = 0.001;
    const dx = otherCircle.centerX - this.centerX;
    const dy = otherCircle.centerY - this.centerY;
    const d2 = dx * dx + dy * dy;
    const factor = this.radius2 / (d2 - otherCircle.radius2);
    const absFactor = Math.abs(factor);
    if (Math.abs(factor - 1) > eps) {
        return new Circle(this.centerX + factor * dx, this.centerY + factor * dy, absFactor * otherCircle.radius);
    } else {
        return false;
    }
};

// invert a line, resulting in a circle
// if inversion does not change the line then return false

Circle.prototype.invertLine = function(line) {
    const eps = 0.001;
    // distance between center of circle and line (measure perpendicular to line)
    const delta = this.centerX * line.nX + this.centerY * line.nY - line.d;
    if (Math.abs(delta) > eps) {
        const newDelta = 0.5 * this.radius2 / delta;
        return new Circle(this.centerX - newDelta * line.nX, this.centerY - newDelta * line.nY, Math.abs(newDelta));
    } else {
        return false;
    }
};

// generating a fourth circle from three circles
// intersecting these circles at right angles

Circle.createFromTriplett = function(circle1, circle2, circle3) {
    const eps = 0.001;
    const x1 = circle1.centerX;
    const x2 = circle2.centerX;
    const x3 = circle3.centerX;
    const y1 = circle1.centerY;
    const y2 = circle2.centerY;
    const y3 = circle3.centerY;
    // vectors from center of circle 2 to circle 1, circle 3 to circle 1
    const x12 = x1 - x2;
    const y12 = y1 - y2;
    const x13 = x1 - x3;
    const y13 = y1 - y3;
    // test if vectors are colinear
    let d = Math.abs(x12 * y13 - y12 * x13);
    // degenerate case gives a straight line through the centers
    // beware of centers 1 and 3 are equal
    if (d < eps) {
        let nX = y13;
        let nY = -x13;
        if ((nX * nX + nY * nY) < eps) {
            nX = y12;
            nY = -x12;
        }
        // distance to origin
        d = (nX * x2 + nY * y2) / Math.sqrt(nX * nX + nY * nY);
        return new Line(nX, nY, d);
    } else {
        let r12 = x1 * x1 + y1 * y1 - circle1.radius2;
        let r13 = r12;
        r12 -= x2 * x2 + y2 * y2 - circle2.radius2;
        r13 -= x3 * x3 + y3 * y3 - circle3.radius2;
        const det = 4 * (x12 * y13 - x13 * y12);
        const x = 2 * (y13 * r12 - y12 * r13) / det;
        const y = 2 * (x12 * r13 - x13 * r12) / det;
        const r = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1) - circle1.radius2);
        return new Circle(x, y, r);
    }
};