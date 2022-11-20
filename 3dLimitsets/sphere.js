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

// invert a circle at a sphere, return the image circle
// return false if the circle intersects the sphere at a right angle (and thus remains unchanged)
// use intersection of circle plane and circle sphere
Sphere.prototype.invertCircle = function(circle) {
    // vector from center of sphere to center of circle
    const sphCircCenterX = circle.centerX - this.centerX;
    const sphCircCenterY = circle.centerY - this.centerY;
    const sphCircCenterZ = circle.centerZ - this.centerZ;
    // distance between the centers
    const dSphCircCenter2 = sphCircCenterX * sphCircCenterX + sphCircCenterY * sphCircCenterY + sphCircCenterZ * sphCircCenterZ;
    // signed distance of center of sphere to the plane of the circle, normal vector is normalized
    const dToPlane = circle.normalX * sphCircCenterX + circle.normalY * sphCircCenterY + circle.normalZ * sphCircCenterZ;
    //if this distance is nearly zero then plane goes through center of sphere and we have a 2d inversion
    if (Math.abs(dToPlane) < eps) {
        const factor = this.radius2 / (dSphCircCenter2 - circle.radius2);
        if (Math.abs(factor - 1) < eps) {
            // intersection at right angle, circle remains unchanged, return false
            return false;
        }
        const imageRadius = Math.abs(factor) * circle.radius;
        const imageCenterX = this.centerX + factor * sphCircCenterX;
        const imageCenterY = this.centerY + factor * sphCircCenterY;
        const imageCenterZ = this.centerZ + factor * sphCircCenterZ;
        return new Circle(imageCenterX, imageCenterY, imageCenterZ, imageRadius, circle.normalX, circle.normalY, circle.normalZ);
    } else {
        // plane of circle does not go through center of sphere
        // plane is mapped to a sphere
        // determine image sphere data from the inverted distance of plane to sphere
        // and normal vector to the plane
        const dImage = 0.5 * this.radius2 / dToPlane;
        const planeImageRadius = Math.abs(dImage);
        const planeImageCenterX = this.centerX + dImage * circle.normalX;
        const planeImageCenterY = this.centerX + dImage * circle.normalY;
        const planeImageCenterZ = this.centerX + dImage * circle.normalZ;
        // the sphere defined by the circle is mapped into a sphere
        const factor = this.radius2 / (dSphCircCenter2 - circle.radius2);
        const sphereImageRadius = Math.abs(factor) * circle.radius;
        const sphereImageCenterX = this.centerX + factor * sphCircCenterX;
        const sphereImageCenterY = this.centerY + factor * sphCircCenterY;
        const sphereImageCenterZ = this.centerZ + factor * sphCircCenterZ;
        // the intersection between these two spheres gives the new circle
        // vector between the centers is the new normal vector 
        // going out from the center of the sphere image
        let normalX = planeImageCenterX - sphCircCenterX;
        let normalY = planeImageCenterY - sphCircCenterY;
        let normalZ = planeImageCenterZ - sphCircCenterZ;
        // normalize and get distance between centers
        dCenters2 = normalX * normalX + normalY * normalY + normalZ * normalZ;
        dCenters = Math.sqrt(dCenters2);
        normalX /= dCenters;
        normalY /= dCenters;
        normalZ /= dCenters;
        // angle between line connecting the sphere centers and the intersection of their surfaces
        const cosAlpha = 0.5 * (sphereImageRadius * sphereImageRadius + dCenters2 - planeImageRadius * planeImageRadius) / sphereImageRadius / dCenters;
        const imageRadius = sphereImageRadius * Math.sqrt(1 - cosAlpha * cosAlpha);
        const dSphereCircleCenter = cosAlpha * sphereImageRadius;
        const imageCenterX = sphereImageCenterX + dSphereCircleCenter * normalX;
        const imageCenterY = sphereImageCenterY + dSphereCircleCenter * normalY;
        const imageCenterZ = sphereImageCenterZ + dSphereCircleCenter * normalZ;
        return new Circle(imageCenterX, imageCenterY, imageCenterZ, imageRadius, normalX, normalY, normalZ);
    }
};

// invert a circle at a sphere, return the image circle
// return false if the circle remains unchanged
// use three inverted points on the circle
Sphere.prototype.altInvertCircle = function(circle) {
    // use the normalized normal vector to get two orthonormal vectors in the plane of the circle
    // it defines a rotation of the z-axis to the normal vector
    var e1x, e1y, e1z, e2x, e2y;
    const normalXY = Math.sqrt(circle.normalX * circle.normalX + circle.normalY * circle.normalY);
    // beware if normal vector is parallel to z-axis
    if (Math.abs(normalXY) < eps) {
        e1x = 1;
        e1y = 0;
        e1z = 0;
        e2x = 0;
        e2y = 1;
    } else {
        // (xz/rt(x2+y2),yz/rt(x2+y2),-rt(x2+y2)) is orthogonal to (x,y,z) and normalized
        e1x = circle.normalX * circle.normalZ / normalXY;
        e1y = circle.normalY * circle.normalZ / normalXY;
        e1z = -normalXY;
        // (-y/rt(x2+y2),x/rt(x2+y2),0) is additional orthonormal vector
        e2x = -circle.normalY / normalXY;
        e2y = circle.normalX / normalXY;
    }
    // invert three points at the sphere
    // we are safe, for present calculations, 
    // the circle should not pass through the center of the inverting sphere
    const r = circle.radius;
    //the first point
    let p1x = circle.centerX + r * e1x;
    let p1y = circle.centerY + r * e1y;
    let p1z = circle.centerZ + r * e1z;
    let dx = p1x - this.centerX;
    let dy = p1y - this.centerY;
    let dz = p1z - this.centerZ;
    let d2 = dx * dx + dy * dy + dz * dz;
    let factor = this.radius2 / d2;
    p1x = this.centerX + factor * dx;
    p1y = this.centerY + factor * dy;
    p1z = this.centerZ + factor * dz;
// second
    let p2x = circle.centerX + r * e2x;
    let p2y = circle.centerY + r * e2y;
    let p2z = circle.centerZ;
    dx = p2x - this.centerX;
    dy = p2y - this.centerY;
    dz = p2z - this.centerZ;
    d2 = dx * dx + dy * dy + dz * dz;
    factor = this.radius2 / d2;
    p2x = this.centerX + factor * dx;
    p2y = this.centerY + factor * dy;
    p2z = this.centerZ + factor * dz;
// third
    let p3x = circle.centerX - r * e1x;
    let p3y = circle.centerY - r * e1y;
    let p3z = circle.centerZ - r * e1z;
    dx = p3x - this.centerX;
    dy = p3y - this.centerY;
    dz = p3z - this.centerZ;
    d2 = dx * dx + dy * dy + dz * dz;
    factor = this.radius2 / d2;
    p3x = this.centerX + factor * dx;
    p3y = this.centerY + factor * dy;
    p3z = this.centerZ + factor * dz;
// find the circle defined by these three image points

};