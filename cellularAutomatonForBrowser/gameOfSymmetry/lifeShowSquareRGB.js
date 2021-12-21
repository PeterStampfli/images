/* jshint esversion: 6 */
/*
 * module for showing the state of the cells, general interface
 *==============================================================
 *
 * object with methods:
 *
 * init(gui, canvas)
 * initialization
 * gui is a ParamGui-folder for the ui of the module
 * canvas is a canvas object
 *
 * showUI()
 * shows the ui of the module
 *
 * hideUI()
 * hides the ui of the module (when using another module)
 *
 * input(cells)
 * reads an array of cells
 *
 * redraw()
 * update display (resized canvas, changed display method)
 *
 * setNumberOfStates(n)
 * changes number of states per cell, reset image
 */

import {
    ParamGui,
    guiUtils
}
from "../libgui/modules.js";

export const lifeShowSquareRGB = {};

// private variables used in methods

var gui, canvas, canvasContext;
var red, green, blue;
var uiController;
var nStates = 0;
var imageSize = 0;
var quantFactor = 1; // factor for quantization of interpolated values
var quantize = false; // after interpolation

/**
 *
 * @method lifeShowSquareRGB.init
 * @param {ParamGui} theGui - a paramGui folder
 * @param {Canvas} theCanvas - for showing the automaton
 */
lifeShowSquareRGB.init = function(theGui, theCanvas) {
    gui = theGui;
    canvas = theCanvas;
    canvasContext = canvas.getContext("2d");
    red = [];
    green = [];
    blue = [];
    // set up the gui
    const choices = {
        'greyBlockPixels': greyBlock,
        'greyLinearInterpolation': greyLinearContinuous,
        'greyLinearInterpolationQuantized': greyLinearQuantized,
        'greyCubicInterpolation': greyCubicContinuous,
        'greyCubicInterpolationQuantized': greyCubicQuantized,
        'colorBlockPixels': colorBlock,
        'colorLinearInterpolation': colorLinearContinuous,
        'colorLinearInterpolationQuantized': colorLinearQuantized,
        'colorCubicInterpolation': colorCubic
    };
    uiController = gui.add({
        type: 'selection',
        options: choices,
        params: lifeShowSquareRGB,
        property: 'drawMethod',
        labelText: 'display',
        onChange: function() {
            lifeShowSquareRGB.draw();
        }
    });
};

/**
 * hide the ui for choosing the display method
 * @method lifeShowSquareRGB.hideUI
 */
lifeShowSquareRGB.hideUI = function() {
    uiController.hide();
};

/**
 * show the ui for choosing the display method
 * @method lifeShowSquareRGB.showUI
 */
lifeShowSquareRGB.showUI = function() {
    uiController.show();
};

/**
 * set the number of states per cell (minimum is 2)
 * clears the images (assuming that the number changes)
 * @method lifeShowSquareRGB.setNumberOfStates
 * @param {int} n
 */
lifeShowSquareRGB.setNumberOfStates = function(n) {
    nStates = Math.max(2, n);
    quantFactor = (n - 0.00001) / (n - 1); // stretching the intevall [0,n-1] to [0,n), for giving equal weight to each possible state (rounding down)
    clearImage();
};

// the method for drawing
lifeShowSquareRGB.drawMethod = greyBlock;

/**
 * (re)draws the image after changing the canvas size or display method
 * @method lifeShowSquareRGB.draw
 */
lifeShowSquareRGB.draw = function() {
    lifeShowSquareRGB.drawMethod();
};

/**
 * read data of a (new) generation of the world as an array
 * the array has a border of cells around it, it is square
 * if its length is s*s, then the image data has a side length of s-2
 * if the size changes, then we have to reset the image data (red, green, blue)
 * @method lifeShowSquareRGB.inputGeneration
 * @param {array} worldData
 */
