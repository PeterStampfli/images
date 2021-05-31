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

geometry.setup = function() {
    console.log('setup');
    rView = 0.5773 * geometry.r;
    rView2 = rView * rView;
    view = normalView;
    map.mapping = fourSpheresMapping;

};


// mappings
var x, y, z;
var valid, inversions;
var change;


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


// four inverting spheres
const rSphere = 0.8165;
const rSphere2 = rSphere * rSphere;
const rCenter = 1 - rSphere;
const rCenter2 = rCenter * rCenter;
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
            factor = rSphere2 / d2;
            x *= factor;
            y *= factor;
            z = 1 + factor * dz;
            inversions += 1;
            change = true;
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
            factor = rSphere2 / d2;
            x = cx2 + factor * dx;
            y *= factor;
            z = cz234 + factor * dz;
            inversions += 1;
            change = true;
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
            factor = rSphere2 / d2;
            x = cx34 + factor * dx;
            y = cy3 + factor * dy;
            z = cz234 + factor * dz;
            inversions += 1;
            change = true;
        }
    }
}

// sphere at (cx34,cy4,cz234)
function sphere4() {
    if (y > 0) {
        const dz = z - cz234;
        const dx = x - cx34;
        const dy = y - cy4;
        const d2 = dz * dz + dx * dx + dy * dy;
        if (d2 < rSphere2) {
            factor = rSphere2 / d2;
            x = cx34 + factor * dx;
            y = cy4 + factor * dy;
            z = cz234 + factor * dz;
            inversions += 1;
            change = true;
        }
    }
}

// the fifth smaller sphere at (0,0,0)
function sphereCenter() {
    const d2 = z * z + x * x + y * y;
    if (d2 < rCenter2) {
        factor = rCenter2 / d2;
        x *= factor;
        y *= factor;
        z *= factor;
        inversions += 1;
        change = true;
    }
}

function fourSpheresMapping(point) {
    x = point.x;
    y = point.y;
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

            ite += 1;
        }
        while (change && (ite < maxIterations));
        //   inverseStereographic3d();
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
}