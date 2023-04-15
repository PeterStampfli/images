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
 * the mapping function transforms a point argument
 * (point.x,point.y) coordinates
 * point.structure: initially 0, 0 or 1, negative for invalid points, failures
 * point.region: initially 0, number of region for endpoint (if distinct regions)
 * @method map.mapping
 * @param {object}point
 */
map.mapping = function(point) {}; // default is identity

// to show the simple julia set from iterations
// make map.limit  large enough
map.juliaSet = function(point) {
    let structure = 0;
    for (let i = 0; i < iters; i++) {
        const x = point.x;
        const y = point.y;
        if ((x * x + y * y) > limit2) {
            point.structure = structure;
            return;
        }
        points.evaluate(point);
        structure = 1 - structure;
    }
    point.structure = -1;
}

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * if the mapping determines the "pixel sizes": set map.needsSizeArrayUpdate = false afterwards
 * and we need a value for the ranges of the mapping
 * @method map.startDrawing
 */
map.startDrawing = function() {
    // parameter shortcuts
    iters = map.iters;
    limit2 = map.limit * map.limit;
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
};

/**
 * make the map using the map.mapping(point) function
 * initialize map before
 * @method map.make
 */
map.make = function() {
    points.zerosAndSingularities();
    const point = {
        x: 0,
        y: 0,
        structureIndex: 0,
        region: 0,
        valid: 1
    };
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const mapping = map.mapping;
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            point.x = x;
            point.y = y;
            point.structure = 0;
            mapping(point);
            xArray[index] = point.x;
            yArray[index] = point.y;
            structureArray[index] = point.structure;
            index += 1;
            x += scale;
        }
        y += scale;
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