/* jshint esversion: 6 */

import {
    ParamGui
}
from "../libgui/modules.js";

/**
 * create an initial configuration for the cells
 * choosing between different symmetries, deterministicc or random
 * @namespace initialCells
 */
export const initialCells = {};

// set info about the cells

var worldData, worldWidth, worldHeight, worldNStates;

/**
 * set the width and height of the world
 * @method initialCells.setDimensions
 * @param {int} width
 * @param {int} height - default: width
 */
initialCells.setDimensions = function(width, height) {
    if ((width & 1) === 0) {
        console.error("initialCells.setDimensions: width should be an odd number, it is " + width);
    }
    if ((height & 1) === 0) {
        console.error("initialCells.setDimensions: height should be an odd number, it is " + height);
    }
    worldWidth = width;
    worldHeight = height;
};

/**
 * set the world data array with the cells
 * it is one integer per cell
 * the length of the array will be adjusted
 * @method initialCells.setData
 * @param {Array of int} data - can use Uint8Array
 */
initialCells.setData = function(data) {
    worldData = data;
};

/**
 * set the number of states of the cells
 * determines max for parameters or random numbers
 * @method initialCells.setNStates
 * @param {int} n
 */
initialCells.setNStates = function(n) {
    worldNStates = n;
};

/**
 * drawing after changes of parameters: number of different colors and the color table type
 * here: drawing a sample for tests
 * overwrite for running life
 * @method initialCells.draw
 */
initialCells.draw = function() {
    console.log('draw');
    console.log(worldData);
    // displayRectangularColorTable.interpolation();
};

// different setups -> choices
//=====================================================

// simple motif at center, depending on parameters

initialCells.center = 3;
initialCells.nearest = 2;
initialCells.second = 1;

initialCells.centerMotif = function() {
    worldData.fill(0);
    const centerIndex = Math.floor(0.5 * worldWidth * worldHeight);
    worldData[centerIndex] = initialCells.center;
    worldData[centerIndex + 1] = initialCells.nearest;
    worldData[centerIndex - 1] = initialCells.nearest;
    worldData[centerIndex + worldWidth] = initialCells.nearest;
    worldData[centerIndex - worldWidth] = initialCells.nearest;
    worldData[centerIndex + 1 + worldWidth] = initialCells.second;
    worldData[centerIndex + 1 - worldWidth] = initialCells.second;
    worldData[centerIndex - 1 + worldWidth] = initialCells.second;
    worldData[centerIndex - 1 - worldWidth] = initialCells.second;
};

function randomState() {
    return Math.floor(worldNStates * Math.random());
}

initialCells.random = function() {
    const length = worldData.length;
    for (var i = 0; i < length; i++) {
        worldData[i] = randomState();
    }
};

initialCells.randomBorder = function() {
    worldData.fill(0);
    for (var i = 0; i < worldWidth; i++) {
        worldData[i] = randomState();
        worldData[worldData.length - 1 - worldWidth + i] = randomState();
    }
    for (var j = 0; j < worldHeight; j++) {
        worldData[j * worldWidth] = randomState();
        worldData[j * worldWidth + worldWidth - 1] = randomState();
    }
};

initialCells.randomBorderVerticalMirror = function() {
    worldData.fill(0);
    const centerX = Math.floor(0.5 * worldWidth);
    for (var i = 0; i <= centerX; i++) {
        const ii = worldWidth - 1 - i;
        let state = randomState();
        worldData[i] = state;
        worldData[ii] = state;
        state = randomState();
        // top line goes from worldData.length-worldWidth ... worldData.length-1
        worldData[worldData.length - worldWidth + i] = state;
        worldData[worldData.length - worldWidth + ii] = state;
    }
    for (var j = 0; j < worldHeight; j++) {
        const state = randomState();
        worldData[j * worldWidth] = state;
        worldData[j * worldWidth + worldWidth - 1] = state;
    }
};

initialCells.randomVerticalMirror = function() {
    const centerX = Math.floor(0.5 * worldWidth);
    for (var i = 0; i <= centerX; i++) {
        // mirror image:
        // index in x-direction goes from 0...worldWidth-1
        const ii = worldWidth - 1 - i;
        for (var j = 0; j < worldHeight; j++) {
            const state = randomState();
            worldData[i + worldWidth * j] = state;
            worldData[ii + worldWidth * j] = state;
        }
    }
};

initialCells.randomVerticalHorizontalMirror = function() {
    const centerX = Math.floor(0.5 * worldWidth);
    const centerY = Math.floor(0.5 * worldHeight);
    for (var i = 0; i <= centerX; i++) {
        // mirror image:
        // index in x-direction goes from 0...worldWidth-1
        const ii = worldWidth - 1 - i;
        for (var j = 0; j <= centerY; j++) {
            const jj = worldHeight - 1 - j;
            const state = randomState();
            worldData[i + worldWidth * j] = state;
            worldData[ii + worldWidth * j] = state;
            worldData[i + worldWidth * jj] = state;
            worldData[ii + worldWidth * jj] = state;
        }
    }
};
// horizontal and vertical mirrors

// horizontal, vertical and diagonal mirrors, only for square world
// for other worlds padded with zeros