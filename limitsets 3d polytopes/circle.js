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
    this.radius2=radius*radius;
    const normalFactor = 1 / Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
    this.normalX = normalFactor * normalX;
    this.normalY = normalFactor * normalY;
    this.normalZ = normalFactor * normalZ;
}

Circle.minDrawingRadius = 2;
Circle.SCADtext = '';

// draw projection in plane perpendicular to the n=(nx,ny,nz) direction
// n is normal vector to a plane with relevant design to check
// default is unit vector in z-direction
// for diagnostics
Circle.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
    const normFactor = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx *= normFactor;
    ny *= normFactor;
    nz *= normFactor;
    // projection transformation
    var centerX, centerY;
    var normalX, normalY, normalZ;
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
        const h = nz * normalX - nxy * this.normalZ;
        normalZ = nxy * normalX + nz * this.normalZ;
        normalX = h;
    } else {
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
    const smallAxis = this.radius * Math.abs(normalZ);
    const canvasContext = output.canvasContext;
    canvasContext.beginPath();
    canvasContext.ellipse(centerX, centerY, this.radius, smallAxis, angle, 0, 2 * Math.PI);
    canvasContext.stroke();
};