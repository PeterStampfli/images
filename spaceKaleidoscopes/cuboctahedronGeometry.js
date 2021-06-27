/* jshint esversion: 6 */

import {
    map,
    log,
    output,
    guiUtils
} from "../libgui/modules.js";

/**
 * @namespace geometry
 */
export const geometry = {};
rHyperbolic = Math.sqrt(3 / 2);
geometry.rHyperbolic = rHyperbolic;

geometry.r = rHyperbolic;
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

const rt32 = Math.sqrt(3) / 2;
const rt05 = Math.sqrt(0.5);
const rt03 = Math.sqrt(1 / 3);
const rt06 = Math.sqrt(1 / 6);

/**
 * determine circle radius for given distance betwween centers
 * radius of other circle and order of dihedral group
 * @method circleRadius
 * @param {float} distance
 * @param {float} otherRadius
 * @param {integer} dihedralOrder
 * @return float, radius
 */
function circleRadius(distance, otherRadius, dihedralOrder) {
    const solutions = {};
    const angle = Math.PI / dihedralOrder;
    const a = 1;
    const b = 2 * otherRadius * cos(angle);
    const c = otherRadius * otherRadius - distance * distance;
    if (c > 0) {
        console.error('circleRadius: distance smaller than other radius', distance, otherRadius);
    } else {
        guiUtils.quadraticEquation(a, b, c, solutions);
        if (solutions.x > 0) {
            return solutions.x;
        } else {
            return solutions.y;
        }
    }
}

geometry.setup = function() {
    const diAngle = Math.PI / geometry.nDihedral;
    rSphere = Math.sqrt(0.5) / cos(0.5 * diAngle);
    rSphere2 = rSphere * rSphere;
    rHyperbolic2 = 2 - rSphere2;
    rHyperbolic = Math.sqrt(Math.abs(rHyperbolic2));
    geometry.rHyperbolic = rHyperbolic;
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
        case '(1,1,1)-plane':
            view = diagonalPlane;
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
var rHyperbolic, rHyperbolic2;

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
    z = -rView * (1 - factor);
    if (geometry.flipZ) {
        z = -z;
    }
    euler();
}

// plane crossection view projection in 3d:
// xy plane at z=offset
function xyPlane() {
    z = geometry.offset;
    if (geometry.flipZ) {
        z = -z;
    }
}

// plane crossection view projection in 3d:
// zx plane at y=offset, rotating around z-axis
function zxPlane() {
    z = -y;
    y = cosAlpha * geometry.offset + sinAlpha * x;
    x = cosAlpha * x - sinAlpha * geometry.offset;
    if (geometry.flipZ) {
        z = -z;
    }
}
// plane crossection view projection in 3d:
// plane perpendicular to (1,1,1) direction
function diagonalPlane() {
    const offset = 0.33333 * geometry.offset;
    z = offset + 2 * rt06 * y;
    const newX = offset + rt05 * x - rt06 * y;
    y = offset - rt05 * x - rt06 * y;
    x = newX;
    if (geometry.flipZ) {
        z = -z;
    }
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

// sphere at (0,0,+-1)
function spheres() {
    var xr, yr, zr;
    var dx, dy, dz, d2;
    // spheres z=0; x and y=+-1
    xr = (x > 0) ? 1 : -1;
    yr = (y > 0) ? 1 : -1;
    dx = x - xr;
    dy = y - yr;
    d2 = z * z + dx * dx + dy * dy;
    if (d2 < rSphere2) {
        const factor = rSphere2 / d2;
        x = xr + factor * dx;
        y = yr + factor * dy;
        z *= factor;
        inversions += 1;
        change = true;
    }
    zr = (z > 0) ? 1 : -1;
    if (Math.abs(x) > Math.abs(y)) {
        xr = (x > 0) ? 1 : -1;
        yr = 0;
    } else {
        xr = 0;
        yr = (y > 0) ? 1 : -1;
    }
    dx = x - xr;
    dy = y - yr;
    dz = z - zr;
    d2 = dz * dz + dx * dx + dy * dy;
    if (d2 < rSphere2) {
        const factor = rSphere2 / d2;
        x = xr + factor * dx;
        y = yr + factor * dy;
        z = zr + factor * dz;
        inversions += 1;
        change = true;
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

const regionOfSide = [0, 1, 2, 3, 4, 5, 6];

function findRegion() {
    let side = 0;
    const aax = Math.abs(x);
    const aay = Math.abs(y);
    const aaz = Math.abs(z);
    let ax = aax;
    let ay = aay;
    let az = aaz;
    if (ax < ay) {
        const h = ax;
        ax = ay;
        ay = h;
    }
    if (ax < az) {
        const h = ax;
        ax = az;
        az = h;
    }
    if (ax - ay - az > 0) {
        // square sides
        if (aax > aay) {
            if (aax > aaz) {
                side = 4; // ax> max(ay,az)
            } else {
                side = 6; // az>ax>ay
            }
        } else {
            if (aaz > aay) {
                side = 6; // az>ay>ax
            } else {
                side = 5; // ay>max(az,ax)
            }
        }

    }
    else {
        // octagon sides
         if (y > 0) {
        side+=2;
    }
    if (x > 0) {
        side+=1;
    }   
       if (z > 0) {
        side=3-side;
    }
    }
    region = regionOfSide[side];
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
            spheres();
            ite += 1;
        }
        while (change && (ite < maxIterations));
        findRegion();
        point.x = x;
        point.y = y;
        point.iterations = inversions;
        point.valid = valid;
        point.region = region;
        map.activeRegions[region] = true;
    } else {
        point.region = 255;
        point.valid = -1;
    }
}