/* jshint esversion: 6 */

import {
    output,
    Pixels
} from "../libgui/modules.js";

import {
    utils
} from "./modules.js";

export const colors = {};

//=========================================
// color tables as integer colors

colors.table = [];

const color = {};
color.alpha = 255;

// set number of colors <<< number of states
// it's normalized
colors.setN = function(n) {
    colors.n = n;
};

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
    const first = Math.floor(nColors * 0.33);
    const second = Math.floor(nColors * 0.66);
    for (let i = 0; i < nColors; i++) {
        const x = 3 * xFun(i);
        color.red = cFun(x);
        color.green = cFun(x - 1);
        color.blue = cFun(x - 2);
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

// random color table
const generators=[colors.greys, colors.redYellowWhite,colors.blueCyanWhite,colors.randomBlue,colors.randomRedGreen,colors.bordeaux];

colors.random=function(nColors){
    console.log('color',nColors)
colors.setN(nColors);
const generator=utils.randomChoice(generators);
generator();
if (Math.random()>0.5){
    colors.invert();
}
if (Math.random()>0.5){
    colors.solarize();
}
if (Math.random()>0.8){
    colors.complement();
}
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