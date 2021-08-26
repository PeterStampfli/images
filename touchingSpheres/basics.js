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

basics.drawDisc = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fill();
};

basics.drawCircle = function(x, y, radius) {
    const canvasContext = output.canvasContext;
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.stroke();
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
    colorObject.alpha = 0;
    const transparentColor = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.8, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, 0, x - 0.5 * radius, y - 0.5 * radius, radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};

basics.drawLowerBubble = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = 0;
    let transparentColor = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.9, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    colorObject.alpha = 200;
    color = ColorInput.stringFromObject(colorObject);
    grd = canvasContext.createRadialGradient(x + 0.5 * radius, y + 0.5 * radius, 0, x + 0.5 * radius, y + 0.5 * radius, 0.8 * radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
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
basics.rotatePoints = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing[0];
        const y = thing[1];
        const z = thing[2];
        thing[0] = txx * x + txy * y + txz * z;
        thing[1] = tyx * x + tyy * y + tyz * z;
        thing[2] = tzx * x + tzy * y + tzz * z;
    }
};

// rotate spheres = objects with x,y,z coordinate fields
basics.rotateSpheres = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing.x;
        const y = thing.y;
        const z = thing.z;
        thing.x = txx * x + txy * y + txz * z;
        thing.y = tyx * x + tyy * y + tyz * z;
        thing.z = tzx * x + tzy * y + tzz * z;
    }
};

// sorting for top-down view
//=========================================

// sorting points as arrays
basics.zSortPoints = function(things) {
    things.sort((one, two) => one[2] - two[2]);
};

// sorting objects = spheres
basics.zSortSpheres = function(things) {
    things.sort((one, two) => one.z - two.z);
};

// view-projection, normal or stereographic
// needs hyperbolic radius aand view interpolation parameter
//===========================================

basic.normalView = function(things) {};

basic.viewInterpolation = 1;
basic.hyperbolicRadius = 1;

var viewCenter, viewRadius2;

basic.setupView = function() {
    viewCenter = basic.hyperbolicRadius / view.interpolation / view.interpolation;
    viewRadius2 = viewCenter * viewCenter + basic.hyperbolicRadius * basic.hyperbolicRadius;
};

// spheres are objects
basic.stereographicViewSpheres = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing.x;
        const y = thing.y;
        const dz = thing.z - viewCenter;
        const radius = thing.radius;
        const d2 = x * x + y * y + dz * dz;
        const factor = viewRadius2 / (d2 - radius * radius);
        thing.x = factor * x;
        thing.y = factor * y;
        thing.z = viewCenter + factor * dz;
        thing.radius = factor * radius;
    }
};

// points are arrays
basic.stereographicViewPoints = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const x = thing[0];
        const y = thing[1];
        const dz = thing[2] - viewCenter;
        const d2 = x * x + y * y + dz * dz;
        const factor = viewRadius2 / d2;
        thing[0] = factor * x;
        thing[1] = factor * y;
        thing[2] = viewCenter + factor * dz;
    }
};

// tilt
//==========================================

basics.tiltAngle = 0;
var tiltCos, tiltSin;

basics.setupTilt = function() {
    tiltCos = Math.cos(basics.tiltAngle);
    tiltSin = Math.sin(basics.tiltAngle);
};

// spheres are objects
basics.tiltSpheres = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const y = thing.y;
        const z = thing.z;
        thing.y = tiltCos * y - tiltSin * z;
        thing.z = tiltSin * y + tiltcos * z;
    }
};

basics.tiltPoints = function(things) {
    const length = things.length;
    for (let i = 0; i < length; i++) {
        const thing = things[i];
        const y = thing[1];
        const z = thing[2];
        thing[1] = tiltCos * y - tiltSin * z;
        thing[2] = tiltSin * y + tiltcos * z;
    }
};