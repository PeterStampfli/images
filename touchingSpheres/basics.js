/* jshint esversion: 6 */
import {
    output,
    Pixels,
    ColorInput
} from "../libgui/modules.js";

// how it is done
//===============================

// basic drawing, transform and array manipulation

export const basics = {};

// drawing spheres
//=================================

const colorObject = {};
const lightness = 0.75;
const darkness = 0.5;

basics.alphaBubble = 200;
basics.alphaBubbleBack = 100;
basics.alphaBubbleFront = 50;

basics.drawDisc = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fill();
};

basics.drawCircle = function(x, y, radius, color = '#000000') {
    const canvasContext = output.canvasContext;
    canvasContext.beginPath();
    canvasContext.arc(x, y, Math.abs(radius), 0, 2 * Math.PI);
    output.canvasContext.strokeStyle = color;
    canvasContext.stroke();
    output.canvasContext.strokeStyle = '#000000';
};

basics.drawDiscCircle = function(x, y, radius, colorDisc) {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = colorDisc;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.stroke();
};

basics.drawSphere = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.red = Math.floor(colorObject.red * (1 - lightness) + 255.9 * lightness);
    colorObject.green = Math.floor(colorObject.green * (1 - lightness) + 255.9 * lightness);
    colorObject.blue = Math.floor(colorObject.blue * (1 - lightness) + 255.9 * lightness);
    const lightColor = ColorInput.stringFromObject(colorObject);
    ColorInput.setObject(colorObject, color);
    colorObject.red = Math.floor(colorObject.red * (1 - darkness));
    colorObject.green = Math.floor(colorObject.green * (1 - darkness));
    colorObject.blue = Math.floor(colorObject.blue * (1 - darkness));
    const darkColor = ColorInput.stringFromObject(colorObject);
    const grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, radius * 0.1, x - 0.5 * radius, y - 0.5 * radius, radius * 1.5);
    grd.addColorStop(0, lightColor);
    grd.addColorStop(0.8, color);
    grd.addColorStop(1, darkColor);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};

basics.drawUpperBubble = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = basics.alphaBubbleFront;
    let transparentColor = ColorInput.stringFromObject(colorObject);
    colorObject.alpha = basics.alphaBubble;
    color = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.8, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    colorObject.alpha = 0;
    transparentColor = ColorInput.stringFromObject(colorObject);
    grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, 0, x - 0.5 * radius, y - 0.5 * radius, radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};

basics.drawLowerBubble = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = basics.alphaBubbleBack;
    let transparentColor = ColorInput.stringFromObject(colorObject);
    colorObject.alpha = basics.alphaBubble;
    color = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.9, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    colorObject.alpha = Math.floor(0.8 * basics.alphaBubble);
    color = ColorInput.stringFromObject(colorObject);
    colorObject.alpha = 0;
    transparentColor = ColorInput.stringFromObject(colorObject);
    grd = canvasContext.createRadialGradient(x + 0.5 * radius, y + 0.5 * radius, 0, x + 0.5 * radius, y + 0.5 * radius, 0.8 * radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};

// using it to draw the poincare sphere
//====================================
export const poincare = {};

poincare.color = '#888888';

poincare.drawCircle = function() {
    basics.drawCircle(0, 0, basics.hyperbolicRadius, poincare.color);
};

poincare.drawSphere = function() {
    basics.drawSphere(0, 0, basics.hyperbolicRadius, poincare.color);
};

poincare.drawUpperBubble = function() {
    basics.drawUpperBubble(0, 0, basics.hyperbolicRadius, poincare.color);
};

poincare.drawLowerBubble = function() {
    basics.drawLowerBubble(0, 0, basics.hyperbolicRadius, poincare.color);
};


// drawing points
//===================================================

basics.pointSize = 2;
var width, height, invScale, shiftX, shiftY, pointSize, pixelsArray, data;

basics.startDrawingPoints = function() {
    output.pixels.update();
    pixelsArray = output.pixels.array;
    const scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    invScale = 1 / scale;
    shiftX = output.coordinateTransform.shiftX;
    shiftY = output.coordinateTransform.shiftY;
    // (x,y)=scale*(i,j)+(shiftX,shiftY)
    width = output.canvas.width;
    height = output.canvas.height;
    pointSize = basics.pointSize;
};

// end: output.pixels.show();

