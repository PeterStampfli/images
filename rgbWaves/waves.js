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
waves.scale = 0.618;
waves.offset = 0;
waves.sum = true;






waves.setup = function(gui) {
    gui.add({
        type: 'number',
        params: waves,
        property: 'symmetry',
        step: 1,
        min: 1,
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
    }).add({
        type: 'number',
        params: waves,
        property: 'scale',
        min: 0,
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
    })
    map.mapping = waves.map;
};

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
    const scale = waves.scale;
    const scale2 = scale * scale;
    var dAngle;
    var waveFunction;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const rArray = map.xArray;
    const gArray = map.yArray;
    const bArray = map.structureArray;
    const structureArray = map.structureArray;
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
        rArray[index] = waveFunction(scale * x, scale * y) > 0 ? 255 : 0;
        gArray[index] = waveFunction(x, y) > 0 ? 255 : 0;
        bArray[index] = waveFunction(scale2 * x, scale2 * y) > 0 ? 255 : 0;
    }
};

waves.draw = function() {
    const pixelsArray = output.pixels.array;
    const rArray = map.xArray;
    const gArray = map.yArray;
    const bArray = map.structureArray;
    const length = gArray.length;
    for (var index = 0; index < length; index++) {
        color.red = rArray[index];
        color.green = gArray[index];
        color.blue = bArray[index];
        pixelsArray[index] = Pixels.integerOfColor(color);

    }
    output.pixels.show();
};