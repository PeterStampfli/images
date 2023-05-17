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
randomRationals.nomPower = 3;
randomRationals.denomPower = 2;
randomRationals.imaginaries=true;

randomRationals.setup = function(gui) {
    gui.addParagraph('<strong>random rational function</strong>');
    gui.add({
        type: 'number',
        params: randomRationals,
        property: 'range',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: randomRationals,
        property: 'imaginaries',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: randomRationals,
        property: 'nomPower',
        step: 1,
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: randomRationals,
        property: 'denomPower',
        step: 1,
        min: 0,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'button',
        buttonText: 'randomize',
        onClick: function() {
            console.log('randomize');
            randomKoeffs();
        }
    });
    randomKoeffs();

};

const nomKoeffsReal = [];
const nomKoeffsImag = [];
const denomKoeffsReal = [];
const denomKoeffsImag = [];

function randomKoeffs() {
    nomKoeffsReal.length = 0;
    nomKoeffsImag.length = 0;
    denomKoeffsReal.length = 0;
    denomKoeffsImag.length = 0;
    for (let i = 0; i <= randomRationals.nomPower; i++) {
        nomKoeffsReal.push(2 * randomRationals.range * (Math.random() - 0.5));
    }
    for (let i = 0; i <= randomRationals.denomPower; i++) {
        denomKoeffsReal.push(2 * randomRationals.range * (Math.random() - 0.5));
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
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // nominator, including amplitude
        let nomRe = 1;
        let nomIm = 0;

        //denominator
        let denRe = 1;
        let denIm = 0;

        // division, avoiding div by zero
        const norm = 1 / (denRe * denRe + denIm * denIm + eps);
        xArray[index] = norm * (nomRe * denRe + nomIm * denIm);
        yArray[index] = norm * (nomIm * denRe - nomRe * denIm);
    }
};