basics.drawPoint = function(point, intColor) {
    let i = invScale * (point[0] - shiftX);
    let j = invScale * (point[1] - shiftY);
    switch (pointSize) {
        case 1:
            i = Math.floor(i);
            j = Math.floor(j);
            if ((i >= 0) && (i < width) && (j >= 0) && (j < height)) {
                pixelsArray[i + j * width] = intColor;
            }
            break;
        case 2:
            i = Math.round(i);
            j = Math.round(j);
            if ((i > 0) && (i < width) && (j > 0) && (j < height)) {
                let index = i + j * width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
            }
            break;
        case 3:
            i = Math.floor(i) + 1;
            j = Math.floor(j) + 1;
            if ((i >= 2) && (i < width) && (j >= 2) && (j < height)) {
                let index = i + j * width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
            }
            break;
        case 4:
            i = Math.round(i) + 1;
            j = Math.round(j) + 1;
            if ((i >= 3) && (i < width) && (j >= 3) && (j < height)) {
                let index = i + j * width;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                pixelsArray[index - 3] = intColor;
                index -= width;
                pixelsArray[index] = intColor;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
                pixelsArray[index - 3] = intColor;
                index -= width;
                pixelsArray[index - 1] = intColor;
                pixelsArray[index - 2] = intColor;
            }
            break;
    }
};

//  copy static coordinates for rotating
//=====================================

// points as arrays of arrays: copy array content fitting points,viewPoints
basics.copyCoordinatesPoints = function(viewPoints, points) {
    const length = points.length;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        const viewPoint = viewPoints[i];
        viewPoint[0] = point[0];
        viewPoint[1] = point[1];
        viewPoint[2] = point[2];
    }
};

// spheres with components: copy components (x,y,z,radius) 
// to "view" components (viewX,viewY,viewZ,viewRadius)
basics.copyCoordinatesSpheres = function(spheres) {
    const length = spheres.length;
    for (let i = 0; i < length; i++) {
        const sphere = spheres[i];
        sphere.viewX = sphere.x;
        sphere.viewY = sphere.y;
        sphere.viewZ = sphere.z;
        sphere.viewRadius = sphere.radius;
    }
};


// rotating arrays of objects and arrays of coordinate-arrays (points)
//============================================

const fromDeg = Math.PI / 180;

var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;

basics.updateEulerAngles = function() {
    const c1 = Math.cos(fromDeg * basics.alpha);
    const s1 = Math.sin(fromDeg * basics.alpha);
    const c2 = Math.cos(fromDeg * basics.beta);
    const s2 = Math.sin(fromDeg * basics.beta);
    const c3 = Math.cos(fromDeg * basics.gamma);
    const s3 = Math.sin(fromDeg * basics.gamma);
    txx = c1 * c3 - c2 * s1 * s3;
    txy = -c1 * s3 - c2 * c3 * s1;
    txz = s1 * s2;
    tyx = c3 * s1 + c1 * c2 * s3;
    tyy = c1 * c2 * c3 - s1 * s3;
    tyz = -c1 * s2;
    tzx = s2 * s3;
    tzy = c3 * s2;
    tzz = c2;
};

// rotate points that are vectors=arrays of three components
basics.rotatePoints = function(points) {
    const length = points.length;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        const x = point[0];
        const y = point[1];
        const z = point[2];
        point[0] = txx * x + txy * y + txz * z;
        point[1] = tyx * x + tyy * y + tyz * z;
        point[2] = tzx * x + tzy * y + tzz * z;
    }
};

// rotate spheres = objects with x,y,z coordinate fields
basics.rotateSpheres = function(spheres) {
    const length = spheres.length;
    for (let i = 0; i < length; i++) {
        const sphere = spheres[i];
        const x = sphere.viewX;
        const y = sphere.viewY;
        const z = sphere.viewZ;
        sphere.viewX = txx * x + txy * y + txz * z;
        sphere.viewY = tyx * x + tyy * y + tyz * z;
        sphere.viewZ = tzx * x + tzy * y + tzz * z;
    }
};

// sorting for top-down view
//=========================================

// sorting points as arrays
basics.zSortPoints = function(points) {
    points.sort((one, two) => one[2] - two[2]);
};

// sorting objects = spheres
basics.zSortSpheres = function(spheres) {
    spheres.sort((one, two) => one.viewZ - two.viewZ);
};

// view-projection, normal or stereographic
// needs hyperbolic radius and view interpolation parameter
//===========================================

basics.view = 'normal';

basics.viewInterpolation = 1;
basics.hyperbolicRadius = 1;

