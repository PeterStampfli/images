/* jshint esversion: 6 */

import {
    map,
    log
} from "../libgui/modules.js";

import {
    matrix
} from "./modules.js";

/**
 * @namespace geometry
 */
export const geometry = {};

geometry.r = 1;
geometry.flipZ = false;
geometry.view = 'normal';

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
    // prepare transformation from Euler angles
    const c1 = cos(fromDeg * geometry.alpha);
    const s1 = sin(fromDeg * geometry.alpha);
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
  //  rView = 0.7071 * geometry.r;
    rView = 1.414 * geometry.r;
    rView2 = rView * rView;
    switch (geometry.view) {
        case 'normal':
            view = normalView;
            break;
        case 'stereographic':
            view = stereographic;
            break;
        case 'plane':
            view = plane;
            break;

    }
    //   map.mapping = fourSpheresMapping;
    map.mapping = octMapping;
    map.mapping = cubeMapping;

};


// mappings
var x, y, z;
var valid, inversions;
var change, region;
var view;

// Euler angles -> transform
var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;


// views
var rView2, rView;
// normal view of 3d sphere
function normalView() {
    const r2 = x * x + y * y;
    if (r2 > rView2) {
        valid = -1;
    } else {
        z = Math.sqrt(rView2 - r2);
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
// plane to sphere with radius rView
// center at z=-r3d because spherical maps to z=+r3d
function plane() {
    const factor = 2 / (1 + (x * x + y * y) / rView2);
    z = rView;
}

// euler rotations
function euler() {
    const newX = txx * x + txy * y + txz * z;
    const newY = tyx * x + tyy * y + tyz * z;
    z = tzx * x + tzy * y + tzz * z;
    x = newX;
    y = newY;
}

// four inverting spheres
const rSphere = 0.8165;
const rSphere2 = rSphere * rSphere;
const rInner = 1 - rSphere;
const rInner2 = rInner * rInner;
const rOuter = 1 + rSphere;
const rOuter2 = rOuter * rOuter;
const rBall = 0.5773;
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

// the sixth outer sphere at (0,0,0)
function outerSphere() {
    const d2 = z * z + x * x + y * y;
    if (d2 > rOuter2) {
        const factor = rOuter2 / d2;
        x *= factor;
        y *= factor;
        z *= factor;
        inversions += 1;
        change = true;
        region = 6;
    }
}

function fourSpheresMapping(point) {
    x = point.x;
    y = point.y;
    region = point.region;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    view();
    if (valid > 0) {
        if (geometry.flipZ) {
            z = -z;
        }
        euler();
        let ite = 0;
        do {
            change = false;
            sphere1();
            sphere2();
            sphere3();
            sphere4();
            innerSphere();
            outerSphere();

            ite += 1;
        }
        while (change && (ite < maxIterations));
        //   inverseStereographic3d();
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
    //  point.region=region;
    //         map.activeRegions[region] = true;
}

// octagonal
const octInnerRadius2 = 0.0857864;

function octInnerSphere() {
    const d2 = z * z + x * x + y * y;
    if (d2 < octInnerRadius2) {
        const factor = octInnerRadius2 / d2;
        x *= factor;
        y *= factor;
        z *= factor;
        inversions += 1;
        change = true;
    }
}

// sphere at (0,0,+-1)
function oct1() {
    if (z > 0) {
        const dz = z - 1;
        const d2 = dz * dz + x * x + y * y;
        if (d2 < 0.5) {
            const factor = 0.5 / d2;
            x *= factor;
            y *= factor;
            z = 1 + factor * dz;
            inversions += 1;
            change = true;
        }
    } else {
        const dz = z + 1;
        const d2 = dz * dz + x * x + y * y;
        if (d2 < 0.5) {
            const factor = 0.5 / d2;
            x *= factor;
            y *= factor;
            z = -1 + factor * dz;
            inversions += 1;
            change = true;
        }
    }
}


// sphere at (0,0,+-1)
function oct2() {
    if (y > 0) {
        const dy = y - 1;
        const d2 = z * z + x * x + dy * dy;
        if (d2 < 0.5) {
            const factor = 0.5 / d2;
            x *= factor;
            y = 1 + factor * dy;
            z *= factor;
            inversions += 1;
            change = true;
        }
    } else {
        const dy = y + 1;
        const d2 = z * z + x * x + dy * dy;
        if (d2 < 0.5) {
            const factor = 0.5 / d2;
            x *= factor;
            y = -1 + factor * dy;
            z *= factor;
            inversions += 1;
            change = true;
        }
    }
}

// sphere at (0,0,+-1)
function oct3() {
    if (x > 0) {
        const dx = x - 1;
        const d2 = z * z + dx * dx + y * y;
        if (d2 < 0.5) {
            const factor = 0.5 / d2;
            x = 1 + factor * dx;
            y *= factor;
            z *= factor;
            inversions += 1;
            change = true;
        }
    } else {
        const dx = x + 1;
        const d2 = z * z + dx * dx + y * y;
        if (d2 < 0.5) {
            const factor = 0.5 / d2;
            x = -1 + factor * dx;
            y *= factor;
            z *= factor;
            inversions += 1;
            change = true;
        }
    }
}


function octMapping(point) {
    x = point.x;
    y = point.y;
    region = point.region;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    view();
    if (valid > 0) {
        if (geometry.flipZ) {
            z = -z;
        }
        euler();
        let ite = 0;
        do {
            change = false;
            oct1();
            oct2();
            oct3();
octInnerSphere();
            ite += 1;
        }
        while (change && (inversions < maxIterations));
        //   inverseStereographic3d();
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
    //  point.region=region;
    //         map.activeRegions[region] = true;
}

function cubeSphere(){
    const cx=(x>0)?1:-1;
    const cy=(y>0)?1:-1;
    const cz=(z>0)?1:-1;
    const dx=x-cx;
    const dy=y-cy;
    const dz=z-cz;
    const d2=dx*dx+dy*dy+dz*dz;
    if (1>d2){
             const factor = 1 / d2;
            x = cx + factor * dx;
            y = cy + factor * dy;
            z = cz + factor * dz;
            inversions += 1;
            change = true;
    }
}


function cubeMapping(point) {
    x = point.x;
    y = point.y;
    region = point.region;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    view();
    if (valid > 0) {
        if (geometry.flipZ) {
            z = -z;
        }
        euler();
        let ite = 0;
        do {
            change = false;
            cubeSphere();

            ite += 1;
        }
        while (change && (inversions < maxIterations));
        //   inverseStereographic3d();
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
    //  point.region=region;
    //         map.activeRegions[region] = true;
}

x=0.9
y=0.9
z=0.9
cubeSphere();
console.log(x,y,z)