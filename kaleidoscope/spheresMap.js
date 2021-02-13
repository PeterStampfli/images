/* jshint esversion: 6 */

import {
    map
} from "../libgui/modules.js";

/**
 * @namespace geometry
 */
export const geometry = {};

// the geometry
geometry.basicTriangle = 'ikosahedron';
geometry.rotation = 0;
geometry.d14 = 2;
geometry.d24 = 3;
geometry.d34 = 5;

// constants
const pi = Math.PI;
const toDeg = 180 / pi;
// abreviations for functions
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const round = Math.round;
const sqrt = Math.sqrt;
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

// dihedral mapping in the (x,y) plane
var dihedral, dihedrals;

// basic mirror planes, n1x=1, trivial, making a tiling of the 3d sphere
var n2x, n2y, n3x, n3y, n3z;

// radius of 3d-sphere for sampling 3d mapping
var r3d = 1;

// dihedral groups
//==================================================================

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
            change = true;
        }
    }
}

dihedrals = [null, null, dihedral2, dihedral3, dihedral4, dihedral5];

// mappings in three dimensions
//==========================================================

// normal view of 3d sphere
function normalView3dUpper() {
    const r3d2 = r3d * r3d;
    const r2 = x * x + y * y;
    if (r2 > r3d2) {
        valid = -1;
    } else {
        z = Math.sqrt(r3d2 - r2);
    }
}

// stereographic projection in 3d: Center at z=-r3d
// because spherical maps to z=+r3d
function stereographic3d() {
    const factor = 2 / (1 + (x * x + y * y) / (r3d * r3d));
    x *= factor;
    y *= factor;
    z = r3d * (1 - factor);
}

function inverseStereographic3d() {
    const factor = 1 / (1 + z / r3d);
    x *= factor;
    y *= factor;
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
        change = true;
    }
}

// doing the tiling of the 3d sphere by reflection at three planes
function spherical() {
    do {
        dihedral();
        change = false;
        thirdMirror();
    }
    while (change);
}

// making the geometry
//=========================================================

function twoMirrorMessage(n1, n2, d) {
    return 'mirrors ' + n1 + ' and ' + n2 + ': d<sub>' + d + '</sub>, angle ' + round(180 / d) + '<sup>o</sup>';
}

function threeMirrorMessage(n1, n2, n3, d12, d13, d23) {
    const sum = round(180 / d12 + 180 / d13 + 180 / d23);
    let message = 'mirrors ' + n1 + ', ' + n2 + ' and ' + n3 + ': ';
    message += 'd<sub>' + d12 + '</sub>, d<sub>' + d13 + '</sub> and d<sub>' + d23 + '</sub>';
    message += ', angles ' + round(180 / d12) + '<sup>o</sup>, ' + round(180 / d13) + '<sup>o</sup> and ' + round(180 / d23) + '<sup>o</sup><br>';
    message += '&nbsp; sum of angles ' + sum + '<sup>o</sup>, with ';
    if (sum === 180) {
        message += 'euklidic geometry';
    } else if (sum < 180) {
        message += 'hyperbolic geometry';
    } else {
        message += 'spherical geometry';
    }
    return message;
}

/**
 * setting up the geometry, including rotation
 * @method geometry.setup
 */
geometry.setup = function() {
    var d12;
    let d13 = 3;
    let d23 = 2;
    switch (geometry.basicTriangle) {
        case '3 planes':
            d12 = 2;
            d23 = 2;
            break;
        case 'tetrahedron':
            d12 = 3;
            break;
        case 'octahedron':
            d12 = 4;
            break;
        case 'ikosahedron':
            d12 = 5;
            break;
    }
    let d14 = geometry.d14;
    let d24 = geometry.d24;
    let d34 = geometry.d34;
    geometry.message12.innerHTML = twoMirrorMessage(1, 2, d12);
    geometry.message13.innerHTML = twoMirrorMessage(1, 3, d13);
    geometry.message23.innerHTML = twoMirrorMessage(2, 3, d23);
    geometry.message123.innerHTML = threeMirrorMessage(1, 2, 3, d12, d13, d23);
    geometry.message124.innerHTML = threeMirrorMessage(1, 2, 4, d12, d14, d24);
    geometry.message134.innerHTML = threeMirrorMessage(1, 3, 4, d13, d14, d34);
    geometry.message234.innerHTML = threeMirrorMessage(2, 3, 4, d23, d24, d34);
    // rotate 1-2-3-1 (ordered)
    for (let i = 0; i < geometry.rotation; i++) {
        let h = d12;
        d12 = d23;
        d23 = d13;
        d13 = h;
        h = d14;
        d14 = d24;
        d24 = d34;
        d34 = h;
    }
    const angle12 = pi / d12;
    const angle13 = pi / d13;
    const angle23 = pi / d23;
    console.log('angles', angle12, angle23, angle13);
    //setting up the first three mirror planes
    n2x = -cos(angle12);
    n2y = sin(angle12);
    n3x = -cos(angle13);
    n3y = (-cos(angle23) - n3x * n2x) / n2y;
    n3z = sqrt(1 - n3x * n3x - n3y * n3y);
    console.log(n2x, n2y);
    console.log(n3x, n3y, n3z);
    console.log(d12);
    dihedral = dihedrals[d12];
    console.log(dihedral);

};

// the mapping
//maximum repetitions: map.maxIterations
// coordinates of point, and other data
var x, y, z, w, valid, inversions;
// for terminating
var change = true;

/**
 * the mapping function transforms a point argument
 * (point.x,point.y) coordinates
 * point.iterations: initially 0, number of INVERSIONS
 * point.region: initially 0, number of region for endpoint (if distinct regions)
 * point.valid>0 gives image pixels, point.valid<0 makes transparent pixels
 * @method map.mapping
 * @param {object}point
 */
map.mapping = function(point) {
    // initial data
    x = point.x;
    y = point.y;
    // defaults
    w = 0;
    z = 0;
    valid = 1;
    inversions = 0;
    // mapping
    //   normalView3dUpper();
    z = -z;
    stereographic3d();
    if (valid > 0) {
        spherical();
    }

inverseStereographic3d();
    // final data
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
};