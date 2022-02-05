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

colors.setN = function(n) {
    colors.n = n;
};

// make x=0...1 from i=0...number of colors -1

function x(i) {
    return i / (colors.n - 1);
}

// make color component 0...255 from x=0...1 with clamping and rounding down to integer
function c(x) {
    return Math.max(0, Math.min(255, Math.floor(x * 255.9)));
}

colors.greys = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = Math.floor(i / (nColors - 1) * 255.9);
        color.red = grey;
        color.blue = grey;
        color.green = grey;
        colors.table[i] = Pixels.integerOfColor(color);
    }
};


colors.invertedGreys = function() {
    const nColors = colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = Math.floor((nColors - 1 - i) / (nColors - 1) * 255.9);
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
        if (i < first) {
            color.red = Math.floor(i / first * 255.9);
            color.blue = 0;
            color.green = 0;
        } else if (i < second) {
            color.red = 255;
            color.green = Math.floor((i - first + 1) / (second - first + 1) * 255.9);
            color.blue = 0;
        } else {
            color.red = 255;
            color.green = 255;
            color.blue = Math.floor((i - second + 1) / (nColors - second + 1) * 255.9);
        }
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