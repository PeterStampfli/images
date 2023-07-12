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

export const symmetricRandomRational = {};

symmetricRandomRational.nomPower = 2;
symmetricRandomRational.denomPower = 0;
symmetricRandomRational.imaginaries = true;
symmetricRandomRational.posReal = false;
symmetricRandomRational.prefactorReal = 1;
symmetricRandomRational.prefactorImag = 0;
symmetricRandomRational.order = 5;
symmetricRandomRational.zPower = 1;
symmetricRandomRational.exponential = false;

symmetricRandomRational.setup = function(gui) {
    gui.addParagraph('<strong>random rational function</strong>');
    gui.add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'prefactorReal',
        labelText: 'prefactor',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'prefactorImag',
        labelText: 'imag',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'order',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: symmetricRandomRational,
        property: 'imaginaries',
        labelText: 'imag',
        onChange: function() {
            symmetricRandomRational.randomKoeffs();
            julia.drawNewStructure();
        }
    }).add({
        type: 'boolean',
        params: symmetricRandomRational,
        property: 'posReal',
        labelText: 'pos real',
        onChange: function() {
            symmetricRandomRational.randomKoeffs();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'nomPower',
        step: 1,
        min: 1,
        onChange: function() {
            symmetricRandomRational.randomKoeffs();
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'denomPower',
        step: 1,
        min: 0,
        onChange: function() {
            symmetricRandomRational.randomKoeffs();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'zPower',
        step: 1,
        onChange: function() {
            symmetricRandomRational.randomKoeffs();
            julia.drawNewStructure();
        }
    }).add({
        type: 'boolean',
        params: symmetricRandomRational,
        property: 'exponential',
        onChange: julia.drawNewStructure,
    });
    const randomizeButton = gui.add({
        type: 'button',
        buttonText: 'randomize',
        onClick: function() {
            symmetricRandomRational.randomKoeffs();
            julia.drawNewStructure();
        }
    });
    symmetricRandomRational.randomKoeffs();
    map.mapping = map.evaluateSymmetricRandomRationalFunction;
};

let nomKoeffsReal = [];
let nomKoeffsImag = [];
let denomKoeffsReal = [];
let denomKoeffsImag = [];

symmetricRandomRational.randomKoeffs = function() {
    nomKoeffsReal.length = 0;
    nomKoeffsImag.length = 0;
    denomKoeffsReal.length = 0;
    denomKoeffsImag.length = 0;
    for (let i = 0; i <= symmetricRandomRational.nomPower; i++) {
        nomKoeffsReal.push(symmetricRandomRational.posReal ? Math.random() : 2 * (Math.random() - 0.5));
        nomKoeffsImag.push(symmetricRandomRational.imaginaries ? 2 * (Math.random() - 0.5) : 0);
    }
    for (let i = 0; i <= symmetricRandomRational.denomPower; i++) {
        denomKoeffsReal.push(symmetricRandomRational.posReal ? Math.random() : 2 * (Math.random() - 0.5));
        denomKoeffsImag.push(symmetricRandomRational.imaginaries ? 2 * (Math.random() - 0.5) : 0);
    }

    // special rational function: constant term always equal to 1
    // note if not redundancy with prefactor
    // note inverse order of coefficient storage
    nomKoeffsReal[nomKoeffsReal.length - 1] = 1;
    nomKoeffsImag[nomKoeffsReal.length - 1] = 0;
    denomKoeffsReal[denomKoeffsReal.length - 1] = 1;
    denomKoeffsImag[denomKoeffsReal.length - 1] = 0;

    console.log(nomKoeffsReal);
    console.log(nomKoeffsImag);
    console.log(denomKoeffsReal);
    console.log(denomKoeffsImag);
};

/**
 * evaluate the rational function for each pixel
 * only for pixel with structure>=0 (valid pixels)
 */
map.evaluateSymmetricRandomRationalFunction = function() {
    console.log('ev');
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const eps = 1e-100;
    const nPixels = map.xArray.length;
    const nomPower = symmetricRandomRational.nomPower;
    const denomPower = symmetricRandomRational.denomPower;
    const prefactorReal = symmetricRandomRational.prefactorReal;
    const prefactorImag = symmetricRandomRational.prefactorImag;
    const order = symmetricRandomRational.order;
    const order2 = order / 2;
    const zPow = symmetricRandomRational.zPower;
    const zPow2 = zPow / 2;
    // result for infty/infty
    var xInfty, yInfty;
    if (order * nomPower + zPow > order * denomPower) {
        xInfty = Infinity;
        yInfty = Infinity;
    } else if (order * nomPower + zPow === order * denomPower) {
        // calculate quotient of highest power coefficients
        const factor = 1 / (denomKoeffsReal[0] * denomKoeffsReal[0] + denomKoeffsImag[0] * denomKoeffsImag[0]);
        xInfty = factor * (denomKoeffsReal[0] * nomKoeffsReal[0] + denomKoeffsImag[0] * denomKoeffsImag[0]);
        yInfty = factor * (nomKoeffsImag[0] * denomKoeffsReal[0] - nomKoeffsReal[0] * denomKoeffsImag[0]);
        // multiply with prefactor
        const h = prefactorReal * xInfty - prefactorImag * yInfty;
        yInfty = prefactorReal * YInfty + prefactorImag * xInfty;
        xInfty = h;
    } else {
        xInfty = 0;
        yInfty = 0;
    }
    if (symmetricRandomRational.exponential) {
        for (let index = 0; index < nPixels; index++) {
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
            const phi = Math.atan2(y, x);
            // calculate z^zPow
            let r = Math.pow(r2, zPow2);
            let angle = zPow * phi;
            x = r * Math.cos(angle);
            y = r * Math.sin(angle);
            //prefactor*z^zPow
            const prefZPowReal = prefactorReal * x - prefactorImag * y;
            const prefZPowImag = prefactorReal * y + prefactorImag * x;
            //  z^order
            r = Math.pow(r2, order2);
            angle = order * phi;
            x = r * Math.cos(angle);
            y = r * Math.sin(angle);
            // polynoms of exp(z**order)
r=Math.exp(x);
x=r*Math.cos(y);
y=r*Math.sin(y);
            // nominator, including prefactor*z^zPow
            let nomReal = nomKoeffsReal[0];
            let nomImag = nomKoeffsImag[0];
            for (let i = 1; i <= nomPower; i++) {
                const h = nomReal * x - nomImag * y + nomKoeffsReal[i];
                nomImag = nomImag * x + nomReal * y + nomKoeffsImag[i];
                nomReal = h;
            }
            const h = nomReal * prefZPowReal - nomImag * prefZPowImag;
            nomImag = nomImag * prefZPowReal + nomReal * prefZPowImag;
            nomReal = h;
            //denominator
            let denomReal = denomKoeffsReal[0];
            let denomImag = denomKoeffsImag[0];
            for (let i = 1; i <= denomPower; i++) {
                const h = denomReal * x - denomImag * y + denomKoeffsReal[i];
                denomImag = denomImag * x + denomReal * y + denomKoeffsImag[i];
                denomReal = h;
            }
            const denom2 = denomReal * denomReal + denomImag * denomImag;
            const nom2 = nomReal * nomReal + nomImag * nomImag;
            if (!isFinite(nom2)) {
                if (isFinite(denom2)) {
                    xArray[index] = Infinity;
                    yArray[index] = Infinity;
                } else {
                    xArray[index] = xInfty;
                    yArray[index] = yInfty;
                }
                continue;
            } else if (!isFinite(denom2)) {
                xArray[index] = 0;
                yArray[index] = 0;
                continue;
            }
            if (denom2 < eps) {
                xArray[index] = Infinity;
                yArray[index] = Infinity;
                continue;
            }
            const factor = 1 / denom2;
            xArray[index] = factor * (nomReal * denomReal + nomImag * denomImag);
            yArray[index] = factor * (nomImag * denomReal - nomReal * denomImag);
        }
    } else {
        for (let index = 0; index < nPixels; index++) {
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
            const phi = Math.atan2(y, x);
            // calculate z^zPow
            let r = Math.pow(r2, zPow2);
            let angle = zPow * phi;
            x = r * Math.cos(angle);
            y = r * Math.sin(angle);
            //prefactor*z^zPow
            const prefZPowReal = prefactorReal * x - prefactorImag * y;
            const prefZPowImag = prefactorReal * y + prefactorImag * x;
            // polynoms of z^order
            r = Math.pow(r2, order2);
            angle = order * phi;
            x = r * Math.cos(angle);
            y = r * Math.sin(angle);
            // nominator, including prefactor*z^zPow
            let nomReal = nomKoeffsReal[0];
            let nomImag = nomKoeffsImag[0];
            for (let i = 1; i <= nomPower; i++) {
                const h = nomReal * x - nomImag * y + nomKoeffsReal[i];
                nomImag = nomImag * x + nomReal * y + nomKoeffsImag[i];
                nomReal = h;
            }
            const h = nomReal * prefZPowReal - nomImag * prefZPowImag;
            nomImag = nomImag * prefZPowReal + nomReal * prefZPowImag;
            nomReal = h;
            //denominator
            let denomReal = denomKoeffsReal[0];
            let denomImag = denomKoeffsImag[0];
            for (let i = 1; i <= denomPower; i++) {
                const h = denomReal * x - denomImag * y + denomKoeffsReal[i];
                denomImag = denomImag * x + denomReal * y + denomKoeffsImag[i];
                denomReal = h;
            }
            const denom2 = denomReal * denomReal + denomImag * denomImag;
            const nom2 = nomReal * nomReal + nomImag * nomImag;
            if (!isFinite(nom2)) {
                if (isFinite(denom2)) {
                    xArray[index] = Infinity;
                    yArray[index] = Infinity;
                } else {
                    xArray[index] = xInfty;
                    yArray[index] = yInfty;
                }
                continue;
            } else if (!isFinite(denom2)) {
                xArray[index] = 0;
                yArray[index] = 0;
                continue;
            }
            if (denom2 < eps) {
                xArray[index] = Infinity;
                yArray[index] = Infinity;
                continue;
            }
            const factor = 1 / denom2;
            xArray[index] = factor * (nomReal * denomReal + nomImag * denomImag);
            yArray[index] = factor * (nomImag * denomReal - nomReal * denomImag);
        }
    }
};