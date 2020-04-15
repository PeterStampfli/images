/* jshint esversion: 6 */

import {
    output,
    ParamGui
}
from "../libgui/modules.js";

import {
    colorTable
}
from "./colorTable.js";

/**
 * display the world using colorTable and different interpolation methods
 * with ui element to choose the interpolation method
 * @namespace display
 */

export const displayRectangularColorTable = {};

// the input data from the automaton (with possible transformation)
// it is an 'image', may be the same as the cells, or different (survival time?)
var imageData, imageWidth, imageHeight, imageNStates;

/**
 * set the width and height of the image
 * sets the width to height ratio of the output canvas: CREATE canvas before calling this
 * @method displayRectangularColorTable.setDimensions
 * @param {int} width
 * @param {int} height - default: width
 */
displayRectangularColorTable.setDimensions = function(width, height) {
    imageWidth = width;
    imageHeight = height;
    output.setCanvasWidthToHeight(width / height);
};

/**
 * set the image data array with the image data
 * it is usually one integer per cell, which may be the cell state
 * @method displayRectangularColorTable.setData
 * @param {Array of int} data
 */
displayRectangularColorTable.setData = function(data) {
    imageData = data;
};

/**
 * set the number of states of the image data
 * depends on the number of statyyes per cell and the transformation from cell to image data
 * @method displayRectangularColorTable.setImageNStates
 * @param {int} n
 */

displayRectangularColorTable.setImageNStates = function(n) {
    imageNStates = n;
};

/**
 * drawing after changes of parameters: number of different colors and the color table type
 * here: drawing a sample for tests
 * overwrite for running life
 * @method displayRectangularColorTable.draw
 */
displayRectangularColorTable.draw = function() {
    displayRectangularColorTable.interpolation();
};

// displaymethods
//=======================

/*
 * show with a colored block for each image data cell
 * equivalent to nearest neighbor interpolation
 * Note: if the value of the cell is larger than the number of colors
 * then we take the value modulo the number of colors
 */
function block() {
    const canvas = output.canvas;
    const canvasContext = canvas.getContext('2d');
    const blockWidth = canvas.width / imageWidth;
    const blockHeight = canvas.height / imageHeight;
    const nColors = colorTable.cssColor.length;
    let y = 0;
    let index = 0;
    for (var j = 0; j < imageHeight; j++) {
        let x = 0;
        for (var i = 0; i < imageWidth; i++) {
            canvasContext.fillStyle = colorTable.cssColor[imageData[index] % nColors];
            canvasContext.fillRect(x, y, blockWidth + 1, blockHeight + 1); // overprinting to avoid spurious light borders
            x += blockWidth;
            index += 1;
        }
        y += blockHeight;
    }
}

/*
 * linear interpolation for each pixel between the four 
 * closest image cells, rounding, gives index to color components
 * mapping from 0 ... imageNStates to 0...nColors, for rounding down
 */
