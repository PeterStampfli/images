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
juliaMap.expansion = 2;
juliaMap.automaticExpansion = true;
juliaMap.inverted = false;

juliaMap.setup = function(gui) {
    map.iters = 5;
    map.limit = 10;
    map.mapping = function() {
        console.error('map.mapping is undefined');
    };

    gui.addParagraph('<strong>iterated mapping</strong>');
    map.itersController = gui.add({
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
            'julia complement': map.juliaComplement,
            'julia all': map.juliaAll,
            'mandelbrot approximation': map.mandelbrotApproximation,
            'mandelbrot': map.mandelbrot,
            'mandelbrot complement': map.mandelbrotComplement,
            'mandelbrot all': map.mandelbrotAll
        },
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'boolean',
        params: juliaMap,
        property: 'inverted',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: juliaMap,
        property: 'expansion',
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: juliaMap,
        property: 'automaticExpansion',
        labelText: 'automatic',
        onChange: julia.drawNewStructure
    });
};

map.inversion = function() {
    if (!juliaMap.inverted) {
        return;
    }
    const xArray = map.xArray;
    const yArray = map.yArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const x = xArray[index];
        const y = yArray[index];
        const factor = 1 / (x * x + y * y);
        xArray[index] = factor * x;
        yArray[index] = factor * y;
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
            structureArray[index] = 0;
            xArray[index] = 0;
            yArray[index] = 0;
        } else if (r2 > limit2) {
            const factor = limit / r2;
            xArray[index] = factor * x;
            yArray[index] = factor * y;
            structureArray[index] = 0;
        } else {
            structureArray[index] = 128;
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

// expand points near origin to get a more even distribution
// depends on expansion parameter
map.expand = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const expansion = juliaMap.expansion;
    const expansionM1 = expansion - 1;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const r = Math.hypot(x, y);
            const factor = expansion / (1 + expansionM1 * r);
            xArray[index] = factor * x;
            yArray[index] = factor * y;
        }
    }
};

// automatic redistribution of points
// density prop to r (distance from origin)

const distribution = [];
const newRadius = [];
const distributionBins = 1000;
distribution.length = distributionBins;
newRadius.length = distributionBins + 1;

// making the distribution
function makeDistribution() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    distribution.fill(0);
    const distributionBinsM1 = distributionBins - 1;
    for (let index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const r = Math.hypot(x, y);
            // r goes from 0 to 1
            const bin = Math.min(Math.floor(distributionBins * r), distributionBinsM1);
            distribution[bin] += 1;
        }
    }
    // normalize
    let sum = 0;
    for (let i = 0; i < distributionBins; i++) {
        sum += distribution[i];
    }
    const normFactor = 1 / sum;
    for (let i = 0; i < distributionBins; i++) {
        distribution[i] *= normFactor;
    }
    // determine the new radii
    // equal distribution
    newRadius[0] = 0;
    for (let i = 0; i < distributionBins; i++) {
        newRadius[i + 1] = newRadius[i] + distribution[i];
    }
    // density propto r
    for (let i = 0; i <= distributionBins; i++) {
        newRadius[i] = Math.sqrt(newRadius[i]);
    }
    // expand
    const eps = 1e-5;
    const distributionBinsMEps = distributionBins - eps;
    for (let index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const r = Math.hypot(x, y);
            // no expansion at origin
            if (r > eps) {
                // r goes from 0 to 1
                // use linear interpolation to get new radius
                const position = Math.min(distributionBins * r, distributionBinsMEps);
                const bin = Math.floor(position);
                const fraction = position - bin;
                const expandedRadius = newRadius[bin] * (1 - fraction) + newRadius[bin + 1] * fraction;
                const factor = expandedRadius / r;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
            }
        }
    }
}

function logDistribution() {
    const eps = 1e-10;
    console.log("i,distribution,radius,density,density/radius");
    for (let i = 0; i < 100; i++) {
        const denom = newRadius[i + 1] - newRadius[i];
        if (denom > eps) {
            const density = distribution[i] / denom;
            const radius = 0.5 * (newRadius[i] + newRadius[i + 1]);
            console.log(i, distribution[i], radius, density, density / radius);
        } else {
            console.log(i);
        }
    }
}

map.nothing = function() {
    map.inversion();
    map.expand();
};

map.juliaSet = function() {
    map.inversion();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.set(map.limit);
    if (juliaMap.automaticExpansion) {
        makeDistribution();
        logDistribution();
    } else {
        map.expand();
    }

};

map.juliaComplement = function() {
    map.inversion();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.complement(map.limit);
    map.expand();
};

map.juliaAll = function() {
    map.inversion();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.all(map.limit);
    map.expand();
};

map.juliaSetApproximation = function() {
    map.inversion();
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.radialLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
    map.scale(map.limit);
    map.expand();
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
    map.inversion();
    map.setInitialXY();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
    }
    map.set(map.limit);
    map.expand();
};

map.mandelbrotComplement = function() {
    map.inversion();
    map.setInitialXY();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
    }
    map.complement(map.limit);
    map.expand();
};

map.mandelbrotAll = function() {
    map.inversion();
    map.setInitialXY();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
    }
    map.all(map.limit);
    map.expand();
};

map.mandelbrotApproximation = function() {
    map.inversion();
    map.setInitialXY();
    map.radialLimit(map.limit);
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
        map.addInitialXY();
        map.radialLimit(map.limit);
        map.countIterations();
    }
    map.invertSelect();
    map.scale(map.limit);
    map.expand();
};