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

initialCells.center=1
initialCells.nearest=2;
initialCells.second=3;

initialCells.centerMotif=function(){
	worldData.fill(0);
const centerIndex=Math.floor(0.5*worldWidth*worldHeight)+1;
worldData[centerIndex]=initialCells.center;
};