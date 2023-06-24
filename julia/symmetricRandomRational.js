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
symmetric fractals from f(z)=g(z^n)*z
where g is a random rational function
*/

export const symmetricRandomRational = {};

symmetricRandomRational.nomPower = 2;
symmetricRandomRational.denomPower = 0;
symmetricRandomRational.imaginaries = true;
symmetricRandomRational.prefactorReal = 1;
symmetricRandomRational.prefactorImag = 0;
symmetricRandomRational.order = 5;

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
        onChange: function() {
            randomKoeffs();
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
            randomKoeffs();
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: symmetricRandomRational,
        property: 'denomPower',
        step: 1,
        min: 0,
        onChange: function() {
            randomKoeffs();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'button',
        buttonText: 'randomize',
        onClick: function() {
            randomKoeffs();
            julia.drawNewStructure();
        }
    });
    randomKoeffs();
    map.mapping = map.evaluateSymmetricRandomRationalFunction;
};

let nomKoeffsReal = [];
let nomKoeffsImag = [];
let denomKoeffsReal = [];
let denomKoeffsImag = [];

function randomKoeffs() {
    nomKoeffsReal.length = 0;
    nomKoeffsImag.length = 0;
    denomKoeffsReal.length = 0;
    denomKoeffsImag.length = 0;
    for (let i = 0; i <= symmetricRandomRational.nomPower; i++) {
        nomKoeffsReal.push(2 * (Math.random() - 0.5));
        nomKoeffsImag.push(symmetricRandomRational.imaginaries ? 2 * (Math.random() - 0.5) : 0);
    }
    for (let i = 0; i <= symmetricRandomRational.denomPower; i++) {
        denomKoeffsReal.push(2 * (Math.random() - 0.5));
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
}

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
    // result for infty/infty
    var xInfty, yInfty;
    if (order * nomPower + 1 > order * denomPower) {
        xInfty = Infinity;
        yInfty = Infinity;
    } else if (order * nomPower + 1 === order * denomPower) {
        const factor = prefactor / (denomKoeffsReal[0] * denomKoeffsReal[0] + denomKoeffsImag[0] * denomKoeffsImag[0]);
        xInfty = factor * (denomKoeffsReal[0] * nomKoeffsReal[0] + denomKoeffsImag[0] * denomKoeffsImag[0]);
        yInfty = factor * (nomKoeffsImag[0] * denomKoeffsReal[0] - nomKoeffsReal[0] * denomKoeffsImag[0]);
    } else {
        xInfty = 0;
        yInfty = 0;
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
        // prefactor times z is always factor for nominator
        const prefZReal = prefactorReal * x - prefactorImag * y;
        const prefZImag = prefactorReal * y + prefactorImag * x;
        // calculate z^order
        const r = Math.pow(r2, order2);
        const phi = order * Math.atan2(y, x);
        x = r * Math.cos(phi);
        y = r * Math.sin(phi);
        // polynoms of z^order
        // nominator, including prefactor*z
        let nomReal = nomKoeffsReal[0];
        let nomImag = nomKoeffsImag[0];
        for (let i = 1; i <= nomPower; i++) {
            const h = nomReal * x - nomImag * y + nomKoeffsReal[i];
            nomImag = nomImag * x + nomReal * y + nomKoeffsImag[i];
            nomReal = h;
        }
        let h = nomReal * prefZReal - nomImag * prefZImag;
        nomImag = nomImag * prefZReal + nomReal * prefZImag;
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
};