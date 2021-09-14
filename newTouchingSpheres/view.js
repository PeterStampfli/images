/* jshint esversion: 6 */

import {
    poincare
} from './modules.js';

export const view = {};

// make the view-transfoms for objects
// (x,y,z,radius) => (viewX,viewY,viewZ,viewRadius)

// euler rotation
// interpolated stereographic projection
// tilt and rotate
// sort z

const fromDeg = Math.PI / 180;

view.alpha = 0;
view.beta = 0;
view.gamma = 0;
var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;

// 0 for normal view, 1 for stereographic view
view.interpolation = 0;
var stereographicCenter, stereographicOffset, stereographicRadius2, doStereographicProjection;

view.tiltAngle = 0;
view.rotationAngle = 0;
var tiltCos, tiltSin, rotationCos, rotationSin;

view.update = function() {
    const c1 = Math.cos(fromDeg * view.alpha);
    const s1 = Math.sin(fromDeg * view.alpha);
    const c2 = Math.cos(fromDeg * view.beta);
    const s2 = Math.sin(fromDeg * view.beta);
    const c3 = Math.cos(fromDeg * view.gamma);
    const s3 = Math.sin(fromDeg * view.gamma);
    txx = c1 * c3 - c2 * s1 * s3;
    txy = -c1 * s3 - c2 * c3 * s1;
    txz = s1 * s2;
    tyx = c3 * s1 + c1 * c2 * s3;
    tyy = c1 * c2 * c3 - s1 * s3;
    tyz = -c1 * s2;
    tzx = s2 * s3;
    tzy = c3 * s2;
    tzz = c2;
    doStereographicProjection = (view.interpolation > 0.01);
    let x = Math.max(0.001, view.interpolation);
    x *= x;
    stereographicCenter = poincare.radius / x;
    stereographicRadius2 = stereographicCenter * stereographicCenter + 3 * poincare.radius * poincare.radius;
    stereographicOffset = -2 * poincare.radius * x;
    tiltCos = Math.cos(fromDeg * view.tiltAngle);
    tiltSin = Math.sin(fromDeg * view.tiltAngle);
    rotationCos = Math.cos(fromDeg * view.rotationAngle);
    rotationSin = Math.sin(fromDeg * view.rotationAngle);
};

// transform radius,x,y,z fields to viewRadius,viewX,viewY,viewZ and sort z-coordinates
view.transform = function(spheres) {
    const length = spheres.length;
    for (let i = 0; i < length; i++) {
        const sphere = spheres[i];
        let x = sphere.x;
        let y = sphere.y;
        let z = sphere.z;
        let viewX = txx * x + txy * y + txz * z;
        let viewY = tyx * x + tyy * y + tyz * z;
        let viewZ = tzx * x + tzy * y + tzz * z;
        let viewRadius = sphere.radius;
        if (doStereographicProjection) {
            const dz = viewZ - stereographicCenter;
            const d2 = viewX * viewX + viewY * viewY + dz * dz;
            const factor = stereographicRadius2 / (d2 - viewRadius * viewRadius);
            viewX *= factor;
            viewY *= factor;
            viewZ = stereographicOffset - (stereographicCenter + factor * dz); // compensate for mirroring at (x,y) plane in limit to normal view
            viewRadius *= factor;
        }
        sphere.viewX = rotationCos * viewX - rotationSin * viewY;
        viewY = rotationSin * viewX + rotationCos * viewY;
        sphere.viewY = tiltCos * viewY - tiltSin * viewZ;
        sphere.viewZ = tiltSin * viewY + tiltCos * viewZ;
        sphere.viewRadius=viewRadius;
    }
        spheres.sort((one, two) => one.viewZ - two.viewZ);
};