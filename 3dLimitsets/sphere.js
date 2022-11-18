/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    Circle
}
from "./circle.js";

const eps = 0.001;

export function Sphere(centerX, centerY, centerZ, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.centerZ = centerZ;
    this.radius = radius;
    this.radius2 = radius * radius;
}

// set sphere to data of another sphere (for economical inversion of circles)
Sphere.prototype.set = function(otherSphere) {
    this.centerX = otherSphere.centerX;
    this.centerY = otherSphere.centerY;
    this.centerZ = otherSphere.centerZ;
    this.radius = otherSphere.radius;
    this.radius2 = otherSphere.radius2;
};

// draw projection in plane perpendicular to the n=(nx,ny,nz) direction
// n is normal vector to a plane with relevant design to check
// default is unit vector in z-direction
// for diagnostics
Sphere.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
    const normFactor = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx *= normFactor;
    ny *= normFactor;
    nz *= normFactor;
    // projection transformation
    var centerX, centerY;
    // rotate around the z-axis, moves n into the (x,z) plane
    const nxy = Math.sqrt(nx * nx + ny * ny);
    if (nxy > eps) {
        // cos(phi)=nx/nxy, sin(phi)=ny/nxy, phi angle to the x-axis,  rotation by -phi
        // n=(nxy,0,nz) after rotation
        centerX = (nx * this.centerX + ny * this.centerY) / nxy;
        centerY = (-ny * this.centerX + nx * this.centerY) / nxy;
        // rotate around the y-axis, moves n to (1,0,0), n is normalized
        // cos(theta)=nz, sin(theta)=nxy, theta angle to the x-axis, rotation by -theta, we do not need the z-component
        centerX = nz * centerX - nxy * this.centerZ;
    } else {
        centerX = this.centerX;
        centerY = this.centerY;
    }
    const canvasContext = output.canvasContext;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, Math.abs(this.radius), 0, 2 * Math.PI);
    canvasContext.stroke();
};

// return true if sphere touches another sphere
Sphere.prototype.touches = function(otherSphere) {
    const dx = this.centerX - otherSphere.centerX;
    const dy = this.centerY - otherSphere.centerY;
    const dz = this.centerZ - otherSphere.centerZ;
    const d2 = dx * dx + dy * dy + dz * dz;
    // touching circles being outside of each other
    let rr = this.radius + otherSphere.radius;
    if (Math.abs(d2 - rr * rr) < eps) {
        return true;
    }
    // touching circles: One inside of the other
    rr = this.radius - otherSphere.radius;
    if (Math.abs(d2 - rr * rr) < eps) {
        return true;
    }
    return false;
};

// invert a line at a sphere, only required for the first mapping
// return the image circle
// return false if the line passes through the center of the sphere (and thus remains unchanged)
Sphere.prototype.invertLine = function(line) {
    // the direction vector of the line is normalized
    const dirX = line.directionX;
    const dirY = line.directionY;
    const dirZ = line.directionZ;
    //  together with the direction vector the line between the sphere center and a point of the line
    // defines a plane, the inversion is defined in this plane
    let cpX = line.pointX - this.centerX;
    let cpY = line.pointY - this.centerY;
    let cpZ = line.pointZ - this.centerZ;
    // normal vector to the plane
    const normalX = dirY * cpZ - dirZ * cpY;
    const normalY = dirZ * cpX - dirX * cpZ;
    const normalZ = dirX * cpY - dirY * cpX;
    // if line passes through center of sphere, then this vector vanishes, cp and dir are colinear
    // the image is the line itself, return false
    if (normalX * normalX + normalY * normalY + normalZ * normalZ < eps) {
        return false;
    }
    // solve for the circle image in the plane
    // orthogonalize the vector from sphere center to the point with respect to the direction vector
    const dirCp = dirX * cpX + dirY * cpY + dirZ * cpZ;
    cpX -= dirCp * dirX;
    cpY -= dirCp * dirY;
    cpZ -= dirCp * dirZ;
    // this vector is perpendicular to the line, and inside the plane
    // determine distance of line to sphere center and normalize
    const d = Math.sqrt(cpX * cpX + cpY * cpY + cpZ * cpZ);
    cpX /= d;
    cpY /= d;
    cpZ /= d;
    // the image circle passes through the center of the sphere and the inverted image
    // of its closest point to the sphere
    const radius = 0.5 * this.radius2 / d;
    const centerX = this.centerX + radius * cpX;
    const centerY = this.centerY + radius * cpY;
    const centerZ = this.centerZ + radius * cpZ;
    return new Circle(centerX, centerY, centerZ, radius, normalX, normalY, normalZ);
};