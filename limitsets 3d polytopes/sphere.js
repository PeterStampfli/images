/* jshint esversion: 6 */

import {
    SVG
}
from "../libgui/modules.js";

import {
    Circle
}
from "./circle.js";

import {
    Line
}
from "./line.js";

export function Sphere(centerX, centerY, centerZ, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.centerZ = centerZ;
    this.radius = radius;
    this.radius2 = radius * radius;
}

function prec(x) {
    return x.toPrecision(4);
}

// mapping spheres: array of arrays of [centerX,centerY,centerZ],radius
Sphere.prototype.writeSCAD = function() {
    const size = Circle.size;
    // export to Circle.SCADtext
    if (Circle.first) {
        Circle.first = false;
    } else {
        Circle.SCADtext += ',';
    }
    Circle.SCADtext += '\n';
    Circle.SCADtext += '[[' + prec(size * this.centerX) + ',' + prec(size * this.centerY) + ',' + prec(size * this.centerZ) + '],';
    Circle.SCADtext += prec(size * this.radius) + ']';
};

// draw the sphere in top-down projection as a circle
// or make an inversion/stereographic projection such that it is on the xy-plane (surface of poincare half-plane)

Sphere.prototype.draw = function() {
    const size = Circle.size;
    const eps = 0.01;
    if (Circle.planar) {
        // invert at sphere with radius r=sqrt(2), center at (0,0,1)
        const factor = 2 / (this.centerX * this.centerX + this.centerY * this.centerY + (this.centerZ - 1) * (this.centerZ - 1) - this.radius * this.radius);
        SVG.createCircle(size * factor * this.centerX, size * factor * this.centerY, size * Math.abs(factor) * this.radius);
    } else {
        SVG.createCircle(size * this.centerX, size * this.centerY, size * this.radius);
    }
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
    const eps = 0.001;
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
// return the line if the line passes through the center of the sphere (and thus remains unchanged)
Sphere.prototype.invertLine = function(line) {
    const eps = 0.001;
    //  together with the direction vector the line between the sphere center and a point of the line
    // defines a plane, the inversion is defined in this plane
    let centerToLinePointX = line.pointX - this.centerX;
    let centerToLinePointY = line.pointY - this.centerY;
    let centerToLinePointZ = line.pointZ - this.centerZ;
    // normal vector to the plane: cross product of lineDirection and centerToLinePoint
    const normalX = line.directionY * centerToLinePointZ - line.directionZ * centerToLinePointY;
    const normalY = line.directionZ * centerToLinePointX - line.directionX * centerToLinePointZ;
    const normalZ = line.directionX * centerToLinePointY - line.directionY * centerToLinePointX;
    // if line passes through center of sphere, then this vector vanishes, centerToLinePoint and lineDirection are colinear
    // the image is the line itself, return the line
    if (normalX * normalX + normalY * normalY + normalZ * normalZ < eps) {
        return line;
    }
    // solve for the circle image in the plane
    // calculate perpendicular vector from sphere center to line
    // orthogonalize the vector from sphere center to the point on the line
    // with respect to the direction vector of the line
    const product = line.directionX * centerToLinePointX + line.directionY * centerToLinePointY + line.directionZ * centerToLinePointZ;
    let centerToLineX = centerToLinePointX - product * line.directionX;
    let centerToLineY = centerToLinePointY - product * line.directionY;
    let centerToLineZ = centerToLinePointZ - product * line.directionZ;
    // this vector is perpendicular to the line, and inside the plane
    // determine distance of line to sphere center and normalize
    const dSphereCenterToLine = Math.sqrt(centerToLineX * centerToLineX + centerToLineY * centerToLineY + centerToLineZ * centerToLineZ);
    centerToLineX /= dSphereCenterToLine;
    centerToLineY /= dSphereCenterToLine;
    centerToLineZ /= dSphereCenterToLine;
    // the image circle passes through the center of the sphere and the inverted image
    // of the closest point of the line to the sphere center
    const radius = 0.5 * this.radius2 / dSphereCenterToLine;
    const centerX = this.centerX + radius * centerToLineX;
    const centerY = this.centerY + radius * centerToLineY;
    const centerZ = this.centerZ + radius * centerToLineZ;
    return new Circle(centerX, centerY, centerZ, radius, normalX, normalY, normalZ);
};

// invert a circle at a sphere, return the image circle
// even if it is not changed
// use intersection of circle plane and circle sphere
Sphere.prototype.invertCircle = function(circle) {
    const eps = 0.001;
    // vector from center of this mapping sphere to center of circle
    const sphereToCircleCenterX = circle.centerX - this.centerX;
    const sphereToCircleCenterY = circle.centerY - this.centerY;
    const sphereToCircleCenterZ = circle.centerZ - this.centerZ;
    // distance between the centers
    const dSphereToCircleCenter2 = sphereToCircleCenterX * sphereToCircleCenterX + sphereToCircleCenterY * sphereToCircleCenterY + sphereToCircleCenterZ * sphereToCircleCenterZ;
    // signed distance of center of sphere to the plane of the circle, perpendicular vector is normalized
    const dToPlane = circle.normalX * sphereToCircleCenterX + circle.normalY * sphereToCircleCenterY + circle.normalZ * sphereToCircleCenterZ;
    // if this distance is nearly zero then plane goes through center of sphere 
    // and we have a 2d inversion
    // this is the only case that the plane of the circle gets mapped into a plane
    console.log('distance sphere to plane of circcle', dToPlane);
    if (Math.abs(dToPlane) < eps) {
        if (Math.abs(dSphereToCircleCenter2 - circle.radius2) < eps) {
            // circle passes through center of sphere, image is a line
            // mapping the furthest point of the circle gives a point on this line
            // distance from the center of mapping circle is the diameter of the circle
            // resulting distance is mapping sphere radius**2/(2*circle radius)
            const factor = 0.5 * this.radius2 / circle.radius2;
            const imagePointX = this.centerX + factor * sphereToCircleCenterX;
            const imagePointY = this.centerY + factor * sphereToCircleCenterY;
            const imagePointZ = this.centerZ + factor * sphereToCircleCenterZ;
            // direction is perpendicular to vector from sphere center to circle center
            // is in plane and thus perpendicular to the normal vector of the plane
            const directionX = sphereToCircleCenterY * circle.normalZ - sphereToCircleCenterZ * circle.normalY;
            const directionY = sphereToCircleCenterZ * circle.normalX - sphereToCircleCenterX * circle.normalZ;
            const directionZ = sphereToCircleCenterX * circle.normalY - sphereToCircleCenterY * circle.normalX;
            return new Line(imagePointX, imagePointY, imagePointZ, directionX, directionY, directionZ);
        } else {
            // the circle image is a circle, the normal vector to its plane is unchanged
            const factor = this.radius2 / (dSphereToCircleCenter2 - circle.radius2);
            if (Math.abs(factor - 1) > eps) {
                const imageRadius = Math.abs(factor) * circle.radius;
                const imageCenterX = this.centerX + factor * sphereToCircleCenterX;
                const imageCenterY = this.centerY + factor * sphereToCircleCenterY;
                const imageCenterZ = this.centerZ + factor * sphereToCircleCenterZ;
                return new Circle(imageCenterX, imageCenterY, imageCenterZ, imageRadius, circle.normalX, circle.normalY, circle.normalZ);
            } else {
                // image circle is same as original circle
                return circle;
            }
        }
    } else {
        // plane of circle does not go through center of the mappingsphere
        // this plane is always mapped to a sphere
        // determine image sphere data from the inverted point of plane closest to mapping sphere
        // the normal vector to the plane goes from the center of mapping sphere to center of image sphere
        const dBetweenSphereCenters = 0.5 * this.radius2 / dToPlane;
        const planeImageRadius = Math.abs(dBetweenSphereCenters);
        const planeImageCenterX = this.centerX + dBetweenSphereCenters * circle.normalX;
        const planeImageCenterY = this.centerY + dBetweenSphereCenters * circle.normalY;
        const planeImageCenterZ = this.centerZ + dBetweenSphereCenters * circle.normalZ;
        console.log('image of plane xyz,rad', planeImageCenterX, planeImageCenterY, planeImageCenterZ, planeImageRadius);
        // the sphere defined by the circle is mapped into a sphere or a plane
        if (Math.abs(dSphereToCircleCenter2 - circle.radius2) < eps) {
            // the image of the sphere is a plane because it goes through the center of the mapping sphere
            // the vector from the mapping circle center to the cirle's center is perpendicular to this plane
            // this vector is normal to the plane of the circle's image
            const dSphereToCircleCenter = Math.sqrt(dSphereToCircleCenter2);
            const sphereImagePlaneNormalX = sphereToCircleCenterX / dSphereToCircleCenter;
            const sphereImagePlaneNormalY = sphereToCircleCenterY / dSphereToCircleCenter;
            const sphereImagePlaneNormalZ = sphereToCircleCenterZ / dSphereToCircleCenter;
            // an anchor point of this plane results from inversion of the far point of the sphere
            // its distance to the mapping sphere's center is the diameter of the circle's sphere
            const dMappingSphereToSphereImagePlane = 0.5 * this.radius2 / circle.radius;
            const sphereImagePlanePointX = this.centerX + dMappingSphereToSphereImagePlane * sphereImagePlaneNormalX;
            const sphereImagePlanePointY = this.centerY + dMappingSphereToSphereImagePlane * sphereImagePlaneNormalY;
            const sphereImagePlanePointZ = this.centerZ + dMappingSphereToSphereImagePlane * sphereImagePlaneNormalZ;
            // the circle's image is intersection between this plane and the spherical image of the circle's plane
            const dPlaneImageCenterToSphereImagePlane = sphereImagePlaneNormalX * (sphereImagePlanePointX - planeImageCenterX) + sphereImagePlaneNormalY * (sphereImagePlanePointY - planeImageCenterY) + sphereImagePlaneNormalZ * (sphereImagePlanePointZ - planeImageCenterZ);
            const circleImageCenterX = planeImageCenterX + dPlaneImageCenterToSphereImagePlane * sphereImagePlaneNormalX;
            const circleImageCenterY = planeImageCenterY + dPlaneImageCenterToSphereImagePlane * sphereImagePlaneNormalY;
            const circleImageCenterZ = planeImageCenterZ + dPlaneImageCenterToSphereImagePlane * sphereImagePlaneNormalZ;
            const circleImageRadius = Math.sqrt(planeImageRadius * planeImageRadius - dPlaneImageCenterToSphereImagePlane * dPlaneImageCenterToSphereImagePlane);
            return new Circle(circleImageCenterX, circleImageCenterY, circleImageCenterZ, sphereImagePlaneNormalX, sphereImagePlaneNormalY, sphereImagePlaneNormalZ);
        } else {
            // the image of the circle's sphere at the mapping sphere is a sphere
            const factor = this.radius2 / (dSphereToCircleCenter2 - circle.radius2);
            console.log('image of sphere to circle,factor', factor);
            const sphereImageRadius = Math.abs(factor) * circle.radius;
            const sphereImageCenterX = this.centerX + factor * sphereToCircleCenterX;
            const sphereImageCenterY = this.centerY + factor * sphereToCircleCenterY;
            const sphereImageCenterZ = this.centerZ + factor * sphereToCircleCenterZ;
            // the intersection between these two spheres gives the image circle
            // the plane of the image circle is perpendicular to the line between
            // the centers of the image spheres of the plane and the sphere defining the circle
            // going out from the center of the sphere image to the plane image
            let sphereToPlaneImageCentersX = planeImageCenterX - sphereImageCenterX;
            let sphereToPlaneImageCentersY = planeImageCenterY - sphereImageCenterY;
            let sphereToPlaneImageCentersZ = planeImageCenterZ - sphereImageCenterZ;
            // normalize and get distance between centers
            const dImageCenters2 = sphereToPlaneImageCentersX * sphereToPlaneImageCentersX + sphereToPlaneImageCentersY * sphereToPlaneImageCentersY + sphereToPlaneImageCentersZ * sphereToPlaneImageCentersZ;
            const dImageCenters = Math.sqrt(dImageCenters2);
            sphereToPlaneImageCentersX /= dImageCenters;
            sphereToPlaneImageCentersY /= dImageCenters;
            sphereToPlaneImageCentersZ /= dImageCenters;
            // angle between line connecting the sphere centers and the intersection of their surfaces
            // at the center of the circle's sphere image
            const cosAlpha = 0.5 * (sphereImageRadius * sphereImageRadius + dImageCenters2 - planeImageRadius * planeImageRadius) / sphereImageRadius / dImageCenters;
            const sinAlpha = Math.sqrt(1 - cosAlpha * cosAlpha);
            const circleImageRadius = sinAlpha * sphereImageRadius;
            const dSphereImageCircleCenters = cosAlpha * sphereImageRadius;
            const circleImageCenterX = sphereImageCenterX + dSphereImageCircleCenters * sphereToPlaneImageCentersX;
            const circleImageCenterY = sphereImageCenterY + dSphereImageCircleCenters * sphereToPlaneImageCentersY;
            const circleImageCenterZ = sphereImageCenterZ + dSphereImageCircleCenters * sphereToPlaneImageCentersZ;
            return new Circle(circleImageCenterX, circleImageCenterY, circleImageCenterZ, circleImageRadius, sphereToPlaneImageCentersX, sphereToPlaneImageCentersY, sphereToPlaneImageCentersZ);
        }
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
    // get two orthonormal vectors in the plane of the two points
    // use p1 as origin
    // we do not need the vectors in the plane of the original circle anymore
    e1x = p2x - p1x;
    e1y = p2y - p1y;
    e1z = p2z - p1z;
    // the second vector
    e2x = p3x - p1x;
    e2y = p3y - p1y;
    e2z = p3z - p1z;
    const point1ToPoint3x = e2x;
    const point1ToPoint3y = e2y;
    const point1ToPoint3z = e2z;
    // get normal vector to plane of points and circle, if not colinear
    const normalX = e1y * e2z - e1z * e2y;
    const normalY = e1z * e2x - e1x * e2z;
    const normalZ = e1x * e2y - e1y * e2x;
    const normal2 = normalX * normalX + normalY * normalY + normalZ * normalZ;
    if (normal2 < eps) {
        return new Line(p1x, p1y, p1z, e1x, e1y, e1z);
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
    // coordinates of point 3 with respect to e1 and e2
    // center1=(0,0), center2=(d,0), center3=(x3,y3)
    const x3 = point1ToPoint3x * e1x + point1ToPoint3y * e1y + point1ToPoint3z * e1z;
    const y3 = point1ToPoint3x * e2x + point1ToPoint3y * e2y + point1ToPoint3z * e2z;
    // the image circle in the orthonormal coordinate system of e1 and e2
    const x = d / 2;
    const y = 0.5 * (y3 + (x3 - d) * x3 / y3);
    const centerX = p1x + x * e1x + y * e2x;
    const centerY = p1y + x * e1y + y * e2y;
    const centerZ = p1z + x * e1z + y * e2z;
    const radius = Math.sqrt(x3 * x3 + y3 * y3);
    return new Circle(centerX, centerY, centerZ, radius, normalX, normalY, normalZ);
};