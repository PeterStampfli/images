/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

const eps = 0.0001;
const big = 1000;

// line defined in 3d by a point and direction vector(normalized)
export function Line(pointX, pointY, pointZ, directionX, directionY, directionZ) {
    this.pointX = pointX;
    this.pointY = pointY;
    this.pointZ = pointZ;
    const normalFactor = 1 / Math.sqrt(directionX * directionX + directionY * directionY + directionZ * directionZ);
    this.directionX = normalFactor * directionX;
    this.directionY = normalFactor * directionY;
    this.directionZ = normalFactor * directionZ;
}

// draw projection in plane perpendicular to the n=(nx,ny,nz) direction
// n is normal vector to a plane with relevant design to check
// default is unit vector in z-direction
// for diagnostics
Line.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
    const normFactor = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx *= normFactor;
    ny *= normFactor;
    nz *= normFactor;
    // projection transformation
    var pointX, pointY, directionX, directionY;
    // rotate around the z-axis, moves n into the (x,z) plane
    const nxy = Math.sqrt(nx * nx + ny * ny);
    if (nxy > eps) {
        // rotate projection direction to the x-axis
        // cos(phi)=nx/nxy, sin(phi)=ny/nxy, phi angle to the x-axis,  rotation by -phi
        // n=(nxy,0,nz) after rotation
        pointX = (nx * this.pointX + ny * this.pointY) / nxy;
        pointY = (-ny * this.pointX + nx * this.pointY) / nxy;
        directionX = (nx * this.directionX + ny * this.directionY) / nxy;
        directionY = (-ny * this.directionX + nx * this.directionY) / nxy;
        // rotate around the y-axis, moves n to (1,0,0), n is normalized
        // cos(theta)=nz, sin(theta)=nxy, theta angle to the x-axis, rotation by -theta, we do not need the z-component
        pointX = nz * pointX - nxy * this.pointZ;
        directionX = nz * directionX - nxy * this.directionZ;
    } else {
        pointX = this.pointX;
        pointY = this.pointY;
        directionX = this.directionX;
        directionY = this.directionY;
    }
    const canvasContext = output.canvasContext;
    canvasContext.beginPath();
    canvasContext.moveTo(pointX + big * directionX, pointY + big * directionY);
    canvasContext.lineTo(pointX - big * directionX, pointY - big * directionY);
    canvasContext.stroke();
};