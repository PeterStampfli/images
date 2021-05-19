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

// constants
const eps = 0.001;
const eps2 = eps * eps;
const pi = Math.PI;
const toDeg = 180 / pi;
const fromDeg = 1 / toDeg;
// abreviations for functions
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const round = Math.round;
const sqrt = Math.sqrt;
const abs = Math.abs;
// trigonometry
const rt3 = 1.732050808;
const tanPi10 = Math.tan(pi / 10);
const tan3Pi10 = Math.tan(3 * pi / 10);
const cosPi5 = Math.cos(pi / 5);
const sinPi5 = Math.sin(pi / 5);
const cos2Pi5 = Math.cos(2 * pi / 5);
const sin2Pi5 = Math.sin(2 * pi / 5);
const cos3Pi5 = Math.cos(3 * pi / 5);
const sin3Pi5 = Math.sin(3 * pi / 5);
const cos4Pi5 = Math.cos(4 * pi / 5);
const sin4Pi5 = Math.sin(4 * pi / 5);

// dihedral groups and mirrors
geometry.d12 = 5;
geometry.d13 = 3;
geometry.d23 = 2;
geometry.d14 = 2;
geometry.d24 = 2;
geometry.d34 = 3;
geometry.tiling = 'ikosahedral 533';
geometry.fourthMirror = false;
geometry.w = 0;

// Euler rotation angles
geometry.alpha = 0;
geometry.beta = 0;
geometry.gamma = 0;
// other rotation angles
geometry.xi = 0;
geometry.theta = 0;
geometry.phi = 0;

// dihedral mapping in the (x,y) plane

// d_2 symmetry in the (x,y) plane
function dihedral2() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y < 0) {
        y = -y;
        inversions += 1;
        change = true;
    }
}

// d_4 symmetry in the (x,y) plane
function dihedral4() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y < 0) {
        y = -y;
        inversions += 1;
        change = true;
    }
    if (x > y) {
        const h = x;
        x = y;
        y = h;
        inversions += 1;
        change = true;
    }
}

// d_3 symmetry in the (x,y) plane
function dihedral3() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y > 0) {
        if (x > rt3 * y) {
            const h = 0.5 * (rt3 * x - y);
            x = 0.5 * (x + rt3 * y);
            y = h;
            inversions += 1;
            change = true;
        }
    } else {
        if (x > -rt3 * y) {
            const h = 0.5 * (rt3 * x - y);
            x = 0.5 * (x + rt3 * y);
            y = h;
            inversions += 1;
            change = true;
        } else {
            const h = 0.5 * (rt3 * x - y);
            x = -0.5 * (x + rt3 * y);
            y = h;
            inversions += 2;
            change = true;
        }
    }
}

// d_5 symmetry in the (x,y) plane
function dihedral5() {
    if (x < 0) {
        x = -x;
        inversions += 1;
        change = true;
    }
    if (y > 0) {
        if (y < tanPi10 * x) {
            const h = sin2Pi5 * x + cos2Pi5 * y;
            x = cos2Pi5 * x - sin2Pi5 * y;
            y = h;
            inversions += 2;
            change = true;
        } else if (y < tan3Pi10 * x) {
            const h = sin3Pi5 * x - cos3Pi5 * y;
            x = cos3Pi5 * x + sin3Pi5 * y;
            y = h;
            inversions += 1;
            change = true;
        }
    } else {
        if (y > -tanPi10 * x) {
            const h = sin2Pi5 * x + cos2Pi5 * y;
            x = cos2Pi5 * x - sin2Pi5 * y;
            y = h;
            inversions += 2;
            change = true;
        } else if (y > -tan3Pi10 * x) {
            const h = sinPi5 * x - cosPi5 * y;
            x = cosPi5 * x + sinPi5 * y;
            y = h;
            inversions += 1;
            change = true;
        } else {
            const h = sin4Pi5 * x + cos4Pi5 * y;
            x = cos4Pi5 * x - sin4Pi5 * y;
            y = h;
            inversions += 2;
            change = true;
        }
    }
}

geometry.dihedrals = [null, null, dihedral2, dihedral3, dihedral4, dihedral5];
geometry.dihedral = geometry.dihedrals[5];

// mirror planes, n1x=1, trivial
var n2x, n2y, n3x, n3y, n3z, n4x, n4y, n4z, n4w;

geometry.check = function() {
    log();
    log(geometry.d12 + ' ' + geometry.d13 + ' ' + geometry.d23);
    log(geometry.d14 + ' ' + geometry.d24 + ' ' + geometry.d34);
    const d12 = geometry.d12;
    const d13 = geometry.d13;
    const d23 = geometry.d23;
    const angle12 = pi / d12;
    const angle13 = pi / d13;
    const angle23 = pi / d23;
    const d14 = geometry.d14;
    const d24 = geometry.d24;
    const d34 = geometry.d34;
    const angle14 = pi / d14;
    const angle24 = pi / d24;
    const angle34 = pi / d34;
    //setting up the first three mirror planes, normal vectors in 3d, unit length
    // n1=(1,0,0)
    // n2=(n2x,n2y,0)
    // intersection angle of planes: n2*n1=-cos(angle12)
    n2x = -cos(angle12);
    // normalize
    n2y = sqrt(1 - n2x * n2x);
    log('n1: 1,0,...');
    log('n2: ' + n2x.toPrecision(3) + ', ' + n2y.toPrecision(3));
    // intersection angle of planes: n3*n1=-cos(angle13)
    n3x = -cos(angle13);
    // intersection angle of planes: n3*n2=-cos(angle23)
    n3y = (-cos(angle23) - n3x * n2x) / n2y;
    // normalize
    let n3z2 = 1 - n3x * n3x - n3y * n3y;
    n3z = sqrt(1 - n3x * n3x - n3y * n3y);
    log('n3: ' + n3x.toPrecision(3) + ', ' + n3y.toPrecision(3) + ', ' + n3z.toPrecision(3));
    // intersection angle of planes: n4*n1=-cos(angle14)
    n4x = -cos(angle14);
    // intersection angle of planes: n4*n2=-cos(angle24)
    n4y = (-cos(angle24) - n4x * n2x) / n2y;
    // intersection angle of planes: n4*n3=-cos(angle34)
    n4z = (-cos(angle34) - n4x * n3x - n4y * n3y) / n3z;
    let n4w2 = 1 - n4x * n4x - n4y * n4y - n4z * n4z;
    n4w = sqrt(n4w2);
    log('n4: ' + n4x.toPrecision(3) + ', ' + n4y.toPrecision(3) + ', ' + n4z.toPrecision(3) + ', ' + n4w.toPrecision(3));
};

