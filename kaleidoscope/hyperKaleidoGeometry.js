/* jshint esversion: 6 */

import {
    map,
    log
} from "../libgui/modules.js";

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
geometry.useFourthMirror = false;
geometry.d14 = 2;
geometry.d24 = 3;
geometry.d34 = 5;
geometry.useFifthMirror = false;
geometry.d15 = 3;
geometry.d25 = 3;
geometry.d35 = 3;
geometry.d45 = 3;

// rotation angles
geometry.alpha = 0;
geometry.beta = 0;
geometry.gamma = 0;

// radius relative to the hyperbolic radius
geometry.radius = 0.9;

// Euler angles -> transform
var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;

// mirror planes, n1x=1, trivial
var n2x, n2y, n3x, n3y, n3z;
// radius of the sphere
var rSphere, rSphere2, worldRadius;

// the fourth mirror as a sphere of radius 1
var c4x, c4y, c4z;

// first map xy to sphere with normal projection
// rotate in xy plane
// rotate in xz plane
// repeat mirrors
// normalize vector plus stereographic map to xy plane
// or normal projection (to xy? plane)

// message for a vertex of three mirrors
// and adding up different types
var nMaterialVertices, nIdealVertices, nHyperIdealVertices;
var geometryType;

function triangle(n1, n2, n3, d12, d13, d23) {
    const sum = round(180 / d12 + 180 / d13 + 180 / d23);
    let message = 'mirrors ' + n1 + ', ' + n2 + ' and ' + n3 + ': ';
    message += 'd<sub>' + d12 + '</sub>, d<sub>' + d13 + '</sub> and d<sub>' + d23 + '</sub>, ';
    if (sum === 180) {
        message += 'euklidic';
        nIdealVertices += 1;
    } else if (sum < 180) {
        message += 'hyperbolic';
        nHyperIdealVertices += 1;
    } else {
        message += 'spherical';
        nMaterialVertices += 1;
    }
    log(message);
}

function tetrahedronCalc(d12, d13, d14, d23, d24, d34) {
    const angle12 = pi / d12;
    const angle13 = pi / d13;
    const angle23 = pi / d23;
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
    // n3=(n3x,n3y,n3z)
    // intersection angle of planes: n3*n1=-cos(angle13)
    n3x = -cos(angle13);
    // intersection angle of planes: n3*n2=-cos(angle23)
    n3y = (-cos(angle23) - n3x * n2x) / n2y;
    // normalize
    n3z = sqrt(1 - n3x * n3x - n3y * n3y);
    // forth mirror as sphere of radius 1, at c4=(c4x,c4y,c4z)
    // distance to plane 1: c4*n1=cos(angle14)
    c4x = cos(angle14);
    // distance to plane 2: c4*n2=cos(angle24)
    c4y = (cos(angle24) - c4x * n2x) / n2y;
    // distance to plane 3: c4*n3=cos(angle34)
    c4z = (cos(angle34) - c4x * n3x - c4y * n3y) / n3z;
    // distance of sphere center to origin
    const dis2 = c4x * c4x + c4y * c4y + c4z * c4z;
    worldRadius = sqrt(abs(dis2 - 1));
    if (Math.abs(dis2 - 1) < 0.05) {
        worldRadius = 1;
        geometryType = 'euklidic';
    } else if (dis2 < 1) {
        geometryType = 'spherical';
    } else {
        geometryType = 'hyperbolic';
    }
}

function tetrahedron(i1, i2, i3, i4, d12, d13, d14, d23, d24, d34) {
    nIdealVertices = 0;
    nMaterialVertices = 0;
    nHyperIdealVertices = 0;
    log('<strong>tetrahedron of planes ' + i1 + ', ' + i2 + ', ' + i3 + ' and ' + i4 + '</strong>');
    triangle(i1, i2, i3, d12, d13, d23);
    triangle(i1, i2, i4, d12, d14, d24);
    triangle(i1, i3, i4, d13, d14, d34);
    triangle(i2, i3, i4, d23, d24, d34);
    tetrahedronCalc(d12, d13, d14, d23, d24, d34);
    log(geometryType + ' geometry with worldradius ' + worldRadius.toPrecision(3));
    if (nMaterialVertices === 1) {
        log('1 material vertex');
    }
    if (nMaterialVertices > 1) {
        log(nMaterialVertices + ' material vertices');
    }
    if (nIdealVertices === 1) {
        log('1 ideal vertex');
    }
    if (nIdealVertices > 1) {
        log(nIdealVertices + ' ideal vertices');
    }
    if (nHyperIdealVertices === 1) {
        log('1 hyperideal vertex');
    }
    if (nHyperIdealVertices > 1) {
        log(nHyperIdealVertices + ' hyperideal vertices');
    }
}

