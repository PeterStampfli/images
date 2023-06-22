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
symmetricRandomRational.prefactorImag = 1;
symmetricRandomRational.order=5;

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
        step:1,
        min:1,
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
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const eps = 1e-100;
    const nPixels = map.xArray.length;
    const nomPower = symmetricRandomRational.nomPower;
    const denomPower = symmetricRandomRational.denomPower;
    const prefactor = symmetricRandomRational.prefactor;
    // result for infty/infty
    var inftDivInftyX, inftDivInftyY;
    if (nomPower > denomPower) {
        inftDivInftyX = Infinity;
        inftDivInftyY = Infinity;
    } else if (nomPower === denomPower) {
        const factor = prefactor / (denomKoeffsReal[0] * denomKoeffsReal[0] + denomKoeffsImag[0] * denomKoeffsImag[0]);
        inftDivInftyX = factor * (denomKoeffsReal[0] * nomKoeffsReal[0] + denomKoeffsImag[0] * denomKoeffsImag[0]);
        inftDivInftyY = factor * (nomKoeffsImag[0] * denomKoeffsReal[0] - nomKoeffsReal[0] * denomKoeffsImag[0]);
    } else {
        inftDivInftyX = 0;
        inftDivInftyY = 0;
    }
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // safety: check if z is finite
        if (isFinite(x * x + y * y)) {
            // nominator, including amplitude
            let nomRe = nomKoeffsReal[0];
            let nomIm = nomKoeffsImag[0];
            for (let i = 1; i <= nomPower; i++) {
                const h = nomRe * x - nomIm * y + nomKoeffsReal[i];
                nomIm = nomIm * x + nomRe * y + nomKoeffsImag[i];
                nomRe = h;
            }
            //denominator
            let denRe = denomKoeffsReal[0];
            let denIm = denomKoeffsImag[0];
            for (let i = 1; i <= denomPower; i++) {
                const h = denRe * x - denIm * y + denomKoeffsReal[i];
                denIm = denIm * x + denRe * y + denomKoeffsImag[i];
                denRe = h;
            }
            const denomAbs2 = denRe * denRe + denIm * denIm;
            const nomAbs2 = nomRe * nomRe + nomIm * nomIm;
            // problems with infinity  x=Infinity!!
            if (isFinite(denomAbs2)) {
                if (isFinite(nomAbs2)) {
                    // division, avoiding div by zero
                    // assuming that singularities and zeros are separated
                    if (denomAbs2 > eps) {
                        const factor = prefactor / denomAbs2;
                        xArray[index] = factor * (nomRe * denRe + nomIm * denIm);
                        yArray[index] = factor * (nomIm * denRe - nomRe * denIm);
                    } else {
                        xArray[index] = Infinity;
                        yArray[index] = Infinity;
                    }
                } else {
                    //nominator infinite, denominator finite
                    xArray[index] = Infinity;
                    yArray[index] = Infinity;
                }
            } else {
                if (isFinite(nomAbs2)) {
                    // finite nominator, infinite denominator
                    xArray[index] = 0;
                    yArray[index] = 0;
                } else {
                    // both infinite infty/infty
                    xArray[index] = inftDivInftyX;
                    yArray[index] = inftDivInftyY;
                }
            }
        } else {
            // z is infinite-> infty/infty, depending on powers
            // valid also if no singularity
            xArray[index] = inftDivInftyX;
            yArray[index] = inftDivInftyY;
        }
    }
};