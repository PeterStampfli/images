/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    Sphere
} from "./sphere.js";

import {
    Line
}
from "./line.js";

// circle defined in 3d by its center, radius and normal vector to the plane (normalized)
export function Circle(centerX, centerY, centerZ, radius, normalX, normalY, normalZ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.centerZ = centerZ;
    this.radius = Math.abs(radius);
    this.radius2 = radius * radius;
    const normFactor = 1 / Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
    normalX *= normFactor;
    normalY *= normFactor;
    normalZ *= normFactor;
    // make unique normal vector
    const eps = 0.1;
    if (Math.abs(normalX) > eps) {
        if (normalX < 0) {
            normalX = -normalX;
            normalY = -normalY;
            normalZ = -normalZ;
        }
    } else if (Math.abs(normalY) > eps) {
        if (normalY < 0) {
            normalX = -normalX;
            normalY = -normalY;
            normalZ = -normalZ;
        }
    } else if (Math.abs(normalZ) > eps) {
        if (normalZ < 0) {
            normalX = -normalX;
            normalY = -normalY;
            normalZ = -normalZ;
        }
    }
    this.normalX = normalX;
    this.normalY = normalY;
    this.normalZ = normalZ;
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
        if (Math.abs(other.centerZ - this.centerZ) > eps) {
            return false;
        }
        if (Math.abs(other.radius - this.radius) > eps) {
            return false;
        }
        if (Math.abs(other.normalX - this.normalX) > eps) {
            return false;
        }
        if (Math.abs(other.normalY - this.normalY) > eps) {
            return false;
        }
        if (Math.abs(other.normalZ - this.normalZ) > eps) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};

//  [center], radius>0, [normal]
Circle.prototype.writeSCAD = function() {
    const size = Circle.size;
    // export to Circle.SCADtext
    if (Circle.first) {
        Circle.first = false;
    } else {
        Circle.SCADtext += ',';
    }
    Circle.SCADtext += '\n';
    Circle.SCADtext += '[[' + prec(size * this.centerX) + ',' + prec(size * this.centerY) + ',' + prec(size * this.centerY) + '],';
    Circle.SCADtext += prec(size * this.radius) + ',';
    Circle.SCADtext += '[' + prec(size * this.normalX) + ',' + prec(size * this.normalY) + ',' + prec(size * this.normalZ) + ']]';
};

// sphere that does the stereographic projection
const stereographicProjector = new Sphere(0, 0, 1, Math.sqrt(2));

// draw sphere as normal projection or after stereographic projection (via inversion)
Circle.prototype.draw = function() {
    const eps = 0.01;
    if (Circle.planar) {
        console.log(this);
        const projectedCircle = stereographicProjector.invertCircle(this);
        console.log(projectedCircle);
        projectedCircle.drawProjection(0, 0, 1);
    } else {
        this.drawProjection(0, 0, 1);
    }
};

// draw projection in plane perpendicular to the n=(nx,ny,nz) direction
// n is normal vector to a plane with relevant design to check
// default is unit vector in z-direction
// for diagnostics
Circle.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
    const size = Circle.size;
    const eps = 0.0001;
    const normFactor = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx *= normFactor;
    ny *= normFactor;
    nz *= normFactor;
    // projection transformation
    var centerX, centerY;
    var normalX, normalY, normalZ;
    // rotate around the z-axis, moves n into the (x,z) plane
    const nxy = Math.sqrt(nx * nx + ny * ny);
    // attention: normal vector might be parallel to the z-axis
    if (nxy > eps) {
        // cos(phi)=nx/nxy, sin(phi)=ny/nxy, phi angle to the x-axis,  rotation by -phi
        // n=(nxy,0,nz) after rotation
        centerX = (nx * this.centerX + ny * this.centerY) / nxy;
        centerY = (-ny * this.centerX + nx * this.centerY) / nxy;
        normalX = (nx * this.normalX + ny * this.normalY) / nxy;
        normalY = (-ny * this.normalX + nx * this.normalY) / nxy;
        // rotate around the y-axis, moves n to (1,0,0), n is normalized
        // cos(theta)=nz, sin(theta)=nxy, theta angle to the x-axis, rotation by -theta, we do not need the z-component
        centerX = nz * centerX - nxy * this.centerZ;
        const h = nz * normalX - nxy * this.normalZ;
        normalZ = nxy * normalX + nz * this.normalZ;
        normalX = h;
    } else {
        // no rotation required!
        centerX = this.centerX;
        centerY = this.centerY;
        normalX = this.normalX;
        normalY = this.normalY;
        normalZ = this.normalZ;
    }
    // orientation of large axis of image perpendicular to normal vector
    const angle = Math.atan2(-normalX, normalY);
    // large axis equal to radius, small axis is cos(theta_normalVector)*radius=normalZ*radius
    // normalized normal vector
    const smallHalfAxis = this.radius * Math.abs(normalZ);
    if (size * smallHalfAxis > 0.5) {
        SVG.createEllipse(size * centerX, size * centerY, size * this.radius, size * smallHalfAxis, angle);
    } else {
        // the circle has become essentially a line, the large axis, direction (-normalX,normalY)
        const d = Math.sqrt(normalX * normalX + normalY * normalY);
        const dx = -this.radius * normalX / d;
        const dy = -this.radius * normalY / d;
        SVG.createPolyline([size * (centerX - dx), size * (centerY - dy), size * (centerX + dx), size * (centerY + dy)]);
    }
};

// returns circle or line intersecting three spheres at right angles
Circle.createFromTriplett = function(sphere1, sphere2, sphere3) {
    const eps = 0.01;
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