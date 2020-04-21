/* jshint esversion: 6 */

import {
    transitionTable
}
from "./modules.js";

/**
 * generalization of Conways game of life
 * with periodic or 'zero' boundary condition
 * doing one single step
 * with ui for setting parameters (presets?)
 * @namespace irreversibleBasicAutomaton
 */
export const irreversibleBasicAutomaton = {};

//  methods for each automaton:
//=================================================

// setDimensions(width,height) - sets world dimensions and initializes special things
// step(world) - makes a step, advancing data in the world array
// createUI(gui) - creates the gui for specific parameters, NOTE: call gui.setActive(...) in the outside
// transitionTableLength(nStates) - calculate the length of the transition table depending on number of states and this model

//===================================================

var worldWidth, worldHeight;
irreversibleBasicAutomaton.oldWorld = []; // buffer for the lasst generation
var oldWorldWidth; // width of buffer, including periodically repeated (or zero) border

/**
 * set the width and height of the world
 * updates size of the oldWorldArray
 * @method displayRectangularColorTable.setDimensions
 * @param {int} width
 * @param {int} height - default: width
 */
irreversibleBasicAutomaton.setDimensions = function(width, height) {
    worldWidth = width;
    worldHeight = height;
    // world plus vertical and horizontal borders at end
    oldWorldWidth = width + 1;
    irreversibleBasicAutomaton.oldWorld.length = oldWorldWidth * (worldHeight + 1);
};

/**
 * determine length of transition table
 * depending on number of states and choosen weights
 * @method irreversibleBasicAutomaton.transitionTableLength
 * @param {int} nStates
 * @return integer, length of transition table
 */
irreversibleBasicAutomaton.transitionTableLength = function(nStates) {
    // maximum sum plus one
    // each cell can have value 0,1,..,nStates-1
    // table index can go from 0 to resulting maximum sum
    return (nStates - 1) * (irreversibleBasicAutomaton.centerWeight + 4 * (irreversibleBasicAutomaton.nearestWeight + irreversibleBasicAutomaton.secondNearestWeight)) + 1;
};

// data specific for this automaton
irreversibleBasicAutomaton.isPeriodic = true;
// simple weights for symmetric images 
irreversibleBasicAutomaton.centerWeight = 1; // 9 for Conways with nStates=2
irreversibleBasicAutomaton.nearestWeight = 1;
irreversibleBasicAutomaton.secondNearestWeight = 1;

// for calculating the step

/**
 * copy world data to old world, with upper and left borders
 * @method irreversibleBasicAutomaton.setupOldWorld
 * @param {Array} world
 */
irreversibleBasicAutomaton.setupOldWorld = function(world) {
    var i, j;
    const oldWorld = irreversibleBasicAutomaton.oldWorld;
    // simply copy the world
    for (j = 0; j < worldHeight; j++) {
        let iWorld = j * worldWidth;
        let iOldWorld = j * oldWorldWidth;
        for (i = 0; i < worldWidth; i++) {
            oldWorld[iOldWorld] = world[iWorld];
            iOldWorld += 1;
            iWorld += 1;
        }
    }
    if (irreversibleBasicAutomaton.isPeriodic) {
        // periodic borders
        for (j = 0; j < worldHeight; j++) {
            oldWorld[j * oldWorldWidth + worldWidth] = oldWorld[j * oldWorldWidth];
        }
        // the top row copies the first row
        const baseIndex = oldWorldWidth * worldHeight;
        for (i = 0; i < oldWorldWidth; i++) {
            oldWorld[i + baseIndex] = oldWorld[i];
        }
    } else {
        // zero borders
        for (j = 0; j < worldHeight; j++) {
            oldWorld[j * oldWorldWidth + worldWidth] = 0;
        }
        const baseIndex = oldWorldWidth * worldHeight;
        for (i = 0; i < oldWorldWidth; i++) {
            oldWorld[i + baseIndex] = 0;
        }
    }
};

/**
 * make a new generation
 * @method irreversibleBasicAutomaton.newGeneration
 * @param {Array} world
 */
irreversibleBasicAutomaton.newGeneration = function(world) {
    const oldWorld = irreversibleBasicAutomaton.oldWorld;
    const centerWeight = irreversibleBasicAutomaton.centerWeight;
    const nearestWeight = irreversibleBasicAutomaton.nearestWeight;
    const secondNearestWeight = irreversibleBasicAutomaton.secondNearestWeight;
    irreversibleBasicAutomaton.setupOldWorld(world);
    let iWorld = 0;
    for (var j = 0; j < worldHeight; j++) {
        // setup rolling-indices to oldWorld
        let centerIndex = j * oldWorldWidth;
        let highIndex = centerIndex + oldWorldWidth;
        let lowIndex = centerIndex - oldWorldWidth;
        if (lowIndex < 0) { // for calculating the first row
            if (irreversibleBasicAutomaton.isPeriodic) {
                lowIndex = (worldHeight - 1) * oldWorldWidth; // periodic, refers to top row of world
            } else {
                lowIndex = worldHeight * oldWorldWidth; // zero bc., refers to row of zeros 
            }
        }
        // start values for reading cells
        // for each cell read new cell at right, make sum, look up table, shift cells
        // setup cell data at left of the first cell, and at its horizontal position
        let cellHighRight = 0; // => oldWorld[highIndex+1]
        let cellHighCenter = oldWorld[highIndex];
        let cellHighLeft = 0;
        let cellCenterRight = 0;
        let cellCenterCenter = oldWorld[centerIndex];
        let cellCenterLeft = 0;
        let cellLowRight = 0;
        let cellLowCenter = oldWorld[lowIndex];
        let cellLowLeft = 0;
        if (irreversibleBasicAutomaton.isPeriodic) {
            cellHighLeft = oldWorld[highIndex - 1 + worldWidth];
            cellCenterLeft = oldWorld[centerIndex - 1 + worldWidth];
            cellLowLeft = oldWorld[lowIndex - 1 + worldWidth];
        }
        for (var i = 0; i < worldWidth; i++) {
            // read new cell data at right of cell
            highIndex += 1;
            cellHighRight = oldWorld[highIndex];
            centerIndex += 1;
            cellCenterRight = oldWorld[centerIndex];
            lowIndex += 1;
            cellLowRight = oldWorld[lowIndex];
            // making the sums
            const sumNearest = cellCenterLeft + cellHighCenter + cellLowCenter + cellCenterRight;
            const sumSecond = cellHighLeft + cellLowLeft + cellHighRight + cellLowRight;
            const sum = centerWeight * cellCenterCenter + nearestWeight * sumNearest + secondNearestWeight * sumSecond;
            // looking up the transition table and setting the new state
            if (sum >= transitionTable.table.length) console.error('sum too large ' + sum);
            world[iWorld] = transitionTable.table[sum];
            iWorld += 1;
            // shift cell data for advancing cell position
            cellHighLeft = cellHighCenter;
            cellHighCenter = cellHighRight;
            cellCenterLeft = cellCenterCenter;
            cellCenterCenter = cellCenterRight;
            cellLowLeft = cellLowCenter;
            cellLowCenter = cellLowRight;
        }
    }
};