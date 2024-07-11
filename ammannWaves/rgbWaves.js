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

waves.symmetry = 8;
waves.offset = 0;
waves.sum = true;
waves.drawOn=true;

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
    green: 168,
    blue: 40,
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

const darkGrey = Pixels.integerOfColor({
    red: 85,
    green: 85,
    blue: 85,
    alpha: 255
});


const lightGrey = Pixels.integerOfColor({
    red: 170,
    green: 170,
    blue: 170,
    alpha: 255
});

const rose = Pixels.integerOfColor({
    red: 255,
    green: 128,
    blue: 128,
    alpha: 255
});

const darkRed = Pixels.integerOfColor({
    red: 170,
    green: 0,
    blue: 0,
    alpha: 255
});

const darkMagenta = Pixels.integerOfColor({
    red: 170,
    green: 0,
    blue: 170,
    alpha: 255
});

const yellowGreen = Pixels.integerOfColor({
    red: 170,
    green: 255,
    blue: 0,
    alpha: 255
});

const violett = Pixels.integerOfColor({
    red: 170,
    green: 0,
    blue: 255,
    alpha: 255
});

const colorsGRB = [black, green, red, yellow, blue, cyan, magenta, white, black, green, red, yellow, blue, cyan, magenta, white];
const colorsBRG = [black, blue, red, magenta, green, cyan, yellow, white, black, blue, red, magenta, green, cyan, yellow, white];
const colorsBW = [black, white, black, white, black, white, black, white, black, white, black, white, black, white, black, white];
const colorsDarkLight = [black, blue, darkRed, darkMagenta, rose, orange, yellow, white, black, blue, darkRed, darkMagenta, rose, orange, yellow, white];
const colorsGreys = [black, darkGrey, lightGrey, white, black, darkGrey, lightGrey, white, black, darkGrey, lightGrey, white, black, darkGrey, lightGrey, white];
const colorsMagentaGreen8 = [black, blue, violett, magenta, green, yellowGreen, yellow, white, black, blue, violett, magenta, green, yellowGreen, yellow, white];
const colorsRedGreen8 = [black, blue, darkMagenta, red, green, cyan, yellow, white, black, blue, darkMagenta, red, green, cyan, yellow, white];

const transparent = 128;


const whiteT = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: transparent
});

const blackT = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: transparent
});

const redT = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 0,
    alpha: transparent
});

const greenT = Pixels.integerOfColor({
    red: 0,
    green: 255,
    blue: 0,
    alpha: transparent
});

const blueT = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 255,
    alpha: transparent
});

const yellowT = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: transparent
});

const orangeT = Pixels.integerOfColor({
    red: 255,
    green: 168,
    blue: 40,
    alpha: transparent
});

const magentaT = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 255,
    alpha: transparent
});

const cyanT = Pixels.integerOfColor({
    red: 0,
    green: 255,
    blue: 255,
    alpha: transparent
});

const darkGreyT = Pixels.integerOfColor({
    red: 85,
    green: 85,
    blue: 85,
    alpha: transparent
});


const lightGreyT = Pixels.integerOfColor({
    red: 170,
    green: 170,
    blue: 170,
    alpha: transparent
});

const roseT = Pixels.integerOfColor({
    red: 255,
    green: 128,
    blue: 128,
    alpha: transparent
});

const darkRedT = Pixels.integerOfColor({
    red: 170,
    green: 0,
    blue: 0,
    alpha: transparent
});

const darkMagentaT = Pixels.integerOfColor({
    red: 170,
    green: 0,
    blue: 170,
    alpha: transparent
});

const yellowGreenT = Pixels.integerOfColor({
    red: 170,
    green: 255,
    blue: 0,
    alpha: transparent
});

const violettT = Pixels.integerOfColor({
    red: 170,
    green: 0,
    blue: 255,
    alpha: transparent
});

const colorsGRBT = [black, green, red, yellow, blue, cyan, magenta, white, blackT, greenT, redT, yellowT, blueT, cyanT, magentaT, whiteT];
const colorsBRGT = [black, blue, red, magenta, green, cyan, yellow, white, blackT, blueT, redT, magentaT, greenT, cyanT, yellowT, whiteT];
const colorsDarkLightT = [black, blue, darkRed, darkMagenta, rose, orange, yellow, white, blackT, blueT, darkRedT, darkMagentaT, roseT, orangeT, yellowT, whiteT];
const colorsGreysT = [black, darkGrey, lightGrey, white, black, darkGrey, lightGrey, white, blackT, darkGreyT, lightGreyT, whiteT, blackT, darkGreyT, lightGreyT, whiteT];
const colorsMagentaGreen8T = [black, blue, violett, magenta, green, yellowGreen, yellow, white, blackT, blueT, violettT, magentaT, greenT, yellowGreenT, yellowT, whiteT];
const colorsRedGreen8T = [black, blue, darkMagenta, red, green, cyan, yellow, white, blackT, blueT, darkMagentaT, redT, greenT, cyanT, yellowT, whiteT];

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

waves.map = function() {
    symmetry = waves.symmetry;
    const scale = scales[symmetry];
    const scale2 = scale * scale;
    const scale3 = scale2 * scale;
    var dAngle;
    var waveFunction;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const colorIndexArray = map.structureArray;
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
        let colorIndex = waveFunction(x, y) > 0 ? 1 : 0;
        colorIndex += waveFunction(scale * x, scale * y) > 0 ? 2 : 0;
        colorIndex += waveFunction(scale2 * x, scale2 * y) > 0 ? 4 : 0;
        colorIndex += waveFunction(scale3 * x, scale3 * y) > 0 ? 8 : 0;
        colorIndexArray[index] = colorIndex;
    }
};

waves.colors = colorsGRB;

waves.draw = function() {
    const pixelsArray = output.pixels.array;
    const colorIndexArray = map.structureArray;
    const colors = waves.colors;
    const length = colorIndexArray.length;
    for (var index = 0; index < length; index++) {
        pixelsArray[index] = colors[colorIndexArray[index]];
    }
    output.pixels.show();
};

waves.setup = function(gui) {
    gui.add({
        type: 'number',
        params: waves,
        property: 'offset',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'boolean',
        params: waves,
        property: 'sum',
        labelText: 'sum/prod',
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'selection',
        params: waves,
        property: 'colors',
        options: {
            'black & white': colorsBW,
            'green red blue': colorsGRB,
            'blue red green': colorsBRG,
            'dark light': colorsDarkLight,
            'magenta green 8': colorsMagentaGreen8,
            'red green 8': colorsRedGreen8,
            'greys': colorsGreys,
            'green red blue trans': colorsGRBT,
            'blue red green trans': colorsBRGT,
            'dark light trans': colorsDarkLightT,
            'magenta green 8 trans': colorsMagentaGreen8T,
            'red green 8 trans': colorsRedGreen8T,
            'greys trans': colorsGreysT
        },
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'boolean',
        params: waves,
        property: 'drawOn',
        labelText:'draw waves',
        onChange: function() {
            julia.drawNewStructure();
        }
    });

    map.mapping = waves.map;
};