/* jshint esversion:6 */

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents
} from "../libgui/modules.js";

import {
    map,julia
} from "./mapImage.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

export const functions = {};

map.n = 5;
map.param = 0.5;

functions.setup = function(gui) {
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
        property: 'n',
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
        labelText: 'mapping',
        options: {
            'nothing': map.nothing,
            'joukowski': map.joukowski,
            'n-joukowski': map.nJoukowski,
            'n roots': map.nRoots,
            'sum of singularities': map.sumOfSingularities,
            'alternating sum of singularities': map.alternatingSumOfSingularities,
            'product of singularities': map.productOfSingularities
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

// joukowski function,
// unit circle maps to real axis, -2 ... +2

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
            xArray[index] = map.param * (x + denom * x);
            yArray[index] = map.param * (y - denom * y);
        }
    }
};

function power(z, x, y, n) {
    let real = x;
    let imag = y;
    for (let i = 1; i < n; i++) {
        const h = real * x - imag * y;
        imag = real * y + x * imag;
        real = h;
    }
    z.real = real;
    z.imag = imag;
}

function invert(z) {
    eps = 1e-100;
    let real = z.real;
    let imag = z.imag;
    const denom = 1 / (real * real + imag * imag + eps);
    z.real = denom * real;
    z.imag = -denom * imag;
}

map.nJoukowskiTransform = function() {
    const n = map.n;
    const radius = Math.pow(1 / n, 1 / (n + 1));
    const a = 1 / (1 / radius + Math.pow(radius, n));
    const eps = 1e-100;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const p = {};
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            power(p, x, y, n);
            const denom = 1 / (x * x + y * y + eps);
            xArray[index] = a * (denom * x + p.real);
            yArray[index] = a * (-denom * y + p.imag);
        }
    }
};


map.nRootsTransform = function() {
    const n = map.n;
    const radius = Math.pow(1 / n, 1 / (n + 1));
    const a = 1 / (1 / radius + Math.pow(radius, n));
    const eps = 1e-100;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const p = {};
    const d = {};
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            power(p, x, y, n);
            power(d, x, y, n);
            p.real += 1;
            d.real -= 0.7;
            const denom = 1 / (d.real * d.real + d.imag * d.imag + eps);
            d.real *= denom;
            d.imag *= -denom;

            xArray[index] = map.param * (p.real * d.real - p.imag * d.imag);
            yArray[index] = map.param * (p.imag * d.real + p.real * d.imag);
        }
    }
};

map.productOfSingularitiesTransform = function() {
    const n = map.n;
    const radius = 1;
    const eps=1e-100;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const p = {};
    const d = {};
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            power(d, x, y, n);
            d.real -= 1;
            const denom = 1 / (d.real * d.real + d.imag * d.imag + eps);
            d.real *= denom;
            d.imag *= -denom;

            xArray[index] = map.param * d.real;
            yArray[index] = map.param * d.imag;
        }
    }
};

map.starPoints = function(radius, n, relAngle) {
    const result = {};
    result.real = [];
    result.imag = [];
    const dAngle = 2 * Math.PI / n;
    for (let i = 0; i < n; i++) {
        const angle = (i + relAngle) * dAngle;
        result.real.push(Math.cos(angle));
        result.imag.push(Math.sin(angle));
    }
    return result;
};

map.sumSingularities = function(result, x, y, positions) {
    let real = 0;
    let imag = 0;
    const eps = 1e-100;
    const realPos = positions.real;
    const imagPos = positions.imag;
    const lenght = positions.real.length;
    for (let i = 0; i < lenght; i++) {
        const dx = x - realPos[i];
        const dy = y - imagPos[i];
        const denom = 1 / (dx * dx + dy * dy + eps);
        real += denom * dx;
        imag -= denom * dy;
    }
    result.real = real;
    result.imag = imag;
};

map.alternatingSumSingularities = function(result, x, y, positions) {
    let real = 0;
    let imag = 0;
    const eps = 1e-100;
    const realPos = positions.real;
    const imagPos = positions.imag;
    const lenght = positions.real.length;
    let factor=1;
    for (let i = 0; i < lenght; i++) {
        factor=-factor;
        const dx = x - realPos[i];
        const dy = y - imagPos[i];
        const denom = factor / (dx * dx + dy * dy + eps);
        real += denom * dx;
        imag -= denom * dy;
    }
    result.real = real;
    result.imag = imag;
};

map.sumOfSingularitiesTransform = function() {
    const n = map.n;
    const radius = 1;
    const eps=1e-100;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const p = {};
    const d = {};
    const positions=map.starPoints(1,n,0);
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            power(d, x, y, n);
            map.sumSingularities(d,x,y,positions);
            let denom=1/(x*x+y*y+eps);
            denom=0;

            xArray[index] = map.param * (d.real+denom*x);
            yArray[index] = map.param * (d.imag-denom*y);
        }
    }
};

map.alternatingSumOfSingularitiesTransform = function() {
    const n = map.n;
    const radius = 1;
    const eps=1e-100;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    const p = {};
    const d = {};
    const positions=map.starPoints(1,n,0);
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            const x = xArray[index];
            const y = yArray[index];
            power(d, x, y, n);
            map.alternatingSumSingularities(d,x,y,positions);
            let denom=1/(x*x+y*y+eps);
            denom=0;

            xArray[index] = map.param * (d.real+denom*x);
            yArray[index] = map.param * (d.imag-denom*y);
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
    //   map.joukowskiTransform();
    // map.radialInversion(1);
};

map.nJoukowski = function() {
    map.nJoukowskiTransform();
    //   map.joukowskiTransform();
    //   map.scale(map.param);
    //   map.radialInversion(1);
};


map.nRoots = function() {
    map.nRootsTransform();
    //   map.joukowskiTransform();
    //   map.scale(map.param);
    //   map.radialInversion(1);
};

map.sumOfSingularities = function() {
    map.sumOfSingularitiesTransform();
    //   map.joukowskiTransform();
    //   map.scale(map.param);
    //   map.radialInversion(1);
};
map.alternatingSumOfSingularities = function() {
    map.alternatingSumOfSingularitiesTransform();
    //   map.joukowskiTransform();
    //   map.scale(map.param);
    //   map.radialInversion(1);
};

map.productOfSingularities = function() {
    map.productOfSingularitiesTransform();
    //   map.joukowskiTransform();
    //   map.scale(map.param);
    //   map.radialInversion(1);
};