function linearInterpolation() {
    // scaling factor from interpolated results 0...imageNStates-1 to 0...nColors-eps before rounding to 0...nColors
    const nColors = colorTable.getNColors();
    const statesToColors = (nColors - 0.00001) / (imageNStates - 1);
    // interface to the canvas
    const canvas = output.canvas;
    const canvasContext = canvas.getContext('2d');
    const canvasImageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = canvasImageData.data;
    // interpolation:
    // x and y are image coordinates
    // in one direction only: image cell 0 has center at 0.5, cell 1 at 1.5, thus
    // x (or y) between 0.5/size and 1.5/size interpolates between cells 0 and 1, (iHigh=1 and iLow=0) and so on
    // x between imageSize-1.5 and imageSize-0.5 interpolates between cells imageSize-2 and imageSize-1
    // use periodic boundary condition
    // x close to imageSize: interpolation between cell imageSize-1 and cell 0==imageSize
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // projected size of the pixels in the image
    const deltaX = imageWidth / canvasWidth;
    const deltaY = imageHeight / canvasHeight;
    let pixelIndex = 0;
    // x,y are centers of the pixels in the image space
    let y = 0.5 * deltaY;
    for (var jCanvas = 0; jCanvas < canvasHeight; jCanvas++) {
        let x = 0.5 * deltaX;
        // interpolation in y-direction, y=0.5deltaY ... imageHeight-o.5*deltaY
        let jHigh = Math.round(y); // always 0 <= jHigh <= imageHeight, y-yHigh=-0.5 ...+0.5
        let jLow = jHigh - 1; // always -1 <=jLow <= imageHeight-1
        const dy = y - jHigh + 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
        if (jHigh === imageHeight) {
            jHigh = 0; // periodic
        }
        if (jLow < 0) {
            jLow = imageHeight - 1; // periodic
        }
        // multply with row length to get column indices
        jHigh *= imageWidth;
        jLow *= imageWidth;
        for (var iCanvas = 0; iCanvas < canvasWidth; iCanvas++) {
            // essentially the same as jHigh and jLow
            let iHigh = Math.round(x);
            let iLow = iHigh - 1;
            const dx = x - iHigh + 0.5;
            if (iHigh === imageWidth) {
                iHigh = 0;
            }
            if (iLow < 0) {
                iLow = imageWidth - 1;
            }
            let interpolatedState = (1 - dx) * ((1 - dy) * imageData[iLow + jLow] + dy * imageData[iLow + jHigh]);
            interpolatedState += dx * ((1 - dy) * imageData[iHigh + jLow] + dy * imageData[iHigh + jHigh]);
            const colorIndex = Math.floor(statesToColors * interpolatedState);
            pixels[pixelIndex] = colorTable.reds[colorIndex];
            pixels[pixelIndex + 1] = colorTable.greens[colorIndex];
            pixels[pixelIndex + 2] = colorTable.blues[colorIndex];
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
            x += deltaX;
        }
        y += deltaY;
    }
    canvasContext.putImageData(canvasImageData, 0, 0);
}

/*
the interpolation kernel: linear interpolation of the kernel is much slower, the arrow function form is slightly slower
it is normalized to 1 within an error of about 1.00001 ! (good enough)
*/
function kernel01(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<1
    return (1.16666 * x - 2) * x * x + 0.888888;
}

