/* jshint esversion: 6 */

import {
    map,
    log,
    output,
    ColorInput,
    Pixels,
    guiUtils
} from "../libgui/modules.js";

/**
 * @namespace geometry
 */
export const geometry = {};
rHyperbolic = 0.8506319050477755;
geometry.rHyperbolic = rHyperbolic;

geometry.r = rHyperbolic;
geometry.offset = 0;
geometry.flipZ = false;
geometry.view = 'normal';
geometry.nDihedral = 100;
geometry.mirror5 = false;
geometry.surfaceWidth = 0.01;

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

const ikoCornersX = [];
const ikoCornersY = [];
const ikoCornersZ = [];

function newIkoCorner(x, y, z) {
    ikoCornersX.push(x);
    ikoCornersY.push(y);
    ikoCornersZ.push(z);
}

const zIko = 0.4473;
const rIko = 0.8944;
newIkoCorner(0, 0, 1);

for (let i = 1; i < 6; i++) {
    newIkoCorner(rIko * cos(2 * pi / 5 * (i - 1)), rIko * sin(2 * pi / 5 * (i - 1)), zIko);
}

for (let i = 6; i < 11; i++) {
    newIkoCorner(rIko * cos(2 * pi / 5 * (i - 5.5)), rIko * sin(2 * pi / 5 * (i - 5.5)), -zIko);
}
newIkoCorner(0, 0, -1);

const dodeCornersX = [];
const dodeCornersY = [];
const dodeCornersZ = [];

function newDodeCorner(i, j, k) {
    dodeCornersX.push((ikoCornersX[i] + ikoCornersX[j] + ikoCornersX[k]) / 3);
    dodeCornersY.push((ikoCornersY[i] + ikoCornersY[j] + ikoCornersY[k]) / 3);
    dodeCornersZ.push((ikoCornersZ[i] + ikoCornersZ[j] + ikoCornersZ[k]) / 3);
}

newDodeCorner(0, 1, 5);
for (let i = 1; i < 5; i++) {
    newDodeCorner(0, i, i + 1);
}

newDodeCorner(1, 5, 10);
for (let i = 1; i < 5; i++) {
    newDodeCorner(i, i + 1, 5 + i);
}
newDodeCorner(1, 6, 10);
for (let i = 1; i < 5; i++) {
    newDodeCorner(i + 1, i + 5, i + 6);
}

newDodeCorner(11, 6, 10);
for (let i = 1; i < 5; i++) {
    newDodeCorner(11, i + 5, i + 6);
}

function ikoDistance2(i, x, y, z) {
    x -= ikoCornersX[i];
    y -= ikoCornersY[i];
    z -= ikoCornersZ[i];
    return x * x + y * y + z * z;
}

function dodeDistance2(i, x, y, z) {
    x -= dodeCornersX[i];
    y -= dodeCornersY[i];
    z -= dodeCornersZ[i];
    return x * x + y * y + z * z;
}

