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
geometry.d14=2;
geometry.d24=3;
geometry.d34=5;



// constants
const pi = Math.PI;
const toDeg = 180 / pi;
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const round = Math.round;
const sqrt = Math.sqrt;

// order of dihedral groups and angles
// basic triangle
var d12, d13, d23;
var angle12, angle13, angle23;

// dihedral mapping in the (x,y) plane
var dihedral, dihedrals;

// basic mirror planes, n1x=1, trivial
var n2x, n2y, n3x, n3y, n3z;

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



// making the geometry
//=========================================================

function twoMirrorMessage(n1, n2, d) {
    return 'mirrors ' + n1 + ' and ' + n2 + ': d<sub>' + d + '</sub>, angle ' + round(180 / d) + '<sup>o</sup>';
}

function threeMirrorMessage(n1, n2, n3, d12, d13, d23) {
    const sum = round(180 / d12 + 180 / d13 + 180 / d23);
    let message = 'planes ' + n1 + ', ' + n2 + ' and ' + n3 + ': ';
    message += 'd<sub>' + d12 + '</sub>, d<sub>' + d13 + '</sub> and d<sub>' + d23 + '</sub>';
    message += ', angles ' + round(180 / d12) + '<sup>o</sup>, ' + round(180 / d13) + '<sup>o</sup> and ' + round(180 / d23) + '<sup>o</sup><br>';
    message += '&nbsp; sum of angles ' + sum + '<sup>o</sup>, with ';
    if (sum === 180) {
        message += 'euklidic geometry';
    } else if (sum > 180) {
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
    d23 = 2;
    d13 = 3;
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
    geometry.message12.innerHTML = twoMirrorMessage(1, 2, d12);
    geometry.message13.innerHTML = twoMirrorMessage(1, 3, d13);
    geometry.message23.innerHTML = twoMirrorMessage(2, 3, d23);
    geometry.message123.innerHTML = threeMirrorMessage(1, 2, 3, d12, d13, d23);
    // rotate 1-2-3-1 (ordered)
    let angle12 = pi / d12;
    let angle13 = pi / d13;
    let angle23 = pi / d23;
    for (let i = 0; i < geometry.rotation; i++) {
        let h = angle12;
        angle12 = angle23;
        angle23 = angle13;
        angle13 = h;
    }
    console.log(d12, d13, d23);
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
map.mapping = function(point) {}; // default is identity