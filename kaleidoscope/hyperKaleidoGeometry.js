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
geometry.useFourthMirror = true;
geometry.d14 = 2;
geometry.d24 = 3;
geometry.d34 = 5;
geometry.useFifthMirror = true;
geometry.d15 = 3;
geometry.d25 = 3;
geometry.d35 = 3;
geometry.d45 = 3;

geometry.view = 'normalized sphere';
// radius relative to the hyperbolic radius
geometry.radius = 0.9;

// rotation angles
geometry.alpha = 0;
geometry.beta = 0;
geometry.gamma = 0;

// Euler angles -> transform
var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;

// mirror planes, n1x=1, trivial
var n2x, n2y, n3x, n3y, n3z;
// radius of the sphere
var rSphere, rSphere2, worldRadius;

// the fourth mirror as a sphere of radius 1
var c4x, c4y, c4z;
// the fifth mirror as a sphere of radius r5
var r5, r5sq, c5x, c5y, c5z;

// for euklidean geometry we have to do n initial inversion
var initialInversion = false;

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
 * solve quadratic equation ax**2+bx+c=0
 * only for real solutions
 * solutions are in Fast.xLow and Fast.xHigh
 * @method quadraticEquation
 * @param {float} a - has to be diffferent from zero, check before !!!
 * @param {float} b
 * @param {float} c
 * @param {Vector2} data - x and y fields are the lower and higher solutions, data.x < data.y
 * @return {boolean} true if there are real solutions
 */
function quadraticEquation(a, b, c) {
    const rootArg = b * b - 4 * a * c;
    if (rootArg < 0) {
        data.x = 0;
        data.y = 0;
        return false;
    }
    if (b > 0) {
        data.x = 0.5 * (-b - Math.sqrt(rootArg)) / a;
        data.y = c / a / data.x;
    } else {
        data.y = 0.5 * (-b + Math.sqrt(rootArg)) / a;
        data.x = c / a / data.y;
    }
    //   console.log(a * data.x * data.x + b * data.x + c);
    //   console.log(a * data.y * data.y + b * data.y + c);
    return true;
}

const data = {};
// view transforms (x,y) ->(x,y,z), sets valid=-1 if fails
var view;

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
    // the views
    switch (geometry.view){
        case 'sphere':
            console.log('sphere');
            view = normalView;
            break;
        case 'normalized sphere':
            console.log('norm sphere');
            view = function() {
                x *= geometry.radius;
                y *= geometry.radius;
                normalView();
            };
            break;
        case 'sphere stereographic':
            console.log('sphere ster');
            view = function() {
                x *= geometry.radius;
                y *= geometry.radius;
                stereographic();
            };
            break;
        case 'plane':
            console.log('plane');
            view = function() {
                z = rSphere;
            };
            break;
        case 'inverted plane':
            console.log('plane inv');
            view = function() {
                z = rSphere;
                const factor = 1 / (x * x + y * y);
                y *= factor;
                x *= factor;
            };
            break;
    }
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
        initialInversion = (geometryType === 'euklidic');
        map.mapping = fourMirrors;
    } else {
        log('<strong>using five mirrors:</strong>');
        const d15 = geometry.d15;
        const d25 = geometry.d25;
        const d35 = geometry.d35;
        const d45 = geometry.d45;
        const angle45 = pi / d45;
        tetrahedron(1, 2, 3, 4, d12, d13, d14, d23, d24, d34);
        tetrahedron(1, 2, 3, 5, d12, d13, d15, d23, d25, d35);
        c5x = c4x;
        c5y = c4y;
        c5z = c4z;
        tetrahedron(1, 2, 4, 5, d12, d14, d15, d24, d25, d45);
        tetrahedron(1, 3, 4, 5, d13, d14, d15, d34, d35, d45);
        tetrahedron(2, 3, 4, 5, d23, d24, d25, d34, d35, d45);
        tetrahedronCalc(d12, d13, d14, d23, d24, d34);
        initialInversion = (geometryType === 'euklidic');
        const c5sq = c5x * c5x + c5y * c5y + c5z * c5z;
        const c4sq = c4x * c4x + c4y * c4y + c4z * c4z;
        const c4c5 = c4x * c5x + c4y * c5y + c4z * c5z;
        const a = c5sq - 1;
        const b = -2 * (c4c5 + cos(angle45));
        const c = c4sq - 1;
        if (abs(c) < 0.05) {
            // euklidic base
            if (abs(a) < 0.05) {
                log('double euklidic, no solution');
                r5 = 0;
            } else {
                r5 = -c / b;
            }
        } else if (c > 0) {
            // hyperbolic base
            if (abs(a) < 0.05) {
                r5 = -c / b;
            } else {
                quadraticEquation(a, b, c);
                r5 = data.x; // take the smaller solution
            }
        } else {
            // spherical base
            if (abs(a) < 0.05) {
                r5 = -c / b;
            } else {
                quadraticEquation(a, b, c);
                r5 = data.y; // take the larger solution
            }
        }
        // update fifth mirror (center of sphere)
        c5x *= r5;
        c5y *= r5;
        c5z *= r5;
        r5sq = r5 * r5;
        map.mapping = fiveMirrors;
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
var change3 = true;

// normal view of 3d sphere
function normalView() {
    const r2 = x * x + y * y;
    if (r2 > rSphere2) {
        valid = -1;
    } else {
        z = Math.sqrt(rSphere2 - r2);
    }
}

// stereographic projection in 3d:
// plane to  unit sphere
// center at z=-r3d because spherical maps to z=+r3d
function stereographic() {
    const factor = 2 / (1 + (x * x + y * y) / rSphere2);
    x *= factor;
    y *= factor;
    z = rSphere * (1 - factor);
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
        change3 = true;
    } else {
        change3 = false;
    }
}