/**
 * setting up the geometry, including rotation
 * @method geometry.setup
 */
geometry.setup = function() {
    log();
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
    // data for basic three mirrors
    const d12 = geometry.d12;
    const d13 = geometry.d13;
    const d23 = geometry.d23;
    dihedral = dihedrals[d12];
    const angle12 = pi / d12;
    const angle13 = pi / d13;
    const angle23 = pi / d23;
    // data for the fourth mirror
    const d14 = geometry.d14;
    const d24 = geometry.d24;
    const d34 = geometry.d34;
    const angle14 = pi / d14;
    const angle24 = pi / d24;
    const angle34 = pi / d34;
    if (!geometry.useFourthMirror) {
        log('<strong>three basic mirrors only:</strong>');
        nIdealVertices = 0;
        nMaterialVertices = 0;
        nHyperIdealVertices = 0;
        triangle(1, 2, 3, d12, d13, d23);
        tetrahedronCalc(d12, d13, d14, d23, d24, d34);
        worldRadius = 1;
        map.mapping = threeMirrors;
    } else if (!geometry.useFifthMirror) {
        log('<strong>using four mirrors:</strong>');
        tetrahedron(1, 2, 3, 4, d12, d13, d14, d23, d24, d34);

    } else {
        log('<strong>using five mirrors:</strong>');

    }
    rSphere = geometry.radius * worldRadius;
    rSphere2 = rSphere * rSphere;
};

// the mapping
//maximum repetitions: map.maxIterations
// coordinates of point, and other data
var x, y, z, valid, inversions;
// for terminating
var change = true;

// normal view of 3d sphere
function normalView() {
    const r2 = x * x + y * y;
    if (r2 > rSphere2) {
        valid = -1;
    } else {
        z = Math.sqrt(rSphere2 - r2);
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

// normalize a 3d vector
function normalize() {
    const r2 = x * x + y * y + z * z;
    if (r2 > eps2) {
        const factor = 1 / Math.sqrt(r2);
        x *= factor;
        y *= factor;
        z *= factor;
    }
}

// stereographic projection in 3d:
// unit sphere to plane
// center at z=-1 because spherical maps to z=+r3d
function inverseStereographic3dUnit() {
    const factor = 1 / (1 + z);
    x *= factor;
    y *= factor;
    z = 0;
}

// dihedral mapping in the (x,y) plane
var dihedral, dihedrals;

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

dihedrals = [null, null, dihedral2, dihedral3, dihedral4, dihedral5];


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
        change = true;
    }
}

// fourth element as sphere, inversion inside->out, for hyperbolic case
function fourthMirrorSphereInsideOut() {
    const dx = x - c4x;
    const dy = y - c4y;
    const dz = z - c4z;
    let d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < 1) {
        d2 = 1 / d2;
        x = c4x + dx * d2;
        y = c4y + dy * d2;
        z = c4z + dz * d2;
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


/**
 * the mapping function transforms a point argument
 * (point.x,point.y) coordinates
 * point.iterations: initially 0, number of INVERSIONS
 * point.region: initially 0, number of region for endpoint (if distinct regions)
 * point.valid>0 gives image pixels, point.valid<0 makes transparent pixels
 * @method map.mapping
 * @param {object}point
 */

function threeMirrors(point) {
    // initial data, position in uunits of worldradius (hyperbolic or spherical)
    x = point.x * worldRadius;
    y = point.y * worldRadius;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;

    normalView();
    euler();
    if (valid > 0) {
        spherical();
        normalize();
        inverseStereographic3dUnit();
    }

    // final data
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
}