/* jshint esversion: 6 */

import {
    output,
    ColorInput
}
from "../libgui/modules.js";

/**
 * a color table together with functions to created it and choices
 * @namespace colorTable
 */

export const colorTable = {};

// the table: color components
colorTable.reds = [];
colorTable.greens = [];
colorTable.blues = [];
colorTable.cssColor = [];

// generator for a grey colors
function greys(color, x) {
    color.red = x;
    color.green = x;
    color.blue = x;
}

/**
 * making the table
 *colorTable.nColors gives the number of colors
 * colorTable.generator(color,x) is a defining function. 
 * x and color components are floats between 0 and 1
 * @method colorTable.create
 */
colorTable.create = function() {
    const color = {};
    colorTable.reds.length = colorTable.nColors;
    colorTable.greens.length = colorTable.nColors;
    colorTable.blues.length = colorTable.nColors;
    colorTable.cssColor.length = colorTable.nColors;
    const d = 1 / (colorTable.nColors - 1);
    let x = 0;
    for (var i = 0; i < colorTable.nColors; i++) {
        colorTable.generator(color, x);
        // transforming the color components 
        // from floating point values between 0 and 1 to integers between 0 and 255
        color.red = Math.min(255, Math.max(0, Math.floor(255.9 * color.red)));
        color.green = Math.min(255, Math.max(0, Math.floor(255.9 * color.green)));
        color.blue = Math.min(255, Math.max(0, Math.floor(255.9 * color.blue)));
        colorTable.reds[i] = color.red;
        colorTable.greens[i] = color.green;
        colorTable.blues[i] = color.blue;
        colorTable.cssColor[i] = ColorInput.stringFromObject(color);
        x += d;
    }
};

// drawing after changes of parameters: number of different colors and the color table type
// here: drawing a sample
colorTable.draw = function() {
    // before drawing create the color table
    colorTable.create();
    // now draw a sample
    const canvas = output.canvas;
    const canvasContext = canvas.getContext("2d");
    const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let pixelIndex = 0;
    const height = canvas.height;
    const width = canvas.width;
    for (var jCanvas = 0; jCanvas < height; jCanvas++) {
        for (var iCanvas = 0; iCanvas < width; iCanvas++) {
            const index = Math.floor(iCanvas / width * (colorTable.nColors - 0.00001));
            pixels[pixelIndex] = colorTable.reds[index];
            pixels[pixelIndex + 1] = colorTable.greens[index];
            pixels[pixelIndex + 2] = colorTable.blues[index];
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
        }
    }
    canvasContext.putImageData(imageData, 0, 0);
};

// the number of colors - target value for generation, will be length of tables
// change value in the gui
colorTable.nColors = 10;
// the args object for the gui
colorTable.nColorsControllerArgs = {
    type: 'number',
    params: colorTable,
    property: 'nColors',
    min: 2,
    max: 256,
    onChange: function() {
        colorTable.draw(); // this drawing method will be defined later
    }
};

// the options for choosing the table generator: key/value pairs
colorTable.generator = greys;
const generatorOptions = {};
generatorOptions.greys = greys;
// the args object for the gui
colorTable.generatorControllerArgs = {
    type: 'selection',
    params: colorTable,
    property: 'generator',
    options: generatorOptions,
    onChange: function() {
        colorTable.draw(); // this drawing method may be changed later, if we do not want to draw only samples
    }
};

/**
 * create the gui (ui elements)
 * method colorTable.createUI
 * @param {ParamGui} gui
 */
colorTable.createUI = function(gui) {
    gui.add(colorTable.nColorsControllerArgs);
    gui.add(colorTable.generatorControllerArgs);
};

// more generators
//==========================================================

function blackBlueYellowWhite(color, x) {
    color.red = Math.sqrt(x);
    color.green = x;
    const xs = x * x * x * x * x;
    color.blue = 4 * x * (1 - x) + xs * xs * xs;
}

generatorOptions.blackBlueYellowWhite = blackBlueYellowWhite;

console.log(generatorOptions);