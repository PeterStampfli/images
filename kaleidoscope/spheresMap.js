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
geometry.useFourthMirror = true;
// the views
geometry.hyperbolicView = 'spherical cross section from above';
geometry.hyperbolicRadius = 0.7;
geometry.hyperbolicZ = 0;
geometry.euklidicView = 'spherical cross section from above';
geometry.euklidicRadius = 0.7;
geometry.euklidicZ = 0;
geometry.sphericalView = 'hyperplane cross section from above';
geometry.euklidicW = 0;
geometry.euklidicZ = 0;

// constants
const pi = Math.PI;
const toDeg = 180 / pi;
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

// dihedral mapping in the (x,y) plane
var dihedral, dihedrals;

// basic mirror planes, n1x=1, trivial, making a tiling of the 3d sphere
var n2x, n2y, n3x, n3y, n3z;

// radius of 3d-sphere for sampling 3d mapping, going from 0 to worldRadius
var r3d = 1;
// radius of 4d sphere for spherical case, use 3d worldradius for consistency
var r4d = 1;
// reference value for w-coordinate, for cross-sections of the 4d sphere
// in units of r4d, going from -1 to +1
var wRef = 0;
// same, for 3d
var zRef = 1;

// the fourth mirror
// as a sphere of radius 1
var c4x, c4y, c4z;
// as a plane in 4dimensions, normal vector
var n4x, n4y, n4z, n4w;
// or in 3 dimensions with n4w=0 and going through (0,0,n4h)
var n4h = 0.2;
// radius of the hyperbolic world, or radius of the 4d sphere, 1 for Euklidic
// use as unit of length
var worldRadius;


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

// the fourth element, in 3d, for euklidic case as plane
function fourthMirrorPlaneEuklidic() {
    z -= n4h;
    let d = n4x * x + n4y * y + n4z * z;
    if (d < 0) {
        d += d;
        x -= d * n3x;
        y -= d * n3y;
        z -= d * n3z;
        inversions += 1;
        change = true;
    }
    z += n4h;
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

// fourth element as sphere, inversion outside->in, for spherical case
function fourthMirrorSphereOutsideIn() {
    const dx = x - c4x;
    const dy = y - c4y;
    const dz = z - c4z;
    let d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > 1) {
        d2 = 1 / d2;
        x = c4x + dx * d2;
        y = c4y + dy * d2;
        z = c4z + dz * d2;
        inversions += 1;
        change = true;
    }
}

// mappings in four dimensions, for spherical tiling
//=============================================
// we don't need stereographic projection from 4d to 3d
// because we can use sphere inversion in 3d instead of the plane mirror in 4d

// mirror images at the fourth plane, part of the 4d spherical tiling
function fourthMirror() {
    let d = n4x * x + n4y * y + n4z * z + n4w * w;
    if (d < 0) {
        d += d;
        x -= d * n4x;
        y -= d * n4y;
        z -= d * n4z;
        w -= d * n4w;
        inversions += 1;
        change = true;
    }
}

// normal view of 3d sphere, resulting from intersecting the 4d sphere with w=wRef
function normalView4dUpper() {
    w = wRef;
    const r3d2 = r4d * r4d - w * w;
    const r2 = x * x + y * y;
    if (r2 > r3d2) {
        valid = -1;
    } else {
        z = Math.sqrt(r3d2 - r2);
    }
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
    message += '&nbsp; sum of angles ' + sum + '<sup>o</sup>, ';
    if (sum === 180) {
        message += 'euklidic';
    } else if (sum < 180) {
        message += 'hyperbolic';
    } else {
        message += 'spherical';
    }
    message += ' triangle';
    return message;
}

/**
 * setting up the geometry, including rotation
 * @method geometry.setup
 */
