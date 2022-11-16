/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

const eps = 0.0001;

// circle defined in 3d by its center, radius and normal vector to the plane (normalized)
export function Circle(centerX, centerY, centerZ, radius, normalX, normalY, normalZ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.centerZ = centerZ;
    this.radius = radius;
    const normalFactor = 1 / Math.sqrt(normalX * nx + normalY * normalY + normalZ * normalZ);
    this.normalX = normalFactor * normalX;
    this.normalY = normalFactor * normalY;
    this.normalZ = normalFactor * normalZ;
}

// draw projection in plane perpendicular to the n=(nx,ny,nz) direction
// n is normal vector to a plane with relevant design to check
// n has to be normalized, default is unit vector in z-direction
// for diagnostics
Circle.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
    // projection transformation
    var centerX, centerY;
    var normalX, normalY;
    // rotate around the z-axis, moves n into the (x,z) plane
    const nxy = Math.sqrt(nx * nx + ny * ny);
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
        normalX = nz * normalX - nxy * this.normalZ;
    } else {
        centerX = this.centerX;
        centerX = this.centerY;
        normalX = this.normalX;
        normalX = this.normalY;
    }
    const canvasContext = output.canvasContext;
    canvasContext.beginPath();
    canvasContext.arc(x, y, Math.abs(this.radius), 0, 2 * Math.PI);
    canvasContext.stroke();
};