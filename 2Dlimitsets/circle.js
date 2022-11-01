/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    main
}
from "./limitsets.js";

export function Circle(centerX, centerY, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.radius2 = radius * radius;
}

Circle.prototype.draw = function() {
    if (this.radius > main.lineWidth) {
        SVG.createCircle(this.centerX, this.centerY, this.radius);
    }
};

// return true if circle touches another circle
Circle.prototype.touches = function(otherCircle) {
    const eps = 0.001;
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

// if the circle is not inverted: invert a circle lying outside this circle
// means that circle gets contracted
// if circle is inverted: invert a circle lying inside, gets exxpanded

Circle.prototype.invertCircle = function(otherCircle) {
    const dx = otherCircle.centerX - this.centerX;
    const dy = otherCircle.centerY - this.centerY;
    const d2 = dx * dx + dy * dy;
    const factor = this.radius2 / (d2 - otherCircle.radius2);
    const absFactor = Math.abs(factor);
    if (Math.abs(factor - 1) > 0.001) {
        return new Circle(this.centerX + factor * dx, this.centerY + factor * dy, absFactor * otherCircle.radius);
    } else {
        return false;
    }
};

// generating a fourth circle from three touching circles
// circle 2 touches circle1 and circle 3
// intersecting the circles at right angles

Circle.createFromTriplett = function(circle1, circle2, circle3) {
    const eps = 0.01;
    const bigRadius = 1000;
    const cr1 = circle1.centerX * circle1.centerX + circle1.centerY * circle1.centerY - circle1.radius2;
    const cr2 = circle2.centerX * circle2.centerX + circle2.centerY * circle2.centerY - circle2.radius2;
    const cr3 = circle3.centerX * circle3.centerX + circle3.centerY * circle3.centerY - circle3.radius2;
    const r12 = cr1 - cr2;
    const r23 = cr2 - cr3;
    const d12x = circle1.centerX - circle2.centerX;
    const d12y = circle1.centerY - circle2.centerY;
    const d23x = circle2.centerX - circle3.centerX;
    const d23y = circle2.centerY - circle3.centerY;
    const det = 2 * (d12x * d23y - d23x * d12y);
    const centerX = (r12 * d23y - r23 * d12y) / det;
    const centerY = (d12x * r23 - d23x * r12) / det;
    const dx = circle1.centerX - centerX;
    const dy = circle1.centerY - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy - circle1.radius2);
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
    // normalized vector to center of new sphere
    let newX = n12x + n32x;
    let newY = n12y + n32y;
    d = Math.sqrt(newX * newX + newY * newY);
    // degenerate case of exactly opposite directions
    if (d < eps) {
        const r = bigRadius*100;
        const cX = circle2.centerX + n12y * r;
        const cY = circle2.centerY - n12x * r;
        return new Circle(cX, cY, r);
    }
    newX /= d;
    newY /= d;
    // cosine between line from center 2 to center1, and to center of new circle
    const cosAlfa = newX * n12x + newY * n12y;
    console.log('cosalp',cosAlfa);
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
        return new Circle(centerX, centerY, radius);
    }
};