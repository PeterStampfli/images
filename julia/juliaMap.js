/* jshint esversion:6 */

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents
} from "../libgui/modules.js";

import {
    map,
    julia
} from "./mapImage.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

export const juliaMap = {};
const rosette = {};
rosette.order = 1;
rosette.rPower = 1;
rosette.mirrorSymmetric = false;

juliaMap.setup = function(gui) {
    map.iters = 5;
    map.limit = 10;
    map.mapping = function() {
        console.error('map.mapping is undefined');
    };
    gui.addParagraph('<strong>initial rosette</strong>');
    gui.add({
        type: 'number',
        params: rosette,
        property: 'order',
        min: 1,
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: rosette,
        property: 'rPower',
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: rosette,
        property: 'mirrorSymmetric',
        labelText: 'mirror',
        onChange: julia.drawNewStructure
    });

    gui.addParagraph('<strong>iterated mapping</strong>');
map.itersController=gui.add({
        type: 'number',
        params: map,
        property: 'iters',
        step: 1,
        min: 0,
        max: 127,
        onChange: julia.drawNewStructure
    });
    map.limitController = map.itersController.add({
        type: 'number',
        params: map,
        property: 'limit',
        min: 0,
        onChange: julia.drawNewStructure
    });

    map.iteration = map.juliaSet;
    // use only (piecewise) conformal mappings
    gui.add({
        type: 'selection',
        params: map,
        property: 'iteration',
        options: {
            'nothing': map.nothing,
            'julia set approximation': map.juliaSetApproximation,
            'julia set': map.juliaSet,
            'julia all': map.juliaAll,
            'mandelbrot approximation': map.mandelbrotApproximation,
            'mandelbrot': map.mandelbrot,
            'mandelbrot all': map.mandelbrotAll
        },
        onChange: julia.drawNewStructure
    });
};

// initial rosette
map.rosette = function() {
    const order = rosette.order;
    const rPower = rosette.rPower / 2;
    const iAlpha = 1 / rosette.alpha;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const nPixels = xArray.length;
    if (rosette.mirrorSymmetric) {
        for (let index = 0; index < nPixels; index++) {
            let x = xArray[index];
            let y = yArray[index];
            const phi = order * Math.atan2(y, x);
            const r2 = x * x + y * y;
            let r = Math.pow(r2, rPower);
            xArray[index] = r * Math.cos(phi);
            yArray[index] = r * Math.cos(phi + phi);
        }
    } else {
        if (rosette.order === 1) {
            return;
        }
        for (let index = 0; index < nPixels; index++) {
            let x = xArray[index];
            let y = yArray[index];
            const phi = order * Math.atan2(y, x);
            const r2 = x * x + y * y;
            let r = Math.pow(r2, rPower);
            xArray[index] = r * Math.cos(phi);
            yArray[index] = r * Math.sin(phi);
        }
    }

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
            structureArray[index] = 255 - structure;
        }
    }
};

/**
 * apply limit to the map, all pixels with radius> limit will become inactive
 * complement to 255
 * invert coordinates to get them inside limit
 * no further computation for these pixels
 */
map.set = function(limit) {
    const iLimit = 1 / limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        const x = iLimit * xArray[index];
        const y = iLimit * yArray[index];
        const r2 = x * x + y * y;
        if (r2 < 1) {
            structureArray[index] = 0;
            xArray[index] = x;
            yArray[index] = y;
        } else {
            structureArray[index] = 128;
        }
    }
};

// all pixels, invert if outside
map.all = function(limit) {
    const iLimit = 1 / limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    structureArray.fill(0);
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        const x = iLimit * xArray[index];
        const y = iLimit * yArray[index];
        const r2 = x * x + y * y;
        if (!isFinite(r2)) {
            xArray[index] = 0;
            yArray[index] = 0;
        } else if (r2 < 1) {
            xArray[index] = x;
            yArray[index] = y;
        } else {
            xArray[index] = x / r2;
            yArray[index] = y / r2;
        }
    }
};

/**
 * invert all pixels
 */
map.complement = function(limit) {
    const limit2 = limit * limit;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const x = xArray[index];
        const y = yArray[index];
        const r2 = x * x + y * y;
        if (!isFinite(r2)) {
            structureArray[index] = 128;
            xArray[index] = 0;
            yArray[index] = 0;
        } else if (r2 > limit2) {
            const factor = limit / r2;
            xArray[index] = factor * x;
            yArray[index] = factor * y;
            structureArray[index] = 0;
        } else {
            structureArray[index] = 128;
            xArray[index] = 0;
            yArray[index] = 0;
        }
    }
};

/**
 * invert select: needed for simple julia set display
 *  for showing structure of "blocked" pixels
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

// scale from given length to 1 (for hyperbolic disc)

map.scale = function(length) {
    const factor = 1 / length;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        xArray[index] *= factor;
        yArray[index] *= factor;
    }
};

map.nothing = function() {
    map.rosette();
};

map.juliaSet = function() {
    map.rosette();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.set(map.limit);
};


map.juliaAll = function() {
    map.rosette();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.all(map.limit);
};

map.juliaSetApproximation = function() {
    map.rosette();
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.radialLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
    map.scale(map.limit);
};

// for the pseudo mandelbrot
// save the iinitial coordinates, and add them to the iterated function

map.setInitialXY = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    if (xArray.length !== map.initialXArray.length) {
        map.initialXArray = new Float32Array(xArray.lenght);
        map.initialYArray = new Float32Array(xArray.lenght);
    }
    const structureArray = map.structureArray;
    const initialXArray = map.xArray;
    const initialYArray = map.yArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        initialXArray[index] = xArray[index];
        initialYArray[index] = yArray[index];
    }
};

map.addInitialXY = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const initialXArray = map.xArray;
    const initialYArray = map.yArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        xArray[index] += initialXArray[index];
        yArray[index] += initialYArray[index];
    }
};

map.mandelbrot = function() {
    map.setInitialXY();
    map.rosette();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
    }
    map.set(map.limit);
};

map.mandelbrotAll = function() {
    map.setInitialXY();
    map.rosette();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
    }
    map.all(map.limit);
};

map.mandelbrotApproximation = function() {
    map.setInitialXY();
    map.rosette();
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
        map.radialLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
    map.scale(map.limit);
};