function kernel12(x) { // Mitchell-Netrovali, B=C=0.333333, 1<x<2
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

/*
 * cubic interpolation for each pixel, gives index to color components
 * mapping from 0 ... imageNStates to 0...nColors, for rounding down
 */
function cubicInterpolation() {
    // scaling factor from interpolated results 0...imageNStates-1 to 0...nColors-eps before rounding to 0...nColors
    const nColors = colorTable.getNColors();
    const statesToColors = (nColors - 0.00001) / (imageNStates - 1);
    // interface to the canvas
    const canvas = output.canvas;
    const canvasContext = canvas.getContext('2d');
    const canvasImageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = canvasImageData.data;
    // similar as for linear interpolation
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // projected size of the pixels in the image
    const deltaX = imageWidth / canvasWidth;
    const deltaY = imageHeight / canvasHeight;
    let pixelIndex = 0;
    // x,y are centers of the pixels in the image space
    let y = 0.5 * deltaY;
    for (var jCanvas = 0; jCanvas < canvasHeight; jCanvas++) {
        let x = 0.5 * deltaX;
        let jHigh = Math.round(y); // always 0 <= jHigh <= imageSize
        const dy = y - jHigh + 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
        // dy is between 0 and 1
        const weightYLow = kernel01(dy);
        const weightYHigh = kernel01(1 - dy);
        const weightYLower = kernel12(1 + dy);
        const weightYHigher = kernel12(2 - dy);
        let jLow = jHigh - 1; // always -1 <=jLow <= imageSize-1
        let jLower = jHigh - 2; // between -2 and imageSize-2
        let jHigher = jHigh + 1; // between 1 and imageSize+1
        // wraparound (periodicity)
        if (jHigher >= imageHeight) {
            jHigher -= imageHeight; // periodic
            if (jHigh === imageHeight) {
                jHigh = 0; // periodic
            }
        }
        if (jLower < 0) {
            jLower += imageHeight; // periodic
            if (jLow < 0) {
                jLow = imageHeight - 1; // periodic
            }
        }
        // multply with row length to get column indices
        jHigher *= imageWidth;
        jHigh *= imageWidth;
        jLow *= imageWidth;
        jLower *= imageWidth;
        for (var iCanvas = 0; iCanvas < canvasWidth; iCanvas++) {
            // essentially the same as jHigh and jLow
            let iHigh = Math.round(x);
            const dx = x - iHigh + 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
            const weightXLow = kernel01(dx);
            const weightXHigh = kernel01(1 - dx);
            const weightXLower = kernel12(1 + dx);
            const weightXHigher = kernel12(2 - dx);
            let iLow = iHigh - 1;
            let iLower = iHigh - 2;
            let iHigher = iHigh + 1;
            if (iHigher >= imageWidth) {
                iHigher -= imageWidth;
                if (iHigh === imageWidth) {
                    iHigh = 0;
                }
            }
            if (iLower < 0) {
                iLower += imageWidth;
                if (iLow < 0) {
                    iLow = imageWidth - 1;
                }
            }
            let interpolatedState = weightXLower * (weightYLower * imageData[iLower + jLower] + weightYLow * imageData[iLower + jLow] + weightYHigh * imageData[iLower + jHigh] + weightYHigher * imageData[iLower + jHigher]);
            interpolatedState += weightXLow * (weightYLower * imageData[iLow + jLower] + weightYLow * imageData[iLow + jLow] + weightYHigh * imageData[iLow + jHigh] + weightYHigher * imageData[iLow + jHigher]);
            interpolatedState += weightXHigh * (weightYLower * imageData[iHigh + jLower] + weightYLow * imageData[iHigh + jLow] + weightYHigh * imageData[iHigh + jHigh] + weightYHigher * imageData[iHigh + jHigher]);
            interpolatedState += weightXHigher * (weightYLower * imageData[iHigher + jLower] + weightYLow * imageData[iHigher + jLow] + weightYHigh * imageData[iHigher + jHigh] + weightYHigher * imageData[iHigher + jHigher]);
            interpolatedState = Math.max(0, Math.min(imageNStates - 1, interpolatedState)); // beware of negative values
            const colorIndex = Math.floor(statesToColors * interpolatedState);
            pixels[pixelIndex] = colorTable.reds[colorIndex];
            pixels[pixelIndex + 1] = colorTable.greens[colorIndex];
            pixels[pixelIndex + 2] = colorTable.blues[colorIndex];
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
            x += deltaX;
        }
        y += deltaY;
    }
    canvasContext.putImageData(canvasImageData, 0, 0);
}

/**
 * create the gui (ui elements)
 * method displayRectangularColorTable.createUI
 * @param {ParamGui} gui
 */
displayRectangularColorTable.interpolation = block;
const interpolations = {
    block: block,
    linear: linearInterpolation,
    cubic: cubicInterpolation
};

displayRectangularColorTable.createUI = function(gui) {
    gui.add({
        type: 'selection',
        params: displayRectangularColorTable,
        property: 'interpolation',
        options: interpolations,
        onChange: function() {
            displayRectangularColorTable.draw();
        }
    });
};

/**
 * set up a test
 * @method displayRectangularColorTable.setupTest
 */
displayRectangularColorTable.setupTest = function() {
    // making a gui, including the other components
    const gui = new ParamGui({}, {
        closed: false
    });
    output.createCanvas(gui);
    const colorTableGui = gui.addFolder({
        closed: false,
        name: 'color table'
    });
    colorTable.createUI(colorTableGui);
    const displayGui = gui.addFolder({
        closed: false,
        name: 'display'
    });
    displayRectangularColorTable.createUI(displayGui);

    const world = [];
    const nColors = 6;
    const width = 5;
    const height = 5;

    // transfer data
    displayRectangularColorTable.setDimensions(width, height);
    displayRectangularColorTable.setImageNStates(nColors);
    displayRectangularColorTable.setData(world);

    // initialize the color table
    colorTable.setNColors(nColors);
    colorTable.create();
    // define drawing routines
    colorTable.draw = displayRectangularColorTable.draw;
    output.draw = displayRectangularColorTable.draw;

    // make a test image

    world.length = width * height;
    for (var i = 0; i < world.length; i++) {
        world[i] = 0;
        world[i] = (i) % nColors;
    }

    displayRectangularColorTable.draw();
};

/*
use with:
<script type="module">
import {
    displayRectangularColorTable
}
from "./displayRectangularColorTable.js";
displayRectangularColorTable.setupTest();
</script>
*/