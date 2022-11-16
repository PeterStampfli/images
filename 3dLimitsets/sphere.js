/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

const eps = 0.0001;

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
// n has to be normalized, default is unit vector in z-direction
// for diagnostics
Sphere.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
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
        centerX = this.centerY;
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