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

map.iters = 1;
map.limit = 10;
map.setup = function(gui) {
    gui.addParagraph('mapping');
    gui.add({
        type: 'number',
        params: map,
        property: 'limit',
        min:0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: map,
        property: 'iters',
        step: 1,
        min: 0,
        max:127,
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

// structure info
// for julia set structure of inversion, 0 or 1
// active pixels: value from 0 to 127
// inactive (invalid) pixels: value from 128 to 255
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
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            xArray[index] = x;
            yArray[index] = y;
            index += 1;
            x += scale;
        }
        y += scale;
    }
    map.structureArray.fill(0);
};

/**
 * apply limit to the map, all pixels with radius> limit will become inactive
 * complement to 255
 * no further computation for these pixels
 */
map.radialLimit = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
    	const structure=structureArray[index];
        if (structure >=128) {
              continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        if ((x * x + y * y) > limit2) {
            structureArray[index] =255- structure;
        }
    }
};

/**
 * invert select: needed for simple julia set display
 *  for showing structure of "blocked" pixels
 *  assuming active points have value select=1 and 'blocked' pixels value 0
 */
map.invertSelect = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    for (var index = 0; index < nPixels; index++) {
            structureArray[index] = 255-structureArray[index];
    }
};

// count iterations, increment for active pixels
map.countIterations = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    for (var index = 0; index < nPixels; index++) {
            const structure=structureArray[index];
            if (structure<128){
                structureArray[index]=structure+1;
            }
    }
};

// make the julia set
map.juliaSet = function() {
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
               map.evaluateRationalFunction();
              map.radialLimit(map.limit);
              map.countIterations();
    }
    map.invertSelect();
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
 * show structure of the map: color depending on the structure index (even/odd)
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
        const structure=structureArray[index];
        if (structure <128) {
            if ((structure&1) ===0) {
                pixelsArray[index] = white;
            } else  {
                pixelsArray[index] = black;
            }
        } else {
            pixelsArray[index] = invalidColor;
        }
    }
    output.pixels.show();
};