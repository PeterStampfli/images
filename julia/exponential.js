/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    map,
    julia
} from "./mapImage.js";

/*
symmetric fractals from f(z)=prefactor*g(z^n)*z^zPower
where g is a random rational function
*/

export const exponential = {};

exponential.prefactorReal = 1;
exponential.prefactorImag = 0;
exponential.order = 5;
exponential.zPower = 1;
exponential.a = 1;
exponential.b = 0;
exponential.c = 0;
exponential.d = 1;

exponential.setup = function(gui) {
    gui.addParagraph('<strong>exponential function</strong>');
    gui.add({
        type: 'number',
        params: exponential,
        property: 'prefactorReal',
        labelText: 'prefactor',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: exponential,
        property: 'prefactorImag',
        labelText: 'imag',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: exponential,
        property: 'a',
        labelText: 'nom',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: exponential,
        property: 'b',
        labelText: '',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: exponential,
        property: 'c',
        labelText: 'denom',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: exponential,
        property: 'd',
        labelText: '',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: exponential,
        property: 'order',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: exponential,
        property: 'zPower',
        step: 1,
        onChange: julia.drawNewStructure
    });
    map.mapping = map.evaluateExponential;
};

/**
 * evaluate the  function for each pixel
 * only for pixel with structure>=0 (valid pixels)
 */
map.evaluateExponential = function() {
    console.log('ev');
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const eps = 1e-100;
    const nPixels = map.xArray.length;
    const prefactorReal = exponential.prefactorReal;
    const prefactorImag = exponential.prefactorImag;
    const order = exponential.order;
    const order2 = order / 2;
    const zPow = exponential.zPower;
    const zPow2 = zPow / 2;
    const a = exponential.a;
    const b = exponential.b;
    const c = exponential.c;
    const d = exponential.d;

    // result for z>infty
    let xInfty = Infinity;
    let yInfty = Infinity;
    if (Math.abs(a) < eps) {
        xInfty = 0;
        yInfty = 0;
    }
    if (zPow === 0) {
        xInfty = a / c * prefactorReal;
        yInfty = a / c * prefactorImag;
    }

    // result for z->0
    var xZero, yZero;
    if (zPow > 0) {
        xZero = 0;
        yZero = 0;
    } else if (zPow < 0) {
        xZero = Infinity;
        yZero = Infinity;
    } else {
        xZero = (a + b) / (c + d) * prefactorReal;
        yZero = (a + b) / (c + d) * prefactorImag;
    }
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // safety: check if z is finite
        const r2 = x * x + y * y;
        if (!isFinite(r2)) {
            xArray[index] = xInfty;
            yArray[index] = yInfty;
            continue;
        }
        if (r2 < eps) {
            xArray[index] = xZero;
            yArray[index] = yZero;
            continue;
        }
        const phi = Math.atan2(y, x);
        // calculate z^zPow
        let r = Math.pow(r2, zPow2);
        let angle = zPow * phi;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        //prefactor*z^zPow
        const prefZPowReal = prefactorReal * x - prefactorImag * y;
        const prefZPowImag = prefactorReal * y + prefactorImag * x;
        // exponential z^order
        r = Math.pow(r2, order2);
        angle = order * phi;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        const expReal = Math.exp(x);
        if (isFinite(expReal)) {
            x = expReal * Math.cos(y);
            y = expReal * Math.sin(y);
            let nomReal = a * x + b;
            let  nomImag = a * y;
            let denomReal = c * x + d;
            let denomImag = c * y;
            const denom2 = denomReal * denomReal + denomImag * denomImag;
            if (denom2 < eps) {
                xArray[index] = Infinity;
                yArray[index] = Infinity;
                continue;
            }
            const factor = 1 / denom2;
            x = factor * (nomReal * denomReal + nomImag * denomImag);
            y = factor * (nomImag * denomReal - nomReal * denomImag);
            xArray[index] = prefZPowReal * x - prefZPowImag * y;
            yArray[index] = prefZPowReal * y + prefZPowImag * x;
        } else {
            xArray[index] = xInfty;
            yArray[index] = yInfty;
        }
    }
};