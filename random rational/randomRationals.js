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

randomRationals.setup = function(gui) {
    gui.addParagraph('<strong>random rational function</strong>');
    gui.add({
        type: 'number',
        params: randomRationals,
        property: 'prefactor',
        onChange: julia.drawNewStructure
    })
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
    //  nomKoeffsReal=[1,0,-0.25];
    // nomKoeffsImag=[0,0,0];

    console.log(nomKoeffsReal);
    console.log(nomKoeffsImag);
    console.log(denomKoeffsReal);
    console.log(denomKoeffsImag);
    let x = 0;
    let y = 1;
    const nomPower = randomRationals.nomPower;
    const denomPower = randomRationals.denomPower;
    // nominator, including amplitude
    let nomRe = nomKoeffsReal[0];
    let nomIm = nomKoeffsImag[0];
    for (let i = 1; i <= nomPower; i++) {
        const h = nomRe * x - nomIm * y + nomKoeffsReal[i];
        nomIm = nomIm * x + nomRe * y + nomKoeffsImag[i];
        nomRe = h;
    }
    console.log(nomRe, nomIm)
        //denominator
    let denomRe = 1;
    let denomIm = 0;
    for (let i = 1; i <= denomPower; i++) {
        const h = denomRe * x - denomIm * y + denomKoeffsReal[i];
        denomIm = denomIm * x + denomRe * y + denomKoeffsImag[i];
        denomRe = h;
    }
    console.log(denomRe, denomIm);
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
    console.log(denomPower);

    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // nominator, including amplitude
        let nomRe = nomKoeffsReal[0];
        let nomIm = nomKoeffsImag[0];
        for (let i = 1; i <= nomPower; i++) {
            const h = nomRe * x - nomIm * y + nomKoeffsReal[i];
            nomIm = nomIm * x + nomRe * y + nomKoeffsImag[i];
            nomRe = h;
        }
        //denominator
        let denomRe = denomKoeffsReal[0];
        let denomIm = denomKoeffsImag[0];
        for (let i = 1; i <= denomPower; i++) {
            const h = denomRe * x - denomIm * y + denomKoeffsReal[i];
               denomIm=denomIm*x+ denomRe*y+denomKoeffsImag[i];
               denomRe=h;
        }
        // division, avoiding div by zero
        const norm = prefactor / (denomRe * denomRe + denomIm * denomIm + eps);
        //  const norm = 2 ;
        xArray[index] = norm * (nomRe * denomRe + nomIm * denomIm);
        yArray[index] = norm * (nomIm * denomRe - nomRe * denomIm);
    }
};