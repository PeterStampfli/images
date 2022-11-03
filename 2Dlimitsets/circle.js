/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    main
}
from "./limitsets.js";

import {
    Line
} from "./line.js";

export function Circle(centerX, centerY, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.radius2 = radius * radius;
}

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


Circle.prototype.draw = function() {
    if (this.radius > main.lineWidth) {
        SVG.createCircle(this.centerX, this.centerY, this.radius);
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
    const delta = this.centerX * line.nX + this.centerY * line.nY - line.d;
    if (Math.abs(delta) > eps) {
        const newDelta = 0.5 * this.radius2 / delta;
        return new Circle(this.centerX - newDelta * line.nX, this.centerY - newDelta * line.nY, Math.abs(newDelta));
    } else {
        return false;
    }
};

// generating a fourth circle from three touching circles
// circle 2 touches circle1 and circle 3
// intersecting the circles at right angles

Circle.createFromTriplett = function(circle1, circle2, circle3) {
    const eps = 0.001;
    const bigRadius = 1000;
    // use the symmetric quadrangle center of circle 2
    // normalized vectors from center of circle 2 to circle 1, or circle 2
    let n12x = circle1.centerX - circle2.centerX;
    let n12y = circle1.centerY - circle2.centerY;
    let d = Math.sqrt(n12x * n12x + n12y * n12y);
    // if center of circle 2 lies inside circle 1 then we have to invert the direction 
    // from center of circle 2 to the contact point of the two circles
    // this contact point is away from center of circle 1  (d=r1-r2 instead of d=r1+r2)
    let norm = (d < circle1.radius) ? -1 / d : 1 / d;
    n12x *= norm;
    n12y *= norm;
    let n32x = circle3.centerX - circle2.centerX;
    let n32y = circle3.centerY - circle2.centerY;
    d = Math.sqrt(n32x * n32x + n32y * n32y);
    norm = (d < circle3.radius) ? -1 / d : 1 / d;
    n32x *= norm;
    n32y *= norm;
    // test if vectors are colinear
    d = Math.abs(n12x * n32y - n12y * n32x);
    // degenerate case gives a straight line through the centers
    if (d < eps) {
        const nX = n32y;
        const nY = -n32x;
        const d = nX * circle2.centerX + nY * circle2.centerY;
        return new Line(nX, nY, d);
    }
    // normalized vector to center of new sphere
    let newX = n12x + n32x;
    let newY = n12y + n32y;
    d = Math.sqrt(newX * newX + newY * newY);

    newX /= d;
    newY /= d;
    // cosine between line from center 2 to center1, and to center of new circle
    const cosAlfa = newX * n12x + newY * n12y;
    // test if we have actually a straight line, use a large circle
    if ((Math.abs(cosAlfa) < eps) || (Math.abs(cosAlfa) > 1 - eps)) {
        const r = bigRadius;
        const cX = circle2.centerX + n12y * r;
        const cY = circle2.centerY - n12x * r;
        return new Circle(cX, cY, r);
    } else {
        // distance between centers of circle 1 and new circle
        d = circle2.radius / cosAlfa;
        const r = d * Math.sqrt(1 - cosAlfa * cosAlfa);
        const cX = circle2.centerX + d * newX;
        const cY = circle2.centerY + d * newY;
        return new Circle(cX, cY, r);
    }
};