lifeShowSquareRGB.inputGeneration = function(worldData) {
    var worldIndex, imageIndex;
    const worldSize = Math.round(Math.sqrt(worldData.length));
    // if size changes we update the image size and data arrays
    if (worldSize !== imageSize + 2) {
        imageSize = worldSize - 2;
        red.length = imageSize * imageSize;
        green.length = imageSize * imageSize;
        blue.length = imageSize * imageSize;
        clearImage();
    }
    // generations go from green to red to blue: exchange data arrays
    const lastGeneration = blue;
    blue = red;
    red = green;
    green = lastGeneration;
    // image of input generation
    // going through all cells that belong to the image, omit border cells
    const factor = 255.9 / (nStates - 1);
    imageIndex = -1;
    for (var j = 1; j <= imageSize; j++) {
        worldIndex = j * worldSize;
        for (var i = 1; i <= imageSize; i++) {
            worldIndex += 1;
            imageIndex += 1;
            green[imageIndex] = worldData[worldIndex];
        }
    }
    lifeShowSquareRGB.draw();
};

// fill the image data arrays with zeros
function clearImage() {
    red.fill(0);
    green.fill(0);
    blue.fill(0);
}

// the drawing routines

function greyBlock() {
    console.log('drawing grey blocks');
    const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const pixelSize = canvasSize / imageSize;
    const factor = 255.9 / (nStates - 1);
    var i, j;
    let y = 0;
    let index = 0;
    for (j = 0; j < imageSize; j++) {
        let x = 0;
        for (i = 0; i < imageSize; i++) {
            // grey level as hex string with two digits
            // note that '#aaa' is equivalent to '#aaaaaa' and not '#0a0a0a'
            let grey = Math.floor(factor * green[index]).toString(16);
            if (grey.length < 2) {
                grey = '0' + grey;
            }
            canvasContext.fillStyle = '#' + grey + grey + grey;
            canvasContext.fillRect(x, y, pixelSize, pixelSize);
            x += pixelSize;
            index += 1;
        }
        y += pixelSize;
    }
}

function colorBlock() {
    console.log('drawing color blocks');
    const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const pixelSize = canvasSize / imageSize;
    const factor = 255.9 / (nStates - 1);
    var i, j;
    let y = 0;
    let index = 0;
    for (j = 0; j < imageSize; j++) {
        let x = 0;
        for (i = 0; i < imageSize; i++) {
            // grey level as hex string with two digits
            // note that '#aaa' is equivalent to '#aaaaaa' and not '#0a0a0a'
            let g = Math.floor(factor * green[index]).toString(16);
            if (g.length < 2) {
                g = '0' + g;
            }
            let r = Math.floor(factor * red[index]).toString(16);
            if (r.length < 2) {
                r = '0' + r;
            }
            let b = Math.floor(factor * blue[index]).toString(16);
            if (b.length < 2) {
                b = '0' + b;
            }
            canvasContext.fillStyle = '#' + r + g + b;
            canvasContext.fillRect(x, y, pixelSize, pixelSize);
            x += pixelSize;
            index += 1;
        }
        y += pixelSize;
    }
}

function greyLinear() {
    console.log('drawing grey linear interpolation');
    const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const d = imageSize / canvasSize; // from pixel indices to image coordinates
    const imageData = canvasContext.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data;
    const factor = 255.9 / (nStates - 1);
    // interpolation:
    // x and y are image coordinates
    // in one direction only: cell 0 has center at 0.5, cell 1 at 1.5, thus
    // x (or y) between 0.5/size and 1.5/size interpolates between cells 0 and 1, and so on
    // x between imageSize-1.5 and imageSize-0.5 interpolates between cells imageSize-2 and imageSize-1
    // use periodic boundary condition
    // x close to imageSize: interpolation between cell imageSize-1 and cell 0==imageSize
    let pixelIndex = 0;
    let y = 0;
    for (var jCanvas = 0; jCanvas < canvasSize; jCanvas++) {
        let x = 0;
        let jHigh = Math.round(y); // always 0 <= jHigh <= imageSize
        let jLow = jHigh - 1; // always -1 <=jLow <= imageSize-1
        const dy = y - jLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
        if (jHigh === imageSize) {
            jHigh = 0; // periodic
        }
        if (jLow < 0) {
            jLow = imageSize - 1; // periodic
        }
        // multply with row length to get column indices
        jHigh *= imageSize;
        jLow *= imageSize;
        for (var iCanvas = 0; iCanvas < canvasSize; iCanvas++) {
            // essentially the same as jHigh and jLow
            let iHigh = Math.round(x);
            let iLow = iHigh - 1;
            const dx = x - iLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
            if (iHigh === imageSize) {
                iHigh = 0;
            }
            if (iLow < 0) {
                iLow = imageSize - 1;
            }
            let grey = (1 - dx) * ((1 - dy) * green[iLow + jLow] + dy * green[iLow + jHigh]);
            grey += dx * ((1 - dy) * green[iHigh + jLow] + dy * green[iHigh + jHigh]);
            if (quantize) {
                grey = Math.floor(quantFactor * grey);
            }
            grey = Math.floor(factor * grey);
            pixels[pixelIndex] = grey;
            pixels[pixelIndex + 1] = grey;
            pixels[pixelIndex + 2] = grey;
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
            x += d;
        }
        y += d;
    }
    canvasContext.putImageData(imageData, 0, 0);
}

