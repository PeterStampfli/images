/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents,
    keyboard
} from "../libgui/modules.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

export const bulatov = {};
bulatov.drift = 0;

bulatov.setup = function(gui) {
    gui.add({
        type: 'number',
        params: bulatov,
        property: 'drift',
        onChange: julia.drawNewStructure
    });
};

bulatov.cartioid = function() {
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const initialXArray = map.initialXArray;
    const initialYArray = map.initialYArray;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        /* x is real part, y is imaginary part*/
        /* symmetry with respect to y-axis*/
        /* 1-i  z*/
        let x = 1 - yArray[index];
        let y = xArray[index];

        /* square root*/
        const phi = 0.5 * Math.atan2(y, x);
        const r = Math.sqrt(y * y + x * x);
        x = 2 * r * Math.sin(phi);
        y = -2 * (r * Math.cos(phi) - 1);

        xArray[index] = x;
        yArray[index] = y;
        initialXArray[index] = x;
        initialYArray[index] = y;
    }
};

bulatov.makeDrift = function() {
    const drift = bulatov.drift;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const initialXArray = map.initialXArray;
    const initialYArray = map.initialYArray;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        xArray[index] -= drift * initialYArray[index];
        yArray[index] += drift * initialXArray[index];
    }
};