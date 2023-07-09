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

export const tangenshyp = {};

tangenshyp.prefactorReal = 1;
tangenshyp.prefactorImag = 0;
tangenshyp.order = 5;
tangenshyp.zPower = 1;

tangenshyp.setup = function(gui) {
    gui.addParagraph('<strong>random rational function</strong>');
    gui.add({
        type: 'number',
        params: tangenshyp,
        property: 'prefactorReal',
        labelText: 'prefactor',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: tangenshyp,
        property: 'prefactorImag',
        labelText: 'imag',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: tangenshyp,
        property: 'order',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: tangenshyp,
        property: 'zPower',
        step: 1,
        onChange: julia.drawNewStructure
    });
    map.mapping = map.evaluateTangenshyp;
};

/**
 * evaluate the  function for each pixel
 * only for pixel with structure>=0 (valid pixels)
 */
map.evaluateTangenshyp = function() {
    console.log('evaluateTangenshyp');
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const eps = 1e-100;
    const nPixels = map.xArray.length;
    const prefactorReal = tangenshyp.prefactorReal;
    const prefactorImag = tangenshyp.prefactorImag;
    const order = tangenshyp.order;
    const order2 = order / 2;
    const zPow = tangenshyp.zPower;
    const zPow2 = zPow / 2;

    // result for infty
    var xInfty, yInfty;
    if (zPow > 0) {
        xInfty = Infinity;
        yInfty = Infinity;
    } else if (zPow < 0) {
        xInfty = 0;
        yInfty = 0;
    } else {
        xInfty = prefactorReal;
        yInfty = prefactorImag;
    }
    // result for z->0
    var xZero, yZero;
    if (zPow >= 0) {
        xZero = 0;
        yZero = 0;
    } else if (zPow < -1) {
        xZero = Infinity;
        yZero = Infinity;
    } else {
        xInfty = prefactorReal;
        yInfty = prefactorImag;
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
        // tangenshyp z^order
        r = 2 * Math.pow(r2, order2);
        angle = order * phi;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        const expReal = Math.exp(x);
        if (isFinite(expReal)) {
            x = expReal * Math.cos(y);
            y = expReal * Math.sin(y);

            const nomReal = x + 1;
            const nomImag = y;
            const denomReal = x - 1;
            const denomImag = y;
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