function greyLinearContinuous() {
    quantize = false;
    greyLinear();
}

function greyLinearQuantized() {
    quantize = true;
    greyLinear();
}

function colorLinear() {
    console.log('drawing color linear interpolation');
    const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const d = imageSize / canvasSize; // from pixel indices to image coordinates
    const imageData = canvasContext.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data;
    const factor = 255.9 / (nStates - 1);
    // interpolation:
    // x and y are image coordinates
    // in one direction only: cell 0 has center at 0.5, cell 1 at 1.5, thus
    // x (or y) between 0.5/size and 1.5/size interpolates between cells 0 and 1, (iHigh=1 and iLow=0) and so on
    // x between imageSize-1.5 and imageSize-0.5 interpolates between cells imageSize-2 and imageSize-1
    // use periodic boundary condition
    // x close to imageSize: interpolation between cell imageSize-1 and cell 0==imageSize
    let pixelIndex = 0;
    let y = 0;
    for (var jCanvas = 0; jCanvas < canvasSize; jCanvas++) {
        let x = 0;
        let jHigh = Math.round(y); // always 0 <= jHigh <= imageSize
        let jLow = jHigh - 1; // always -1 <=jLow <= imageSize-1
        const dy = y - jLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
        if (jHigh === imageSize) {
            jHigh = 0; // periodic
        }
        if (jLow < 0) {
            jLow = imageSize - 1; // periodic
        }
        // multply with row length to get column indices
        jHigh *= imageSize;
        jLow *= imageSize;
        for (var iCanvas = 0; iCanvas < canvasSize; iCanvas++) {
            // essentially the same as jHigh and jLow
            let iHigh = Math.round(x);
            let iLow = iHigh - 1;
            const dx = x - iLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
            if (iHigh === imageSize) {
                iHigh = 0;
            }
            if (iLow < 0) {
                iLow = imageSize - 1;
            }
            let r = (1 - dx) * ((1 - dy) * red[iLow + jLow] + dy * red[iLow + jHigh]);
            r += dx * ((1 - dy) * red[iHigh + jLow] + dy * red[iHigh + jHigh]);
            let g = (1 - dx) * ((1 - dy) * green[iLow + jLow] + dy * green[iLow + jHigh]);
            g += dx * ((1 - dy) * green[iHigh + jLow] + dy * green[iHigh + jHigh]);
            let b = (1 - dx) * ((1 - dy) * blue[iLow + jLow] + dy * blue[iLow + jHigh]);
            b += dx * ((1 - dy) * blue[iHigh + jLow] + dy * blue[iHigh + jHigh]);
            if (quantize) {
                g = Math.floor(quantFactor * g);
                r = Math.floor(quantFactor * r);
                b = Math.floor(quantFactor * b);
            }
            r = Math.floor(factor * r);
            g = Math.floor(factor * g);
            b = Math.floor(factor * b);
            pixels[pixelIndex] = r;
            pixels[pixelIndex + 1] = g;
            pixels[pixelIndex + 2] = b;
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
            x += d;
        }
        y += d;
    }
    canvasContext.putImageData(imageData, 0, 0);
}

function colorLinearContinuous() {
    quantize = false;
    colorLinear();
}

function colorLinearQuantized() {
    quantize = true;
    colorLinear();
}

/*
the interpolation kernel: linear interpolation of the kernel is much slower, the arrow function form is slightly slower
it is normalized to 1 within an error of about 1.00001 ! (good enough)
*/
function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
    if (x < 1) {
        return (1.16666 * x - 2) * x * x + 0.888888;
    }
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

