/* jshint esversion: 6 */

import {
    output,
    Pixels,
    ColorInput
} from "../libgui/modules.js";

import {
    utils
} from "./modules.js";

export const colors = {};

//=========================================
// color tables as integer colors

colors.table = [];

function ranBool() {
    return Math.random > 0.5;
}

const color = {};
color.alpha = 255;

// set number of colors <<< number of states
// it's normalized
colors.setN = function(n) {
    colors.n = n;
};

//================================================
// modifying the color table

// put the last color in front "solarized"
colors.solarize = function() {
    const last = colors.table[colors.n - 1];
    for (var i = colors.n - 1; i > 0; i--) {
        colors.table[i] = colors.table[i - 1];
    }
    colors.table[0] = last;
};

// invert the color
colors.invert = function() {
    const center = Math.floor(colors.n / 2 - 0.5);
    for (let i = 0; i <= center; i++) {
        const h = colors.table[i];
        colors.table[i] = colors.table[colors.n - 1 - i];
        colors.table[colors.n - 1 - i] = h;
    }
};

colors.complement = function() {
    const nColors = colors.n;
    for (let i = 0; i < nColors; i++) {
        Pixels.colorOfInteger(color, colors.table[i]);
        color.red = 255 - color.red;
        color.green = 255 - color.green;
        color.blue = 255 - color.blue;
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.rotate = function() {
    const nColors = colors.n;
    for (let i = 0; i < nColors; i++) {
        Pixels.colorOfInteger(color, colors.table[i]);
        const h = color.red;
        color.red = color.green;
        color.green = color.blue;
        color.blue = h;
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.exchange = function() {
    const nColors = colors.n;
    for (let i = 0; i < nColors; i++) {
        Pixels.colorOfInteger(color, colors.table[i]);
        const h = color.red;
        color.red = color.green;
        color.green = h;
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

//============================================
// the color table generators

// make x=0...1 from i=0...number of colors -1

function xFun(i) {
    return i / (colors.n - 1);
}

// make color component 0...255 from x=0...1 with clamping and rounding down to integer
function cFun(x) {
    return Math.max(0, Math.min(255, Math.floor(x * 255.9)));
}

colors.greys = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = cFun(xFun(i));
        color.red = grey;
        color.blue = grey;
        color.green = grey;
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.redYellowWhite = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const x = 3 * xFun(i);
        color.red = cFun(x);
        color.green = cFun(x - 1);
        color.blue = cFun(x - 2);
        colors.table[i] = Pixels.integerOfColor(color);
    }
};


colors.blueCyanYellowWhite = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    const first = Math.floor(nColors * 0.33);
    const second = Math.floor(nColors * 0.66);
    for (let i = 0; i < nColors; i++) {
        const x = 4 * xFun(i);
        color.red = cFun(x - 2);
        color.green = cFun(x - 1);
        if (x > 3) {
            color.blue = cFun(x - 3);
        } else {
            color.blue = cFun(Math.min(x, 3 - x));
        }
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.blueCyanWhite = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    const first = Math.floor(nColors * 0.33);
    const second = Math.floor(nColors * 0.66);
    for (let i = 0; i < nColors; i++) {
        const x = 3 * xFun(i);
        color.blue = cFun(x);
        color.green = cFun(x - 1);
        color.red = cFun(x - 2);
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.randomBlue = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = Math.floor(i / (nColors - 1) * 255.9);
        color.red = Math.floor(Math.random() * 255.9);
        color.green = 255 - color.red;
        color.blue = grey;
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.randomRedGreen = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = Math.floor(i / (nColors - 1) * 255.9);
        color.red = grey;
        color.green = 255 - color.red;
        color.blue = Math.floor(Math.random() * 255.9);
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

colors.bordeaux = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = Math.floor(i / (nColors - 1) * 255.9);
        color.red = Math.min(255, 510 - 2 * grey);
        color.green = Math.max(0, 255 - 2 * grey);
        color.blue = Math.max(0, Math.floor(255 - grey * grey / 100));
        colors.table[i] = Pixels.integerOfColor(color);
    }
};

//========================================================
// interface

const generators = [colors.greys, colors.redYellowWhite, colors.blueCyanWhite, colors.blueCyanYellowWhite, colors.randomBlue, colors.randomRedGreen, colors.bordeaux];

var generatorSelector, complementSwitch, invertSwitch, solarizeSwitch;
var colorControllers = [];

colors.makeGui = function(gui) {
    colors.gui = gui;
    colors.generator = colors.greys;
    generatorSelector = gui.add({
        type: 'selection',
        params: colors,
        property: 'generator',
        labelText: 'colors',
        options: {
            greys: colors.greys,
            redYellowWhite: colors.redYellowWhite,
            blueCyanWhite: colors.blueCyanWhite,
            blueCyanYellowWhite: colors.blueCyanYellowWhite,
            randomBlue: colors.randomBlue,
            randomGreen: colors.randomRedGreen,
            borddeaux: colors.bordeaux
        },
        onChange: function() {
            colors.makeTable();
            colors.draw();
        }
    });
    generatorSelector.add({
        type: 'number',
        params: utils,
        property: 'colors',
        labelText: 'numbers',
        min: 2,
        step: 1,
        onChange: function() {
            colors.setN(utils.colors);
            colors.makeTable();
            utils.draw();
        }
    });
    colors.doComplement = false;
    complementSwitch = gui.add({
        type: 'boolean',
        params: colors,
        property: 'doComplement',
        labelText: 'complement',
        onChange: function() {
            colors.makeTable();
            colors.draw();
        }
    });
    colors.doInvert = false;
    invertSwitch = complementSwitch.add({
        type: 'boolean',
        params: colors,
        property: 'doInvert',
        labelText: 'invert',
        onChange: function() {
            colors.makeTable();
            colors.draw();
        }
    });
    colors.doSolarize = false;
    solarizeSwitch = complementSwitch.add({
        type: 'boolean',
        params: colors,
        property: 'doSolarize',
        labelText: 'solarize',
        onChange: function() {
            colors.makeTable();
            colors.draw();
        }
    });
};

colors.random = function(nColors) {
    colors.setN(nColors);
    generatorSelector.setValueOnly(utils.randomChoice(generators));
    complementSwitch.setValueOnly(ranBool());
    invertSwitch.setValueOnly(ranBool());
    solarizeSwitch.setValueOnly(ranBool());
    colors.makeTable();
};

var rawColors = [];
colors.makeTable = function() {
    colors.generator();
    if (colors.doComplement) {
        colors.complement();
    }
    if (colors.doInvert) {
        colors.invert();
    }
    if (colors.doSolarize) {
        colors.solarize();
    }
    colorControllers.forEach(controller => controller.destroy());
    colorControllers.length = colors.n;
    rawColors.length = colors.n;
    let pureColor = {};
    for (let i = 1; i < colors.n; i++) {
        rawColors[i] = {};
        Pixels.colorOfInteger(color, colors.table[i]);
        pureColor.red = color.red;
        pureColor.blue = color.blue;
        pureColor.green = color.green;
        rawColors[i] = ColorInput.stringFromObject(pureColor);
        colorControllers[i] = colors.gui.add({
            type: 'color',
            params: rawColors,
            property: i,
            onChange: function(colorString) {
                ColorInput.setObject(color, colorString);
                colors.table[i] = Pixels.integerOfColor(color);
                colors.draw();
            }
        });
    }
    colors.table[0] = 0;
};

// test the color table

colors.test = function() {
    output.startDrawing();
    output.pixels.update();
    const nColors = colors.n;
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = output.canvas.height;
    const blockSize = Math.floor(width / 10) + 1;
    let index = 0;
    for (var j = 0; j < height; j++) {
        const colorIndexBase = Math.floor(j / blockSize) * Math.floor(width / blockSize);
        for (var i = 0; i < width; i++) {
            const colorIndex = (colorIndexBase + Math.floor(i / blockSize)) % nColors;
            pixels.array[index] = colors.table[colorIndex];
            index += 1;
        }
    }
    output.pixels.show();
};