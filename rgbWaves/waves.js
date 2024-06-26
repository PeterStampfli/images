/* jshint esversion:6 */

// quasiperiodic wave packets


import {
    output,
    Pixels
} from "../libgui/modules.js";

import {
    map,
    julia
} from "../mappings/mapImage.js";

export const waves = {};
const sines = [];
const cosines = [];

waves.symmetry = 5;
waves.offset = 0;
waves.sum = true;

const scales = [0, 0, 0, 2, 2, 0.618, 2, 1, 0.414, 1, 0.618, 1, 0.26794];

const white = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});

const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});

const red = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 0,
    alpha: 255
});

const green = Pixels.integerOfColor({
    red: 0,
    green: 255,
    blue: 0,
    alpha: 255
});

const blue = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 255,
    alpha: 255
});

const yellow = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: 255
});

const orange = Pixels.integerOfColor({
    red: 255,
    green: 128,
    blue: 0,
    alpha: 255
});

const magenta = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 255,
    alpha: 255
});

const cyan = Pixels.integerOfColor({
    red: 0,
    green: 255,
    blue: 255,
    alpha: 255
});

const light=128;

// wavefunction

var symmetry, nDirections, offset;

function sumWave(x, y) {
    let result = Math.cos(x + offset);
    for (let n = 1; n < nDirections; n++) {
        result += Math.cos(x * cosines[n] + y * sines[n] + offset);
    }
    return result;
}

function prodWave(x, y) {
    let result = Math.cos(x + offset);
    for (let n = 1; n < nDirections; n++) {
        result *= Math.cos(x * cosines[n] + y * sines[n] + offset);
    }
    return result;
}

const color = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
};

waves.map = function() {
    symmetry = waves.symmetry;
    const scale = scales[symmetry];
    const scale2 = scale * scale;
    var dAngle;
    var waveFunction;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    if (waves.sum) {
        waveFunction = sumWave;
    } else {
        waveFunction = prodWave;
    }
    // setting up the directions
    if ((symmetry & 1) !== 0) {
        offset = Math.PI / 2 * (waves.offset + 1);
        nDirections = symmetry
    } else {
        offset = Math.PI / 2 * waves.offset;
        nDirections = symmetry / 2;
    }
    sines.length = nDirections;
    cosines.length = nDirections;
    dAngle = 2 * Math.PI / symmetry;
    for (let n = 0; n < nDirections; n++) {
        sines[n] = Math.sin(n * dAngle);
        cosines[n] = Math.cos(n * dAngle);
    }
    // make values and determine range
    for (let index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        basicArray[index] = waveFunction(x, y) > 0 ? 255 : 0;
        scaledArray[index] = waveFunction(scale * x, scale * y) > 0 ? 255 : 0;
        scaled2Array[index] = waveFunction(scale2 * x, scale2 * y) > 0 ? 255 : 0;
    }
};

waves.grb = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        color.red = scaledArray[index];
        color.green = basicArray[index];
        color.blue = scaled2Array[index];
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.brg = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        color.red = scaledArray[index];
        color.green = scaled2Array[index];
        color.blue = basicArray[index];
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.magentaGreen = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        color.red = basicArray[index];
        color.green = scaledArray[index];
        color.blue = basicArray[index];
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.greenMagenta = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        color.red = scaledArray[index];
        color.green = basicArray[index];
        color.blue = scaledArray[index];
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.blackWhite = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        color.red = basicArray[index];
        color.green = basicArray[index];
        color.blue = basicArray[index];
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.strongWeak = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        const light = Math.floor(0.3333 * (basicArray[index] * 2 + scaledArray[index]))
        color.red = light;
        color.green = light;
        color.blue = light;
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.weakStrong = function() {
    const pixelsArray = output.pixels.array;
    const basicArray = map.xArray;
    const scaledArray = map.yArray;
    const scaled2Array = map.structureArray;
    const length = basicArray.length;
    for (var index = 0; index < length; index++) {
        const light = Math.floor(0.3333 * (basicArray[index] + scaledArray[index] * 2))
        color.red = light;
        color.green = light;
        color.blue = light;
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};

waves.draw = waves.grb;

waves.setup = function(gui) {
    gui.add({
        type: 'number',
        params: waves,
        property: 'symmetry',
        step: 1,
        min: 3,
        max: 12,
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: waves,
        property: 'offset',
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'boolean',
        params: waves,
        property: 'sum',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'selection',
        params: waves,
        property: 'draw',
        options: {
            'green red blue': waves.grb,
            'blue red green': waves.brg,
            'green magenta': waves.greenMagenta,
            'magenta green': waves.magentaGreen,
            'black & white': waves.blackWhite,
            'bw strong weak': waves.strongWeak,
            'bw weak strong': waves.weakStrong
        },
        onChange: function() {
            julia.drawNewStructure();
        }
    })
    map.mapping = waves.map;
};