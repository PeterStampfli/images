/* jshint esversion:6 */

import {
    Pixels,
    output
} from "../libgui/modules.js";

import {
    julia
} from "./julia.js";

import {
    points
} from "./points.js";

export const map = {};

var iters, limit2;
map.iters = 5;
map.limit = 10;
map.setup = function(gui) {
    gui.addParagraph('mapping');
    gui.add({
        type: 'number',
        params: map,
        property: 'limit',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: map,
        property: 'iters',
        step: 1,
        min: 0,
        onChange: julia.drawNewStructure
    });
};


// map data, dimensions same as canvas, if not => create new arrays

map.width = 1;
map.height = 1;

// map data, accessible from the outside
// the mapped coordinates
map.xArray = new Float32Array(1);
map.yArray = new Float32Array(1);

// structure of inversion, 0 or 1, negative values for "invalid" points
// iteration fail
map.structureArray = new Uint8Array(1);

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * if the mapping determines the "pixel sizes": set map.needsSizeArrayUpdate = false afterwards
 * and we need a value for the ranges of the mapping
 * * initialize the map positions and structure
 * @method map.startDrawing
 */
map.init = function() {
    // initialize map
    map.needsSizeArrayUpdate = true;
    map.rangeValid = false;
    output.pixels.update();
    output.isDrawing = true;
    if ((map.width !== output.canvas.width) || (map.height !== output.canvas.height)) {
        console.log('new map size');
        map.width = output.canvas.width;
        map.height = output.canvas.height;
        const size = map.width * map.height;
        map.xArray = new Float32Array(size);
        map.yArray = new Float32Array(size);
        map.structureArray = new Uint8Array(size);
    }
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            xArray[index] = x;
            yArray[index] = y;
            structureArray[index] = 0;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};

/**
 * make the julia set map using the map.mapping(point) function
 * initialize map before
 * @method map.make
 */
map.juliaSet = function() {
    points.zerosAndSingularities();
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const amplitudeReal = amplitude.real;
    const amplitudeImag = amplitude.imag;
    const nPixels = map.length;
    const iters = map.iters;
    const limit2 = map.limit * map.limit;
    const zerosLength = zerosRe.length;
    const singuLength = singuRe.length;
    const eps=0.0001;
    for (var index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        let structure = structureArray[index];
        let outOfBounds = false;
        for (let iter = 0; iter < iters; i++) {
            if ((x * x + y * y) > limit2) {
                outOfBounds = true;
                break;
            }
            // nominator, including amplitude
            let nomRe = amplitudeReal;
            let nomIm = amplitudeImag;
            for (let i = 0; i < zerosLength; i++) {
                const re = x - zerosRe[i];
                const im = y - zerosIm[i];
                const h = re * nomRe - im * nomIm;
                nomIm = re * nomIm + im * nomRe;
                nomRe = h;
            }
            //denominator
            let denRe = 1;
            let denIm = 0;
            for (let i = 0; i < singuLength; i++) {
                const re = x - singuRe[i];
                const im = y - singuIm[i];
                const h = re * denRe - im * denIm;
                denIm = re * denIm + im * denRe;
                denRe = h;
            }
            // division, avoiding div by zero
            const norm = 1 / (denRe * denRe + denIm * denIm + eps);
            x = norm * (nomRe * denRe + nomIm * denIm);
            y = norm * (nomIm * denRe - nomRe * denIm);
            structure = 1 - structure;
        }
        xArray[index] = x;
        yArray[index] = y;
        structureArray[index] = outOfBounds ? structure : -1;
    }
};


// integer colors for structure
const invalidColor = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
});

const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});

const white = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});

/**
 * show structure of the map: color depending on the structure index
 * using the map.colorTable
 * @method map.drawStructure
 */
map.drawStructure = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const length = map.width * map.height;
    const pixelsArray = output.pixels.array;
    const structureArray = map.structureArray;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        let structure = structureArray[index];
        if (structure === 0) {
            pixelsArray[index] = white;
        } else if (structure === 1) {
            pixelsArray[index] = black;
        } else {
            pixelsArray[index] = invalidColor;
        }
    }
    output.pixels.show();
};