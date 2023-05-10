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
    map
} from "./mapImage.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

export const juliaMap = {};

map.iters = 5;
map.param = 1;

juliaMap.setup = function(gui) {
    gui.addParagraph('<strong>mapping</strong>');
    gui.add({
        type: 'number',
        params: map,
        property: 'param',
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
    map.iteration = map.nothing;
    gui.add({
        type: 'selection',
        params: map,
        property: 'iteration',
        options: {
            'nothing': map.nothing,
            'joukowski': map.joukowski
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

// mirroring at the x-axis

map.reflectionXAxis = function() {
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = yArray.length;
    for (var index = 0; index < nPixels; index++) {
        const y = yArray[index];
        if (y < 0) {
            yArray[index] = -y;
            structureArray[index] = 1 - structureArray[index];
        }
    }
};

// joukowski function, scaled by 2
// unit circle maps to real axis, -1 ... +1

map.joukowskiTransform = function() {
    const eps = 0.001;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const denom = 1 / (x * x + y * y + eps);
            xArray[index] = 0.5 * (x + denom * x);
            yArray[index] = 0.5 * (y - denom * y);
        }
    }
};

// cayley transform
// maps real axis to unit circle

map.cayleyTransform = function() {
    const eps = 0.001;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const denom = 1 / (x * x + (y + 1) * (y + 1) + eps);
            xArray[index] = denom * (x * x - 1 + y * y);
            yArray[index] = -2 * denom * x;
        }
    }
};

map.halfPlaneLimit = function() {
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = yArray.length;
    for (var index = 0; index < nPixels; index++) {
        if ((structureArray[index] < 128) && (yArray[index] < 0)) {
            structureArray[index] = 255 - structureArray[index];
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
                structureArray[index] = 1 - structureArray[index];
            }
        } else {
            if (x2 > limit2) {
                const factor = limit2 / x2;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
                structureArray[index] = 1 - structureArray[index];
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

map.nothing = function() {};

map.joukowski = function() {
    map.joukowskiTransform();
    map.scale(map.param);
    map.joukowskiTransform();
    map.scale(map.param);
    // map.radialInversion(1);
};