// setting up geometry and transforms
var transformMatrix;

geometry.setup = function() {
    const eulerMatrix = matrix.euler(geometry.alpha, geometry.beta, geometry.gamma);
    const cosPhi = cos(fromDeg * geometry.phi);
    const sinPhi = sin(fromDeg * geometry.phi);
    const cosXi = cos(fromDeg * geometry.xi);
    const sinXi = sin(fromDeg * geometry.xi);
    const cosTheta = cos(fromDeg * geometry.theta);
    const sinTheta = sin(fromDeg * geometry.theta);
    const tProjector = matrix.projector(-sinPhi, cosPhi, 0, 0);
    matrix.log(tProjector, 't projector');
    const sProjector = matrix.projector(cosPhi * cosTheta, sinPhi * cosTheta, -sinTheta, 0);
    matrix.log(sProjector, 'sProjector');
    transformMatrix = eulerMatrix;
    //    matrix.log(transformMatrix);
    dihedral = geometry.dihedral;
    geometry.check();
    if (geometry.fourthMirror) {
        map.mapping = fourMirrorsMapping;
    } else {
        map.mapping = threeMirrorsMapping;
    }
};

// views
var rView2;
// normal view of 3d sphere
function normalView() {
    const r2 = x * x + y * y;
    if (r2 > rView2) {
        valid = -1;
    } else {
        z = Math.sqrt(rView2 - r2);
    }
}

// mappings
var x, y, z, w;
var valid, inversions;
var change, change3, change4;
var dihedral;

// mirrors - plane mirrors

// mirror images at the first plane, part of the 3d spherical tiling
function firstMirror() {
    if (x < 0) {
        x -= x;
        inversions += 1;
        change = true;
    }
}

// mirror images at the second plane, part of the 3d spherical tiling
function secondMirror() {
    let d = n2x * x + n2y * y;
    if (d < 0) {
        d += d;
        x -= d * n2x;
        y -= d * n2y;
        inversions += 1;
        change = true;
    }
}

// mirror images at the third plane, part of the 3d spherical tiling
function thirdMirror() {
    let d = n3x * x + n3y * y + n3z * z;
    if (d < 0) {
        d += d;
        x -= d * n3x;
        y -= d * n3y;
        z -= d * n3z;
        inversions += 1;
        change3 = true;
    } else {
        change3 = false;
    }
}

// mirror images at the third plane, part of the 3d spherical tiling
function fourthMirror() {
    let d = n4x * x + n4y * y + n4z * z + n4w * w;
    if (d < 0) {
        d += d;
        x -= d * n4x;
        y -= d * n4y;
        z -= d * n4z;
        w -= d * n4w;
        inversions += 1;
        change4 = true;
    } else {
        change4 = false;
    }
}

// doing the tiling of the 3d sphere by reflection at three planes
function spherical() {
    do {
        dihedral();
        thirdMirror();
    }
    while (change3);
}

// stereographic projection in 3d:
// sphere to plane
// sphere radius from (x,y,z)
function inverseStereographic3d() {
    const r = Math.sqrt(x * x + y * y + z * z);
    const factor = 1 / (1 + z);
    x *= factor;
    y *= factor;
    z = 0;
}

/**
 * apply a matrix on the (x,y,z,w)-vector
 * as four variables
 * need to copy directly to using module (scope!)
 * @method matrix.apply
 * @param {array of floats} m - has the 4*4 matrix
 */
matrix.apply = function(m) {
    const newX = m[11] * x + m[12] * y + m[13] * z + m[14] * w;
    const newY = m[21] * x + m[22] * y + m[23] * z + m[24] * w;
    const newZ = m[31] * x + m[32] * y + m[33] * z + m[34] * w;
    const newW = m[41] * x + m[42] * y + m[43] * z + m[44] * w;
    x = newX;
    y = newY;
    z = newZ;
    w = newW;
};

/**
 * log the vector x,y,z,w
 * @method matrix.logVector
 */
matrix.logVector = function() {
    console.log(x, y, z, w);
};

function threeMirrorsMapping(point) {
    x = point.x;
    y = point.y;
    valid = 1;
    inversions = 0;
    w = geometry.w;
    rView2 = 1 - w * w;
    normalView();
    if (valid > 0) {
        matrix.apply(transformMatrix);
        spherical();
        inverseStereographic3d();
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
}

function fourMirrorsMapping(point) {
    x = point.x;
    y = point.y;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    w = geometry.w;
    rView2 = 1 - w * w;
    normalView();
    if (valid > 0) {
        matrix.apply(transformMatrix);
        let ite = 0;
        do {
            spherical();
            fourthMirror();
            ite += 1;
        }
        while (change4 && (ite < maxIterations));
        inverseStereographic3d();
    }
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
}