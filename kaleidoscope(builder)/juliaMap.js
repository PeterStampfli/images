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

// structure of inversion, 0 or 1
map.structureArray = new Uint8Array(1);

// selection of points for computation
// 0 for points that should not be precessed
map.selectArray = new Uint8Array(1);

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
        map.selectArray = new Uint8Array(size);
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
    map.selectArray.fill(1);
};

/**
 * apply limit to the map, all pixels with radius> limit will be invalid
 * (structure)
 */
map.radialLimit = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const selectArray = map.selectArray;
    const nPixels = map.length;
    for (var index = 0; index < nPixels; index++) {
        if (selectArray[index] === 0) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        if ((x * x + y * y) > limit2) {
            selectArray[index] = 0;
        }
    }
};

// make the julia set
map.juliaSet = function() {
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.radialLimit(map.limit);
    }
}

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