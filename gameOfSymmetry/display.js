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

export const display = {};

// the input data from the automaton (with possible transformation)
var worldData, worldWidth, worldHeight;

/**
 * set the width and height of the world
 * sets the width to height ratio of the output canvas: CREATE canvas before calling this
 * @method display.setDimensions
 * @param {int} width
 * @param {int} height - default: width
 */
display.setDimensions = function(width, height) {
    worldWidth = width;
    worldHeight = height;
    output.setCanvasWidthToHeight(width / height);
};

/**
 * set the world data array with the image data
 * it is usually one integer per cell, which may be the cell state
 * @method display.setData
 * @param {Array of int} data
 */
display.setData = function(data) {
    worldData = data;
};

/**
 * create the gui (ui elements)
 * method display.createUI
 * @param {ParamGui} gui
 */

display.createUI = function(gui) {


};

// displaymethods
//=======================

/*
 * show with a colored block for each world data cell
 * equivalent to nearest neighbor interpolation
 * Note: if the value of the cell is larger than the number of colors
 * then we take the value modulo the number of colors
 * best use colorWaves ?
 */
// public method for easier testing
display.block = function() {
    console.log('block');
    const canvas = output.canvas;
    const canvasContext = canvas.getContext('2d');
    const blockWidth = canvas.width / worldWidth;
    const blockHeight = canvas.height / worldHeight;
    const nColors = colorTable.cssColor.length;
    let y = 0;
    let index = 0;
    for (var j = 0; j < worldHeight; j++) {
        let x = 0;
        for (var i = 0; i < worldWidth; i++) {
            canvasContext.fillStyle = colorTable.cssColor[worldData[index] % nColors];
            canvasContext.fillRect(x, y, blockWidth + 1, blockHeight + 1); // overprinting to avoid spurious light borders
            x += blockWidth;
            index += 1;
        }
        y += blockHeight;
    }
};

/*
 * linear interpolation for each pixel between the four 
 * closest world cells, rounding, gives index to color components
 */
display.linearInterpolation = function() {
    console.log('linear');
    const canvas = output.canvas;
    const canvasContext = canvas.getContext('2d');
    const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    // interpolation:
    // x and y are image coordinates
    // in one direction only: world cell 0 has center at 0.5, cell 1 at 1.5, thus
    // x (or y) between 0.5/size and 1.5/size interpolates between cells 0 and 1, (iHigh=1 and iLow=0) and so on
    // x between imageSize-1.5 and imageSize-0.5 interpolates between cells imageSize-2 and imageSize-1
    // use periodic boundary condition
    // x close to imageSize: interpolation between cell imageSize-1 and cell 0==imageSize
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const deltaX = worldWidth / canvasWidth;
    const deltaY = worldHeight / canvasHeight;
    let pixelIndex = 0;
    let y = 0;
};