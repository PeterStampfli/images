/* jshint esversion:6 */

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents
} from "../libgui/modules.js";

import {
    julia
} from "./julia.js";

import {
    points
} from "./points.js";

import {
    map
} from "./mapImage.js";

export const juliaMap = {};

map.iters = 5;
map.limit = 10;

juliaMap.setup = function(gui) {
    map.iteration = map.juliaSet;
    gui.addParagraph('mapping');
    gui.add({
        type: 'number',
        params: map,
        property: 'limit',
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: map,
        property: 'iters',
        step: 1,
        min: 0,
        max: 127,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'selection',
        params: map,
        property: 'iteration',
        options: {
            'julia set': map.juliaSet,
            'inversions': map.inversions,
            'linear julia set': map.linearJuliaSet,
            'linear inversions': map.linearInversions,
            'square julia set': map.squareJuliaSet,
            'square inversions': map.squareInversions
        },
        onChange: julia.drawNewStructure
    });
};

/**
 * apply limit to the map, all pixels with radius> limit will become inactive
 * complement to 255
 * invert coordinates to get them inside limit
 * no further computation for these pixels
 */
map.radialLimit = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        const x = xArray[index];
        const y = yArray[index];
        const r2 = x * x + y * y;
        if (r2 > limit2) {
            const factor = limit2 / r2;
            xArray[index] = factor * x;
            yArray[index] = factor * y;
            structureArray[index] = 255 - structure;
        }
    }
};

//now using a line along the x-axis
map.lineLimit = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        const y = yArray[index];
        const r2 = y * y;
        if (r2 > limit2) {
            const factor = limit2 / r2;
            xArray[index] = factor * xArray[index];
            yArray[index] = factor * y;
            structureArray[index] = 255 - structure;
        }
    }
};

map.squareLimit = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        const x = xArray[index];
        const y = yArray[index];
        const x2 = x * x;
        const y2 = y * y;
        if (y2 > x2) {
            if (y2 > limit2) {
                const factor = limit2 / y2;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
                structureArray[index] = 255 - structure;
            }
        } else {
            if (x2 > limit2) {
                const factor = limit2 / x2;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
                structureArray[index] = 255 - structure;
            }
        }
    }
};

/**
 * apply limit to the map, all pixels with radius> limit will be inverted
 * calculation continues, structure results from number of inversions
 */
map.radialInversion = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const x = xArray[index];
        const y = yArray[index];
        const r2 = x * x + y * y;
        if (r2 > limit2) {
            const factor = limit2 / r2;
            xArray[index] = factor * x;
            yArray[index] = factor * y;
            structureArray[index] = 1 - structureArray[index];
        }
    }
};

map.linearInversion = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const y = yArray[index];
        const r2 = y * y;
        if (r2 > limit2) {
            const factor = limit2 / r2;
            xArray[index] = factor * xArray[index];
            yArray[index] = factor * y;
            structureArray[index] = 1 - structureArray[index];
        }
    }
};

map.squareInversion = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        const x = xArray[index];
        const y = yArray[index];
        const x2 = x * x;
        const y2 = y * y;
        if (y2 > x2) {
            if (y2 > limit2) {
                const factor = limit2 / y2;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
                structureArray[index]=1-structureArray[index];
            }
        } else {
            if (x2 > limit2) {
                const factor = limit2 / x2;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
                structureArray[index]=1-structureArray[index];
            }
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
        structureArray[index] = 255 - structureArray[index];
    }
};

// count iterations, increment for active pixels
map.countIterations = function() {
    const structureArray = map.structureArray;
    const nPixels = structureArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure < 128) {
            structureArray[index] = structure + 1;
        }
    }
};

// scale from given radius to 1 (for hyperbolic disc)

map.scale = function(radius) {
    const factor=1/radius;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        xArray[index]*=factor;
        yArray[index]*=factor;
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

// make inversions
map.inversions = function() {
    map.radialInversion(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.radialInversion(map.limit);
    }
};

// make the julia set
map.linearJuliaSet = function() {
    map.lineLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.lineLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
};

// make inversions, linear
map.linearInversions = function() {
    map.linearInversion(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.linearInversion(map.limit);
    }
};

// make the julia set
map.squareJuliaSet = function() {
    map.squareLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.squareLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
};

map.squareInversions = function() {
    map.squareInversion(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.evaluateRationalFunction();
        map.squareInversion(map.limit);
        map.countIterations();
    }
};