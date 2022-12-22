/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

// line defined in 3d by a point and direction vector(normalized)
export function Line(pointX, pointY, pointZ, directionX, directionY, directionZ) {
    // make unique direction vector
    const normFactor = 1 / Math.sqrt(directionX * directionX + directionY * directionY + directionZ * directionZ);
    directionX *= normFactor;
    directionY *= normFactor;
    directionZ *= normFactor;
    // make unique direction
    const eps = 0.1;
    if (Math.abs(directionX) > eps) {
        if (directionX < 0) {
            directionX = -directionX;
            directionY = -directionY;
            directionZ = -directionZ;
        }
    } else if (Math.abs(directionY) > eps) {
        if (directionY < 0) {
            directionX = -directionX;
            directionY = -directionY;
            directionZ = -directionZ;
        }
    } else if (Math.abs(directionZ) > eps) {
        if (directionZ < 0) {
            directionX = -directionX;
            directionY = -directionY;
            directionZ = -directionZ;
        }
    }
    this.directionX = directionX;
    this.directionY = directionY;
    this.directionZ = directionZ;
    // make unique anchor point (smallest distance to origin)
    const d = directionX * pointX + directionY * pointY + directionZ * pointZ;
    this.pointX = pointX - d * directionX;
    this.pointY = pointY - d * directionY;
    this.pointZ = pointZ - d * directionZ;
}


//  [one point], -1, [other point]
Line.prototype.writeSCAD = function() {
    const big = 10;
    const size = Circle.size;
    // export to Circle.SCADtext
    if (Circle.first) {
        Circle.first = false;
    } else {
        Circle.SCADtext += ',';
    }
    Circle.SCADtext += '\n';
    Circle.SCADtext += '[[' + prec(size * (this.pointX + big * this.directionX)) + ',' + prec(size * (this.pointY + big * this.directionY)) + ',' + prec(size * (this.pointZ + big * this.directionZ)) + '],';
    Circle.SCADtext += '-1,';
    Circle.SCADtext += '[' + prec(size * (this.pointX - big * this.directionX)) + ',' + prec(size * (this.pointY - big * this.directionY)) + ',' + prec(size * (this.pointZ - big * this.directionZ))+ ']]';
};

// draw projection in plane perpendicular to the n=(nx,ny,nz) direction
// n is normal vector to a plane with relevant design to check
// default is unit vector in z-direction
// for diagnostics
Line.prototype.drawProjection = function(nx = 0, ny = 0, nz = 1) {
    const eps = 0.01;
    const big = 1000;
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
    SVG.createPolyline([pointX + big * directionX, pointY + big * directionY, pointX - big * directionX, pointY - big * directionY]);
};

// test if two lines are equal, if argument is not Line then they are also not equal
Line.prototype.equals = function(other) {
    if (other instanceof Line) {
        if (Math.abs(other.directionX - this.directionX) > eps) {
            return false;
        }
        if (Math.abs(other.directionY - this.directionY) > eps) {
            return false;
        }
        if (Math.abs(other.directionZ - this.directionZ) > eps) {
            return false;
        }
        if (Math.abs(other.pointX - this.pointX) > eps) {
            return false;
        }
        if (Math.abs(other.pointY - this.pointY) > eps) {
            return false;
        }
        if (Math.abs(other.pointZ - this.pointZ) > eps) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};