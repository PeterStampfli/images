/* jshint esversion: 6 */

import {
    output,
    ColorInput,
    ParamGui
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

/**
 * making the table and adjusting the ui
 * colorTable.nColors gives the number of colors
 * colorTable.generator(color,i) is a defining function. 
 * i goes from 0 to nColors-1
 * color components are floats between 0 and 1
 * colors can be cyclic
 * @method colorTable.create
 */
colorTable.create = function() {
    // the ui
    // the colors
    const color = {};
    colorTable.reds.length = colorTable.nColors;
    colorTable.greens.length = colorTable.nColors;
    colorTable.blues.length = colorTable.nColors;
    colorTable.cssColor.length = colorTable.nColors;
    for (var i = 0; i < colorTable.nColors; i++) {
        colorTable.generator(color, (i + colorTable.shift) % colorTable.nColors);
        // transforming the color components 
        // from floating point values between 0 and 1 to integers between 0 and 255
        color.red = Math.min(255, Math.max(0, Math.floor(255.9 * color.red)));
        color.green = Math.min(255, Math.max(0, Math.floor(255.9 * color.green)));
        color.blue = Math.min(255, Math.max(0, Math.floor(255.9 * color.blue)));
        colorTable.reds[i] = color.red;
        colorTable.greens[i] = color.green;
        colorTable.blues[i] = color.blue;
        colorTable.cssColor[i] = ColorInput.stringFromObject(color);
    }
};

/**
 * drawing after changes of parameters: number of different colors and the color table type
 * here: drawing a sample for tests
 * overwrite for running life
 * @method colorTable.draw
 */
colorTable.draw = function() {
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
// for the moment we do not need to change it from the outside
colorTable.nColors = 10;

/**
* change the number of colors (for initialization)
* gives correect number in ui !!
* @method colorTable.setNColors
* @param {int} n
*/
colorTable.setNColors=function(n){
    nColorsController.setValueOnly(n);
};

// shifting the entries
colorTable.shift = 0;

// number args object for the gui
const numberControllerArgs = {
    type: 'number',
    params: colorTable,
    max: 256,
    onChange: function() {
        colorTable.create();
        colorTable.draw(); // this drawing method will be defined later
    }
};

// the options for choosing the table generator: key/value pairs
const generatorOptions = {};

// generator selection args object for the gui
const generatorControllerArgs = {
    type: 'selection',
    params: colorTable,
    property: 'generator',
    options: generatorOptions,
    onChange: function() {
        colorTable.create();
        colorTable.draw(); // this drawing method may be changed later, if we do not want to draw only samples
    }
};

// color args object for the gui
const colorControllerArgs = {
    type: 'color',
    onChange: function() {
        console.log('change');
        colorTable.create();
        colorTable.draw(); // this drawing method may be changed later, if we do not want to draw only samples
    }
};

/**
 * create the gui (ui elements)
 * method colorTable.createUI
 * @param {ParamGui} gui
 */
var nColorsController,color1Controller, color2Controller;
var color1 = {};
var color2 = {};

colorTable.createUI = function(gui) {
    nColorsController=gui.add(numberControllerArgs, {
        property: 'nColors',
        min: 2
    });
    gui.add(numberControllerArgs, {
        property: 'shift'
    });
    gui.add(generatorControllerArgs);
    color1Controller = gui.add(colorControllerArgs, {
        labelText: 'first',
        colorObject: color1,
        initialValue: '#ff0000'
    });
    color2Controller = gui.add(colorControllerArgs, {
        labelText: 'second',
        colorObject: color2,
        initialValue: '#00ff00'
    });
};

// for checking out new colortable prototypes
//=========================================================

/**
 * set up a test
 * @method colorTable.setupTest
 */
colorTable.setupTest = function() {
    const gui = new ParamGui({}, {
        closed: false
    });
    output.createCanvas(gui);
    const colorTableGui = gui.addFolder({
        closed: false,
        name: 'colortable'
    });
    colorTable.createUI(colorTableGui);
    output.draw = colorTable.draw;
    colorTable.create();
    colorTable.draw();
};

/*
use with

<script type="module">
import {
    colorTable
}
from "./colorTable.js";
colorTable.setupTest();
</script>
*/

// generators
//==========================================================
// whatever(color,i) is a defining function. 
// i goes from 0 to nColors-1
// color components (red, green, blue) are floats between 0 and 1

function greys(color, i) {
    const x = i / (colorTable.nColors - 1);
    color.red = x;
    color.green = x;
    color.blue = x;
}

colorTable.generator = greys;
generatorOptions.greys = greys;

function greyWave(color, i) {
    var x;
    const nc = colorTable.nColors + (colorTable.nColors & 1); // odd 1 to odd numbers
    const nc2 = nc / 2;
    const d = 2 / nc;
    if (i < nc2) {
        x = i * d;
    } else {
        x = 1 - d * (i - nc2);
    }
    color.red = x;
    color.green = x;
    color.blue = x;
}

generatorOptions.greyWave = greyWave;

function blackBlueYellowWhite(color, i) {
    const x = i / (colorTable.nColors - 1);
    color.red = Math.sqrt(x);
    color.green = x;
    const xs = x * x * x * x * x;
    color.blue = 4 * x * (1 - x) + xs * xs * xs;
}

generatorOptions.blackBlueYellowWhite = blackBlueYellowWhite;

function blueGreenRed(color, i) {
    const x = (i + 0.5) / colorTable.nColors;
    const a = 1;
    color.green = a * (1 - Math.abs(3 * x - 2));
    color.red = a * (1 - Math.abs(3 * x - 1));
    color.blue = a * Math.max(1 - Math.abs(3 * x - 3), 1 - Math.abs(3 * x));
}
generatorOptions.blueGreenRed = blueGreenRed;

function rainbow(color, i) {
    const x = (i + 0.5) / colorTable.nColors;
    const a = 2;
    color.green = a * (1 - Math.abs(3 * x - 2));
    color.red = a * (1 - Math.abs(3 * x - 1));
    color.blue = a * Math.max(1 - Math.abs(3 * x - 3), 1 - Math.abs(3 * x));
}
generatorOptions.rainbow = rainbow;

function twoColorInterpolation(color, i) {
    const x = i / (colorTable.nColors - 1);
    color.red = (x * color1.red + (1 - x) * color2.red) / 255;
    color.green = (x * color1.green + (1 - x) * color2.green) / 255;
    color.blue = (x * color1.blue + (1 - x) * color2.blue) / 255;
}
generatorOptions.twoColors = twoColorInterpolation;