basics.setupStereographicView = function() {
    const x = basics.viewInterpolation * basics.viewInterpolation;
    stereographicCenter = basics.hyperbolicRadius / x;
    stereographicRadius2 = stereographicCenter * stereographicCenter + 3 * basics.hyperbolicRadius * basics.hyperbolicRadius;
    stereographicOffset = -2 * basics.hyperbolicRadius * x;
};

// spheres are objects
basics.stereographicViewSpheres = function(spheres) {
    const x = basics.viewInterpolation * basics.viewInterpolation;
    const stereographicCenter = basics.hyperbolicRadius / x;
    let stereographicRadius2 = stereographicCenter + basics.hyperbolicRadius;
    stereographicRadius2 *= stereographicRadius2;
    const stereographicOffset = -2 * basics.hyperbolicRadius;
    const length = spheres.length;
    for (let i = 0; i < length; i++) {
        const sphere = spheres[i];
        const x = sphere.viewX;
        const y = sphere.viewY;
        const dz = sphere.viewZ - stereographicCenter;
        const viewRadius = sphere.viewRadius;
        const d2 = x * x + y * y + dz * dz;
        const factor = stereographicRadius2 / (d2 - viewRadius * viewRadius);
        sphere.viewX = factor * x;
        sphere.viewY = factor * y;
        sphere.viewZ = stereographicOffset - (stereographicCenter + factor * dz); // compensate for mirroring at (x,y) plane in limit to normal view
        sphere.viewRadius = factor * viewRadius;
    }
};

// (view)points are arrays
basics.stereographicViewPoints = function(points) {
    const x = basics.viewInterpolation * basics.viewInterpolation;
    const stereographicCenter = basics.hyperbolicRadius / x;
    let stereographicRadius2 = stereographicCenter + basics.hyperbolicRadius;
    stereographicRadius2 *= stereographicRadius2;
    const stereographicOffset = -2 * basics.hyperbolicRadius;
    const length = points.length;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        const x = point[0];
        const y = point[1];
        const dz = point[2] - stereographicCenter;
        const d2 = x * x + y * y + dz * dz;
        const factor = stereographicRadius2 / d2;
        point[0] = factor * x;
        point[1] = factor * y;
        point[2] = stereographicOffset - (stereographicCenter + factor * dz);
    }
};

// (view)points are arrays
basics.bothViewsPoints = function(stereographicPoints, points) {
    const stereographicCenter = basics.hyperbolicRadius;
    const stereographicRadius2 = 4 * stereographicCenter * stereographicCenter;
    const length = points.length;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        const stereographicPoint=stereographicPoints[i];
        const x = point[0];
        const y = point[1];
        const dz = point[2] - stereographicCenter;
        const d2 = x * x + y * y + dz * dz;
        const factor = stereographicRadius2 / d2;
        const newPoint = new Float32Array(3);
        stereographicPoint[0] = factor * x;
        stereographicPoint[1] = factor * y;
        stereographicPoint[2] = stereographicCenter + factor * dz;
    }
};

// tilt and rotate
//==========================================

basics.tiltAngle = 0;
basics.rotationAngle = 0;
var tiltCos, tiltSin, rotationCos, rotationSin;

basics.setupTiltRotation = function() {
    tiltCos = Math.cos(fromDeg * basics.tiltAngle);
    tiltSin = Math.sin(fromDeg * basics.tiltAngle);
    rotationCos = Math.cos(fromDeg * basics.rotationAngle);
    rotationSin = Math.sin(fromDeg * basics.rotationAngle);
};

// spheres are objects
basics.tiltRotateSpheres = function(spheres) {
    const length = spheres.length;
    for (let i = 0; i < length; i++) {
        const sphere = spheres[i];
        const x = sphere.viewX;
        let y = sphere.viewY;
        const z = sphere.viewZ;
        sphere.viewX = rotationCos * x - rotationSin * y;
        y = rotationSin * x + rotationCos * y;
        sphere.viewY = tiltCos * y - tiltSin * z;
        sphere.viewZ = tiltSin * y + tiltCos * z;
    }
};

basics.tiltRotatePoints = function(points) {
    const length = points.length;
    for (let i = 0; i < length; i++) {
        const point = points[i];
        const x = point[0];
        let y = point[1];
        const z = point[2];
        point[0] = rotationCos * x - rotationSin * y;
        y = rotationSin * x + rotationCos * y;
        point[1] = tiltCos * y - tiltSin * z;
        point[2] = tiltSin * y + tiltCos * z;
    }
};