// fourth element as sphere, inversion inside->out
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

// fifth element as sphere, inversion inside->out
function fifthMirrorSphereInsideOut() {
    const dx = x - c5x;
    const dy = y - c5y;
    const dz = z - c5z;
    let d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < r5sq) {
        d2 = r5sq / d2;
        x = c5x + dx * d2;
        y = c5y + dy * d2;
        z = c5z + dz * d2;
        inversions += 1;
        change = true;
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
    view();
    if (valid > 0) {
        euler();
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

function fourMirrors(point) {
    // initial data, position in uunits of worldradius (hyperbolic or spherical)
    x = point.x * worldRadius;
    y = point.y * worldRadius;
    if (geometry.constantRadius) {
        x *= geometry.radius;
        y *= geometry.radius;
    }
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    view();
    if (valid > 0) {
        euler();
        if (initialInversion) {
            // euklidean case
            const ir2 = 1 / (x * x + y * y + z * z);
            x *= ir2;
            y *= ir2;
            z *= ir2;
        }
        let i = 0;
        do {
            spherical();
            change = false;
            fourthMirrorSphereInsideOut();
            i += 1;
        } while (change && (i < maxIterations));
        if (change) {
            valid = -1;
        } else {
            normalize();
            inverseStereographic3dUnit();
        }
    }
    // final data
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
}

function fiveMirrors(point) {
    // initial data, position in uunits of worldradius (hyperbolic or spherical)
    x = point.x * worldRadius;
    y = point.y * worldRadius;
    valid = 1;
    inversions = 0;
    const maxIterations = map.maxIterations;
    view();
    if (valid > 0) {
        euler();
        if (initialInversion) {
            // for euklidean case, inverting sphere (mirror 4) passes through origin
            const ir2 = 1 / (x * x + y * y);
            x *= ir2;
            y *= ir2;
        }
        let i = 0;
        do {
            spherical();
            change = false;
            fourthMirrorSphereInsideOut();
            if (change) {
                spherical();
            }
            fifthMirrorSphereInsideOut();
            i += 1;
        } while (change && (i < maxIterations));
        if (change) {
            valid = -1;
        } else {
            normalize();
            inverseStereographic3dUnit();
        }
    }
    // final data
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
}