/**
 * determine circle radius for given distance betwween centers
 * radius of other circle and order of dihedral group
 * @method circleRadius
 * @param {float} distance
 * @param {float} otherRadius - negative sign if spheres of opposite mapping sense (inside-out to outside-in)
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
    const sphereDistance = Math.sqrt(ikoDistance2(0, ikoCornersX[1], ikoCornersY[1], ikoCornersZ[1]));
    const d2 = ikoDistance2(0, 0, 0, 0);
    rSphere = 0.5 * sphereDistance / cos(0.5 * diAngle);
    rSphere2 = rSphere * rSphere;
    rHyperbolic2 = d2 - rSphere2;
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
    z += geometry.offset;
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

var rSphere, rSphere2, rInner, rInner2, rOuter, rOuter2;

function spheres() {
    // iko corners at (0,0,+-1)
    // two layers of equal z
    if (z > 0) {
        let dz = z - 1;
        const d2 = dz * dz + x * x + y * y;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = factor * x;
            y = factor * y;
            z = factor * dz + 1;
            inversions += 1;
            change = true;
            return;
        }

        let cz = ikoCornersZ[1];
        dz = z - cz;
        let dz2 = dz * dz;
        if (dz2 < rSphere2) {
            for (let i = 1; i < 6; i++) {
                const cx = ikoCornersX[i];
                const cy = ikoCornersY[i];
                const dx = x - cx;
                const dy = y - cy;
                const d2 = dz2 + dx * dx + dy * dy;
                if (d2 < rSphere2) {
                    const factor = rSphere2 / d2;
                    x = cx + factor * dx;
                    y = cy + factor * dy;
                    z = cz + factor * dz;
                    inversions += 1;
                    change = true;
                    return;
                }
            }
        }
        cz = ikoCornersZ[6];
        dz = z - cz;
        dz2 = dz * dz;
        if (dz2 < rSphere2) {
            for (let i = 6; i < 11; i++) {
                const cx = ikoCornersX[i];
                const cy = ikoCornersY[i];
                const dx = x - cx;
                const dy = y - cy;
                const d2 = dz2 + dx * dx + dy * dy;
                if (d2 < rSphere2) {
                    const factor = rSphere2 / d2;
                    x = cx + factor * dx;
                    y = cy + factor * dy;
                    z = cz + factor * dz;
                    inversions += 1;
                    change = true;
                    return;
                }
            }
        }
    } else {
        let dz = z + 1;
        const d2 = dz * dz + x * x + y * y;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = factor * x;
            y = factor * y;
            z = factor * dz - 1;
            inversions += 1;
            change = true;
            return;
        }
        let cz = ikoCornersZ[6];
        dz = z - cz;
        let dz2 = dz * dz;
        if (dz2 < rSphere2) {
            for (let i = 6; i < 11; i++) {
                const cx = ikoCornersX[i];
                const cy = ikoCornersY[i];
                const dx = x - cx;
                const dy = y - cy;
                const d2 = dz2 + dx * dx + dy * dy;
                if (d2 < rSphere2) {
                    const factor = rSphere2 / d2;
                    x = cx + factor * dx;
                    y = cy + factor * dy;
                    z = cz + factor * dz;
                    inversions += 1;
                    change = true;
                    return;
                }
            }
        }
        cz = ikoCornersZ[1];
        dz = z - cz;
        dz2 = dz * dz;
        if (dz2 < rSphere2) {
            for (let i = 1; i < 6; i++) {
                const cx = ikoCornersX[i];
                const cy = ikoCornersY[i];
                const dx = x - cx;
                const dy = y - cy;
                const d2 = dz2 + dx * dx + dy * dy;
                if (d2 < rSphere2) {
                    const factor = rSphere2 / d2;
                    x = cx + factor * dx;
                    y = cy + factor * dy;
                    z = cz + factor * dz;
                    inversions += 1;
                    change = true;
                    return;
                }
            }
        }
    }
}

//const regionOfSide = [0, 1, 0, 2, 1, 2, 2, 1, 0, 0, 0, 0, 2, 2, 1, 2, 1, 0, 1, 0];
const regionOfSide = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 9, 5, 6, 7, 3, 4, 0, 1, 2];

// sides===dodecagon corners
function findRegion() {
    region = 0;
    var mind2 = 1e10;
    var side = 0;
    if (z > 0) {
        for (let i = 0; i < 20; i += 5) {
            const cz = dodeCornersZ[i];
            let dz2 = z - cz;
            dz2 *= dz2;
            if (dz2 < mind2) {
                for (let j = i; j < i + 5; j++) {
                    let dx = x - dodeCornersX[j];
                    let dy = y - dodeCornersY[j];
                    let d2 = dz2 + dx * dx + dy * dy;
                    if (d2 < mind2) {
                        mind2 = d2;
                        side = j;
                    }
                }
            }
        }
    } else {
        for (let i = 15; i >= 0; i -= 5) {
            const cz = dodeCornersZ[i];
            let dz2 = z - cz;
            dz2 *= dz2;
            if (dz2 < mind2) {
                for (let j = i; j < i + 5; j++) {
                    let dx = x - dodeCornersX[j];
                    let dy = y - dodeCornersY[j];
                    let d2 = dz2 + dx * dx + dy * dy;
                    if (d2 < mind2) {
                        mind2 = d2;
                        side = j;
                    }
                }
            }
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


// showing the surface width
geometry.drawSpheresSurface = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    map.drawingInputImage = false;
    map.allImageControllersHide();
    map.borderColorController.show();
    map.surfaceWidthController.show();
    const bordercolor = {};
    ColorInput.setObject(bordercolor, map.borderColor);
    const borderColorInt = Pixels.integerOfColor(bordercolor);
    const pixelsArray = output.pixels.array;
    const rSpherePlus2 = (rSphere + geometry.surfaceWidth) * (rSphere + geometry.surfaceWidth);
    const rSphereMinus2 = (rSphere - geometry.surfaceWidth) * (rSphere - geometry.surfaceWidth);
    const rInnerPlus2 = (rInner + geometry.surfaceWidth) * (rInner + geometry.surfaceWidth);
    const rInnerMinus2 = (rInner - geometry.surfaceWidth) * (rInner - geometry.surfaceWidth);
    const rOuterPlus2 = (rOuter + geometry.surfaceWidth) * (rOuter + geometry.surfaceWidth);
    const rOuterMinus2 = (rOuter - geometry.surfaceWidth) * (rOuter - geometry.surfaceWidth);
    let scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    const centersLength = ikoCornersX.length;
    let index = 0;
    let offset = 0;
    switch (output.pixels.antialiasType) {
        case 'none':
            break;
        case '2*2 subpixels':
            offset = -2 * scale;
            break;
        case '3*3 subpixels':
            offset = -2.5 * scale;
            break;
    }
    shiftY += offset;
    shiftX += offset;
    let yBase = shiftY;
    for (var j = 0; j < map.height; j++) {
        let xBase = shiftX;
        for (var i = 0; i < map.width; i++) {
            x = xBase;
            y = yBase;
            valid = 1;
            let color = 0;
            view();
            if (valid > 0) {
                for (let k = 0; k < centersLength; k++) {
                    const dx = x - ikoCornersX[k];
                    const dy = y - ikoCornersY[k];
                    const dz = z - ikoCornersZ[k];
                    const d2 = dx * dx + dy * dy + dz * dz;
                    if ((d2 > rSphereMinus2) && (d2 < rSpherePlus2)) {
                        color = borderColorInt;
                        break;
                    }
                }
            }
            pixelsArray[index] = color;
            index += 1;
            xBase += scale;
        }
        yBase += scale;
    }
    output.pixels.show();
};