geometry.setup = function() {
    let d12 = 5;
    let d13 = 3;
    let d23 = 2;
    switch (geometry.basicTriangle) {
        case 'orthogonal planes':
            d12 = 2;
            d13 = 2;
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
    let basisMessage = twoMirrorMessage(1, 2, d12) + '<br>';
    basisMessage += twoMirrorMessage(1, 2, d12) + '<br>';
    basisMessage += twoMirrorMessage(2, 3, d23) + '<br>';
    basisMessage += threeMirrorMessage(1, 2, 3, d12, d13, d23);
    geometry.basisMessage.innerHTML = basisMessage;
    let fourthMessage = threeMirrorMessage(1, 2, 4, d12, d14, d24) + '<br>';
    fourthMessage += threeMirrorMessage(1, 3, 4, d13, d14, d34) + '<br>';
    fourthMessage += threeMirrorMessage(2, 3, 4, d23, d24, d34);
    geometry.fourthMessage.innerHTML = fourthMessage;
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
    dihedral = dihedrals[d12];
    // the fourth dimension
    let honeycomb = ((1 / d12 + 1 / d14 + 1 / d24) < 0.99);
    honeycomb = honeycomb || ((1 / d13 + 1 / d14 + 1 / d34) < 0.99);
    honeycomb = honeycomb || ((1 / d23 + 1 / d24 + 1 / d34) < 0.99);
    const angle14 = pi / d14;
    const angle24 = pi / d24;
    const angle34 = pi / d34;
    // as sphere of radius 1, at c4=(c4x,c4y,c4z)
    // distance to plane 1: c4*n1=cos(angle14)
    c4x = cos(angle14);
    // distance to plane 2: c4*n2=cos(angle24)
    c4y = (cos(angle24) - c4x * n2x) / n2y;
    // distance to plane 3: c4*n3=cos(angle34)
    c4z = (cos(angle34) - c4x * n3x - c4y * n3y) / n3z;
    console.log('spherecenter', c4x, c4y, c4z);
    // distance of sphere center to origin
    const dis2 = c4x * c4x + c4y * c4y + c4z * c4z;
    console.log('center distance square', dis2);
    worldRadius = sqrt(abs(dis2 - 1));
    // consistency with 3 d calculations
    r4d = worldRadius;
    // for spherical geometry: fourth mirror as a 4d plane
    // for Euklidic geometry: fourth mirror as a 3d plane
    // n4=(n4x,n4y,n4z,n4w)
    // intersection angle of planes: n4*ni=-cos(angle1i)
    n4x = -c4x;
    n4y = -c4y;
    n4z = -c4z;
    // normalize, for spherical geometry
    n4w = worldRadius;
    // Euklidic geometry: n4w=0; fourth plane passes through (0,0,n4h)
    // doing the different geometries
    geometry.hideChoices();
    let message = '';
    if (Math.abs(dis2 - 1) < 0.05) {
        message = 'Euklidic';
        worldRadius = 1;
        geometry.euklidicViewController.show();
        switch (geometry.euklidicView) {
            case 'spherical cross section from above':
                geometry.euklidicRadiusController.show();
                break;
            case 'spherical cross section from below':
                geometry.euklidicRadiusController.show();
                break;
            case 'spherical cross section, stereographic':
                geometry.euklidicRadiusController.show();
                break;
            case 'plane cross section':
                geometry.euklidicZController.show();
        }
    } else if (dis2 < 1) {
        message = 'Spherical';
        geometry.sphericalViewController.show();
        switch (geometry.sphericalView) {
            case 'hyperplane cross section from above':
                geometry.sphericalWController.show();
                break;
            case 'hyperplane cross section from below':
                geometry.sphericalWController.show();
                break;
            case 'hyperplane cross section, stereographic':
                geometry.sphericalWController.show();
                break;
            case 'plane cross section of stereographic projection':
                geometry.sphericalZController.show();
        }
    } else {
        message = honeycomb ? 'Hyperbolic honeycomb' : 'Hyperbolic tiling';
        geometry.hyperbolicViewController.show();
        switch (geometry.hyperbolicView) {
            case 'spherical cross section from above':
                geometry.hyperbolicRadiusController.show();
                break;
            case 'spherical cross section from below':
                geometry.hyperbolicRadiusController.show();
                break;
            case 'spherical cross section, stereographic':
                geometry.hyperbolicRadiusController.show();
                break;
            case 'plane cross section':
                geometry.hyperbolicZController.show();
        }
    }
    geometry.worldMessage.innerHTML = '<strong>' + message + '</strong>';

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
    // r3d=1;
    // console.log(r3d,unit);
    r3d = worldRadius;
    x = point.x * worldRadius;
    y = point.y * worldRadius;
    // defaults
    w = 0;
    z = 0;
    valid = 1;
    inversions = 0;
    // mapping
    normalView3dUpper();
    z = -z;
    //   stereographic3d();
    if (valid > 0) {
        spherical();
    }

    //    inverseStereographic3d();
    // final data
    point.x = x;
    point.y = y;
    point.iterations = inversions;
    point.valid = valid;
};