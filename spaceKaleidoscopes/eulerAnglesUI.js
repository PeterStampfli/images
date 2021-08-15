/* jshint esversion: 6 */

import {
    ParamGui
} from "../libgui/modules.js";


// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'euler',
    closed: false
});

gui.addParagraph("Euler angles");

const eulerAngles = {};

eulerAngles.alpha = 0;
eulerAngles.beta = 0;
eulerAngles.gamma = 0;

const controllerAlpha = gui.add({
    type: 'number',
    params: eulerAngles,
    property: 'alpha',
    min: -180,
    max: 180,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllerAlpha.cyclic();

const controllerBeta = controllerAlpha.add({
    type: 'number',
    params: eulerAngles,
    property: 'beta',
    min: -180,
    max: 180,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllerBeta.cyclic();

const controllerGamma = controllerBeta.add({
    type: 'number',
    params: eulerAngles,
    property: 'gamma',
    min: -180,
    max: 180,
    onChange: function() {
        map.drawMapChanged();
    }
});
controllerGamma.cyclic();

var txx, txy, txz, tyx, tyy, tyz, tzx, tzy, tzz;

function updateEulerCoefficients() {
    const c1 = cos(fromDeg * eulerAngles.alpha);
    cosAlpha = c1;
    const s1 = sin(fromDeg * eulerAngles.alpha);
    sinAlpha = s1;
    const c2 = cos(fromDeg * eulerAngles.beta);
    const s2 = sin(fromDeg * eulerAngles.beta);
    const c3 = cos(fromDeg * eulerAngles.gamma);
    const s3 = sin(fromDeg * eulerAngles.gamma);
    txx = c1 * c3 - c2 * s1 * s3;
    txy = -c1 * s3 - c2 * c3 * s1;
    txz = s1 * s2;
    tyx = c3 * s1 + c1 * c2 * s3;
    tyy = c1 * c2 * c3 - s1 * s3;
    tyz = -c1 * s2;
    tzx = s2 * s3;
    tzy = c3 * s2;
    tzz = c2;
}

function eulerRotation() {
    const newX = txx * x + txy * y + txz * z;
    const newY = tyx * x + tyy * y + tyz * z;
    z = tzx * x + tzy * y + tzz * z;
    x = newX;
    y = newY;
}