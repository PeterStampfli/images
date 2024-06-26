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
} from "../mappings/mapImage.js";

import {
    kaleidoscope
} from "../mappings/kaleidoscope.js";

export const juliaMap = {};
juliaMap.automaticExpansion = false;
juliaMap.nIntervals=10000;
juliaMap.inverted = false;

juliaMap.setup = function(gui) {
    map.iters = 1;
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

    map.iteration = map.juliaSet;
    // use only (piecewise) conformal mappings
 /*   gui.add({
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
    });*/
    /*
    gui.add({
        type: 'boolean',
        params: juliaMap,
        property: 'inverted',
        onChange: julia.drawNewStructure
    });
    */
    /*
    gui.add({
        type: 'boolean',
        params: juliaMap,
        property: 'automaticExpansion',
        labelText: 'automatic',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: juliaMap,
        property: 'nIntervals',
        min: 1,
        labelText:'intervals',
        onChange: julia.drawNewStructure
    });
    */
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

// automatic redistribution of points
// density prop to r (distance from origin)

const nPixelsInterval = [];
const newRadius = [];

// redistributing points
function redistribute() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const nIntervals=juliaMap.nIntervals;
    nPixelsInterval.length=nIntervals
    nPixelsInterval.fill(0);
    newRadius.length = nIntervals + 1;
    const nIntervalsM1 = nIntervals - 1;
    for (let index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const r = Math.hypot(x, y);
            // r goes from 0 to 1
            const i = Math.min(Math.floor(nIntervals * r), nIntervalsM1);
            nPixelsInterval[i] += 1;
        }
    }
    // normalize sum of pixels in intervals to 1
    let sum = 0;
    for (let i = 0; i < nIntervals; i++) {
        sum += nPixelsInterval[i];
    }
    const normFactor = 1 / sum;
    for (let i = 0; i < nIntervals; i++) {
        nPixelsInterval[i] *= normFactor;
    }
    // determine the new radii
    // changing the width of intervals and shifting positions
    // to get a uniform distribution of pixels
    // using that the sum of nPixelsInterval[i]=1
    newRadius[0] = 0;
    for (let i = 0; i < nIntervals; i++) {
        newRadius[i + 1] = newRadius[i] + nPixelsInterval[i];
    }
    // change that number of pixels in an interval is proportional to its radius
    // by changing widths and positions of intervals
    for (let i = 0; i <= nIntervals; i++) {
        newRadius[i] = Math.sqrt(newRadius[i]);
    }
    // redistribute the pixels
    // by moving in radial direction
    // based on position in original interval and using linear interpolation
    const eps = 1e-5;
    const nIntervalsMEps = nIntervals - eps;
    for (let index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            const r = Math.hypot(x, y);
            if (r > 1) {
                structureArray[index] = 128;
            }
            // no expansion at origin
            else if (r > eps) {
                const position = Math.min(nIntervals * r, nIntervalsMEps);
                // get original interval that contains pixel
                const i = Math.floor(position);
                // find relative position in original interval
                const relative = position - i;
                // linear interpolation
                const expandedRadius = newRadius[i] * (1 - relative) + newRadius[i + 1] * relative;
                const factor = expandedRadius / r;
                xArray[index] = factor * x;
                yArray[index] = factor * y;
            }
        }
    }
}

function logDistribution() {
    const eps = 1e-10;
    console.log("i,nPixelsInterval,radius,density,density/radius");
    for (let i = 0; i < 100; i++) {
        const denom = newRadius[i + 1] - newRadius[i];
        if (denom > eps) {
            const density = nPixelsInterval[i] / denom;
            const radius = 0.5 * (newRadius[i] + newRadius[i + 1]);
            console.log(i, nPixelsInterval[i], radius, density, density / radius);
        } else {
            console.log(i);
        }
    }
}

map.nothing = function() {
    map.inversion();
    if (juliaMap.automaticExpansion) {
        redistribute();
      //  logDistribution();
    } 
};

map.juliaSet = function() {
  //  map.inversion();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
 //   map.set(map.limit);
    if (juliaMap.automaticExpansion) {
        redistribute();
       // logDistribution();
    } 
};

map.juliaComplement = function() {
    map.inversion();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.complement(map.limit);
    if (juliaMap.automaticExpansion) {
        redistribute();
      //  logDistribution();
    } 
};

map.juliaAll = function() {
    map.inversion();
    for (let i = 0; i < map.iters; i++) {
        map.mapping();
    }
    map.all(map.limit);
    if (juliaMap.automaticExpansion) {
        redistribute();
     //   logDistribution();
    } 
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
    if (juliaMap.automaticExpansion) {
        redistribute();
       // logDistribution();
    } 
};

// for the pseudo mandelbrot
// save the iinitial coordinates, and add them to the iterated function
// set initial coordinate to zero

map.initialXArray = new Float32Array(1);
map.initialYArray = new Float32Array(1);

map.setInitialXY = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const nPixels = xArray.length;
    if (nPixels !== map.initialXArray.length) {
        map.initialXArray = new Float32Array(nPixels);
        map.initialYArray = new Float32Array(nPixels);
    }
    const structureArray = map.structureArray;
    const initialXArray = map.initialXArray;
    const initialYArray = map.initialYArray;
    for (var index = 0; index < nPixels; index++) {
        initialXArray[index] = xArray[index];
        xArray[index]=0;
        initialYArray[index] = yArray[index];
        yArray[index]=0;
    }
};

map.addInitialXY = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const initialXArray = map.initialXArray;
    const initialYArray = map.initialYArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        xArray[index] += initialXArray[index];
        yArray[index] += initialYArray[index];
    }
};

