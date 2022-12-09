/* jshint esversion: 6 */

import {
    Sphere
}
from "./sphere.js";

import {
    Line
}
from "./line.js";

import {
    Circle
}
from "./circle.js";

const eps = 0.001;

export const extra = {};

// returns circle or line intersecting three spheres at right angles
extra.triplett = function(sphere1, sphere2, sphere3) {
    // vector from sphere 1 to sphere 2 inside plane
    let e1x = sphere2.centerX - sphere1.centerX;
    let e1y = sphere2.centerY - sphere1.centerY;
    let e1z = sphere2.centerZ - sphere1.centerZ;
    // perpendicular vector inside plane, if not colinear
    // initially vector from sphere 1 to sphere 3
    let e2x = sphere3.centerX - sphere1.centerX;
    let e2y = sphere3.centerY - sphere1.centerY;
    let e2z = sphere3.centerZ - sphere1.centerZ;
     const center1ToCenter3x = e2x;
    const center1ToCenter3y = e2y;
    const center1ToCenter3z = e2z;
       // get normal vector to plane of circle centers, if not colinear
    const normalX = e1y * e2z - e1z * e2y;
    const normalY = e1z * e2x - e1x * e2z;
    const normalZ = e1x * e2y - e1y * e2x;
    const normal2 = normalX * normalX + normalY * normalY + normalZ * normalZ;
    if (normal2 < eps) {
        // colinear, makes a line, two centers might be the same
        if ((e1x * e1x + e1y * e1y + e1z * e1z) > eps) {
            return new Line(sphere1.centerX, sphere1.centerY, sphere1.centerZ, e1x, e1y, e1z);
        } else {
            return new Line(sphere1.centerX, sphere1.centerY, sphere1.centerZ, e2x, e2y, e2z);
        }
    }
    // not colinear, makes a circle
    // make orthonormalized vectors in plane of the three circle centers
    // get distance between center 1 and center2
    // normalize vector from 1 to 2 and determine distance
    const d = Math.sqrt(e1x * e1x + e1y * e1y + e1z * e1z);
    e1x /= d;
    e1y /= d;
    e1z /= d;
    // orthogonalize vector from 1 to 3, e1 is normalized
    const e2e1 = e2x * e1x + e2y * e1y + e2z * e1z;
    e2x -= e2e1 * e1x;
    e2y -= e2e1 * e1y;
    e2z -= e2e1 * e1z;
    // normalize e2
    const normFactor = 1 / Math.sqrt(e2x * e2x + e2y * e2y + e2z * e2z);
    e2x *= normFactor;
    e2y *= normFactor;
    e2z *= normFactor;
    // coordinates of center of circle 3 with respect to e1 and e2
    // center1=(0,0), center2=(d,0), center3=(x3,y3)
    const x3 = center1ToCenter3x * e1x + center1ToCenter3y * e1y + center1ToCenter3z * e1z;
    const y3 = center1ToCenter3x * e2x + center1ToCenter3y * e2y + center1ToCenter3z * e2z;
    // center of new circle at (x,y) in plane coordinates
    const r12 = sphere2.radius2 - sphere1.radius2 - d * d;
    const r13 = sphere3.radius2 - sphere1.radius2 - x3 * x3 - y3 * y3;
    const x = -0.5 * r12 / d;
    const y = 0.5 * (x3 * r12 - d * r13) / (y3 * d);
    // the center of the sphere, resulting from the e1 and e2 axis
    const centerX = sphere1.centerX + x * e1x + y * e2x;
    const centerY = sphere1.centerY + x * e1y + y * e2y;
    const centerZ = sphere1.centerZ + x * e1z + y * e2z;
    // radius, using that e1 and e2 are orthogonal and normalized
    const radius = Math.sqrt(x * x + y * y - sphere1.radius2);
    return new Circle(centerX, centerY, centerZ, radius, normalX, normalY, normalZ);
};