function greyCubic() {
    console.log('drawing grey cubic interpolation');
    const canvasSize = Math.min(canvas.height, canvas.width);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    const d = imageSize / canvasSize; // from pixel indices to image coordinates
    const imageData = canvasContext.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data;
    const factor = 255.9 / (nStates - 1);
    // interpolation:
    // x and y are image coordinates
    // in one direction only: cell 0 has center at 0.5, cell 1 at 1.5, 
    // use periodic boundary condition
    let pixelIndex = 0;
    let y = 0;
    for (var jCanvas = 0; jCanvas < canvasSize; jCanvas++) {
        let x = 0;
        let jHigh = Math.round(y); // always 0 <= jHigh <= imageSize
        let jLow = jHigh - 1; // always -1 <=jLow <= imageSize-1
        let jLower = jHigh - 2; // between -2 and imageSize-2
        let jHigher = jHigh + 1; // between 1 and imageSize+1
        const dy = y - jLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
        const weightYLow = kernel(dy);
        const weightYHigh = kernel(1 - dy);
        const weightYLower = kernel(1 + dy);
        const weightYHigher = kernel(2 - dy);
        // wraparound (periodicity)
        if (jHigher >= imageSize) {
            jHigher -= imageSize; // periodic
        }
        if (jHigh === imageSize) {
            jHigh = 0; // periodic
        }
        if (jLow < 0) {
            jLow = imageSize - 1; // periodic
        }
        if (jLower < 0) {
            jLower += imageSize; // periodic
        }
        // multply with row length to get column indices
        jHigher *= imageSize;
        jHigh *= imageSize;
        jLow *= imageSize;
        jLower *= imageSize;
        for (var iCanvas = 0; iCanvas < canvasSize; iCanvas++) {
            // essentially the same as jHigh and jLow
            let iHigh = Math.round(x);
            let iLow = iHigh - 1;
            let iLower = iHigh - 2;
            let iHigher = iHigh + 1;
            const dx = x - iLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
            // dx, dy relate to the cell at (xLow+yLow)
            const weightXLow = kernel(dx);
            const weightXHigh = kernel(1 - dx);
            const weightXLower = kernel(1 + dx);
            const weightXHigher = kernel(2 - dx);
            if (iHigher >= imageSize) {
                iHigher -= imageSize;
            }
            if (iHigh === imageSize) {
                iHigh = 0;
            }
            if (iLow < 0) {
                iLow = imageSize - 1;
            }
            if (iLower < 0) {
                iLower += imageSize;
            }
            let grey = weightXLower * (weightYLower * green[iLower + jLower] + weightYLow * green[iLower + jLow] + weightYHigh * green[iLower + jHigh] + weightYHigher * green[iLower + jHigher]);
            grey += weightXLow * (weightYLower * green[iLow + jLower] + weightYLow * green[iLow + jLow] + weightYHigh * green[iLow + jHigh] + weightYHigher * green[iLow + jHigher]);
            grey += weightXHigh * (weightYLower * green[iHigh + jLower] + weightYLow * green[iHigh + jLow] + weightYHigh * green[iHigh + jHigh] + weightYHigher * green[iHigh + jHigher]);
            grey += weightXHigher * (weightYLower * green[iHigher + jLower] + weightYLow * green[iHigher + jLow] + weightYHigh * green[iHigher + jHigh] + weightYHigher * green[iHigher + jHigher]);
            grey = Math.max(0, Math.min(nStates - 1, grey)); // beware of negative values
            if (quantize) {
                grey = Math.floor(quantFactor * grey);
            }
            grey = Math.floor(factor * grey);
            pixels[pixelIndex] = grey;
            pixels[pixelIndex + 1] = grey;
            pixels[pixelIndex + 2] = grey;
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
            x += d;
        }
        y += d;
    }
    canvasContext.putImageData(imageData, 0, 0);
}

function greyCubicContinuous() {
    quantize = false;
    greyCubic();
}

function greyCubicQuantized() {
    quantize = true;
    greyCubic();
}

function colorCubic() {
    console.log('drawing color cubic interpolation');
}