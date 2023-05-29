/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    julia
} from "./julia.js";

import {
    map
} from "./mapImage.js";

export const randomRationals = {};

randomRationals.range = 1;
randomRationals.nomPower = 2;
randomRationals.denomPower = 0;
randomRationals.imaginaries = true;
randomRationals.prefactor = 1;
randomRationals.noConstant = true;

randomRationals.setup = function(gui) {
    gui.addParagraph('<strong>random rational function</strong>');
    gui.add({
        type: 'number',
        params: randomRationals,
        property: 'prefactor',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: randomRationals,
        property: 'range',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: randomRationals,
        property: 'imaginaries',
        onChange: function() {
            randomKoeffs();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: randomRationals,
        property: 'nomPower',
        step: 1,
        min: 0,
        onChange: function() {
            randomKoeffs();
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: randomRationals,
        property: 'denomPower',
        step: 1,
        min: 0,
        onChange: function() {
            randomKoeffs();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'boolean',
        params: randomRationals,
        property: 'noConstant',
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
    for (let i = 0; i <= randomRationals.nomPower; i++) {
        nomKoeffsReal.push(2 * randomRationals.range * (Math.random() - 0.5));
        nomKoeffsImag.push(randomRationals.imaginaries ? 2 * randomRationals.range * (Math.random() - 0.5) : 0);
    }
    for (let i = 0; i <= randomRationals.denomPower; i++) {
        denomKoeffsReal.push(2 * randomRationals.range * (Math.random() - 0.5));
        denomKoeffsImag.push(randomRationals.imaginaries ? 2 * randomRationals.range * (Math.random() - 0.5) : 0);
    }
    if (randomRationals.noConstant) {
        nomKoeffsReal[randomRationals.nomPower] = 0;
        nomKoeffsImag[randomRationals.nomPower] = 0;
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
map.evaluateRationalFunction = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const eps = 1e-100;
    const nPixels = map.xArray.length;
    const nomPower = randomRationals.nomPower;
    const denomPower = randomRationals.denomPower;
    const prefactor = randomRationals.prefactor;
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