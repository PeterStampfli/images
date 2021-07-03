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
rHyperbolic = Math.sqrt(2);
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

const rt32 = Math.sqrt(3) / 2;
const rt05 = Math.sqrt(0.5);
const rt03 = Math.sqrt(1 / 3);
const rt06 = Math.sqrt(1 / 6);

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
    const disBetweenSpheres = Math.sqrt(2);
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
    rHyperbolic2 = 3 - rSphere2;
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
const centersX = [1, -1, 1, -1, 1, -1, 1, -1,1,-1,0,0,0,0];
const centersY = [1, 1, -1, -1, 1, 1, -1, -1,0,0,1,-1,0,0];
const centersZ = [1, 1, 1, 1, -1, -1, -1, -1,0,0,0,0,1,-1];

function cubeSphere() {
    const cx = (x > 0) ? 1 : -1;
    const cy = (y > 0) ? 1 : -1;
    const cz = (z > 0) ? 1 : -1;
    const dx = x - cx;
    const dy = y - cy;
    const dz = z - cz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (rSphere2 > d2) {
        const factor = rSphere2 / d2;
        x = cx + factor * dx;
        y = cy + factor * dy;
        z = cz + factor * dz;
        inversions += 1;
        change = true;
    }
}


// sphere at (0,0,+-1)
function oct1() {
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
        }
    } else {
        const dz = z + 1;
        const d2 = dz * dz + x * x + y * y;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
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
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x *= factor;
            y = 1 + factor * dy;
            z *= factor;
            inversions += 1;
            change = true;
        }
    } else {
        const dy = y + 1;
        const d2 = z * z + x * x + dy * dy;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
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
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = 1 + factor * dx;
            y *= factor;
            z *= factor;
            inversions += 1;
            change = true;
        }
    } else {
        const dx = x + 1;
        const d2 = z * z + dx * dx + y * y;
        if (d2 < rSphere2) {
            const factor = rSphere2 / d2;
            x = -1 + factor * dx;
            y *= factor;
            z *= factor;
            inversions += 1;
            change = true;
        }
    }
}


function findRegion() {
    region = 0;
    const ax = Math.abs(x);
    const ay = Math.abs(y);
    const az = Math.abs(z);
    if (ax > ay) {
        if (ax > az) {
            region = 1; // ax> max(ay,az)
        } else {
            region = 3; // az>ax>ay
        }
    } else {
        if (az > ay) {
            region = 3; // az>ay>ax
        } else {
            region = 2; // ay>max(az,ax)
        }
    }
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
            cubeSphere();
            oct1();
            oct2();
            oct3();

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
    let scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    const centersLength = centersX.length;
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
                    const dx = x - centersX[k];
                    const dy = y - centersY[k];
                    const dz = z - centersZ[k];
                    const d2 = dx * dx + dy * dy + dz * dz;
                    if ((d2 > rSphereMinus2) && (d2 < rSpherePlus2)) {
                        color = borderColorInt;
                        break;
                    }
                }
                if (geometry.mirror5) {
                    const d2 = x * x + y * y + z * z;
                    if ((d2 > rInnerMinus2) && (d2 < rInnerPlus2)) {
                        color = borderColorInt;
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