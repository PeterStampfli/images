/* jshint esversion: 6 */

import {
    map,
    log,
    output
} from "../libgui/modules.js";

/**
 * @namespace geometry
 */
export const geometry = {};
geometry.rHyperbolic = Math.sqrt(0.333333);
console.log('hyperbalic ball radius', geometry.rHyperbolic);

geometry.r = geometry.rHyperbolic;
geometry.offset = 0;
geometry.flipZ = false;
geometry.view = 'normal';
geometry.nDihedral = 100;
geometry.mirror5 = false;

// Euler rotation angles
geometry.alpha = 0;
geometry.beta = 0;
geometry.gamma = 0;

// abreviations for functions
const cos = Math.cos;
const sin = Math.sin;
const pi = Math.PI;
const toDeg = 180 / pi;
const fromDeg = 1 / toDeg;


geometry.setup = function() {
    const rInfty = Math.sqrt(2 / 3);
    const diAngle = Math.PI / geometry.nDihedral;
    rSphere = rInfty / cos(0.5 * diAngle);
    rSphere2 = rSphere * rSphere;
    rInner = 1 - rSphere;
    rInner2 = rInner * rInner;
    geometry.rHyperbolic = Math.sqrt(1 - rSphere2);
    // prepare transformation from Euler angles
    const c1 = cos(fromDeg * geometry.alpha);
    cosAlpha = c1;
    const s1 = sin(fromDeg * geometry.alpha);
    sinAlpha = s1;
    const c2 = cos(fromDeg * geometry.beta);
    const s2 = sin(fromDeg * geometry.beta);
    const c3 = cos(fromDeg * geometry.gamma);
    const s3 = sin(fromDeg * geometry.gamma);
    txx = c1 * c3 - c2 * s1 * s3;
    txy = -c1 * s3 - c2 * c3 * s1;
    txz = s1 * s2;
    tyx = c3 * s1 + c1 * c2 * s3;
    tyy = c1 * c2 * c3 - s1 * s3;
    tyz = -c1 * s2;
    tzx = s2 * s3;
    tzy = c3 * s2;
    tzz = c2;
    rView = geometry.r;
    rView2 = rView * rView;
    switch (geometry.view) {
        case 'normal':
            view = normalView;
            break;
        case 'stereographic':
            view = stereographic;
            break;
        case 'xy-plane':
            view = xyPlane;
            break;
        case 'zx-plane':
            view = zxPlane;
            break;

    }
    map.mapping = tetrahedronMapping;


};


// mappings
var x, y, z;
var valid, inversions;
var change, region;
var view;

// Euler angles -> transform
var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;
var sinAlpha, cosAlpha;

// views
var rView2, rView;
// normal view of 3d sphere
function normalView() {
    const r2 = x * x + y * y;
    if (r2 > rView2) {
        valid = -1;
    } else {
        z = Math.sqrt(rView2 - r2);
        if (geometry.flipZ) {
            z = -z;
        }
        euler();
        z += geometry.offset;
    }
}

// stereographic projection in 3d:
// plane to sphere with radius rView
// center at z=-r3d because spherical maps to z=+r3d
function stereographic() {
    const factor = 2 / (1 + (x * x + y * y) / rView2);
    x *= factor;
    y *= factor;
    z = rView * (1 - factor);
}

// plane crossection view projection in 3d:
// xy plane at z=offset
function xyPlane() {
    z = geometry.offset;
}

// plane crossection view projection in 3d:
// zx plane at y=offset, rotating around z-axis
function zxPlane() {
    z = -y;
    y = cosAlpha * geometry.offset + sinAlpha * x;
    x = cosAlpha * x - sinAlpha * geometry.offset;
}

// euler rotations
function euler() {
    const newX = txx * x + txy * y + txz * z;
    const newY = tyx * x + tyy * y + tyz * z;
    z = tzx * x + tzy * y + tzz * z;
    x = newX;
    y = newY;
}

var rSphere, rSphere2, rInner, rInner2;
// four inverting spheres
//const rSphere = 0.8165;

const cx2 = 0.9428;
const cx34 = -0.4714;
const cy3 = 0.8165;
const cy4 = -0.8165;
const cz234 = -0.3333;

// sphere at (0,0,1)
function sphere1() {
    if (z > 0) {
        const dz = z - 1;
        const d2 = dz * dz + x * x + y * y;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x *= factor;
            y *= factor;
            z = 1 + factor * dz;
            inversions += 1;
            change = true;
            region = 1;
        }
    }
}

// sphere at (cx2,0,cz234)
function sphere2() {
    if (x > 0) {
        const dz = z - cz234;
        const dx = x - cx2;
        const d2 = dz * dz + dx * dx + y * y;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = cx2 + factor * dx;
            y *= factor;
            z = cz234 + factor * dz;
            inversions += 1;
            change = true;
            region = 2;
        }
    }
}

// sphere at (cx34,cy3,cz234)
function sphere3() {
    if (y > 0) {
        const dz = z - cz234;
        const dx = x - cx34;
        const dy = y - cy3;
        const d2 = dz * dz + dx * dx + dy * dy;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = cx34 + factor * dx;
            y = cy3 + factor * dy;
            z = cz234 + factor * dz;
            inversions += 1;
            change = true;
            region = 3;
        }
    }
}

// sphere at (cx34,cy4,cz234)
function sphere4() {
    if (y < 0) {
        const dz = z - cz234;
        const dx = x - cx34;
        const dy = y - cy4;
        const d2 = dz * dz + dx * dx + dy * dy;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = cx34 + factor * dx;
            y = cy4 + factor * dy;
            z = cz234 + factor * dz;
            inversions += 1;
            change = true;
            region = 4;
        }
    }
}

// the fifth smaller sphere at (0,0,0)
function innerSphere() {
    const d2 = z * z + x * x + y * y;
    if (d2 < rInner2) {
        const factor = rInner2 / d2;
        x *= factor;
        y *= factor;
        z *= factor;
        inversions += 1;
        change = true;
        region = 5;
    }
}

function tetrahedronMapping(point) {
    x = point.x;
    y = point.y;
    region = point.region;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    view();
    if (valid > 0) {
        let ite = 0;
        do {
            change = false;
            sphere1();
            sphere2();
            sphere3();
            sphere4();
            if (geometry.mirror5) {
                innerSphere();
            }
            ite += 1;
        }
        while (change && (ite < maxIterations));
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
    //  point.region=region;
    //         map.activeRegions[region] = true;
}