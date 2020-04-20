/* jshint esversion: 6 */

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

// data specific for this automaton
irreversibleBasicAutomaton.isPeriodic = true;
// weights compatible with Conways automaton (nStates=2)
irreversibleBasicAutomaton.centerWeight = 9;
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
    irreversibleBasicAutomaton.setupOldWorld(world);

    let iWorld = 0;

    for (var j = 0; j < worldHeight; j++) {
        // setup rows-indices to oldWorld
        let iCenter = j * oldWorldWidth;
        let iHigh = iCenter + oldWorldWidth;
        let iLow = iCenter - oldWorldWidth;
        if (iLow < 0) { // for calculating the first row
            if (irreversibleBasicAutomaton.isPeriodic) {
                iLow = (worldHeight - 1) * oldWorldWidth; // periodic, refers to top row of world
            } else {
                iLow = worldHeight * oldWorldWidth; // zero bc., refers to row of zeros 
            }
        }
        // start values for reading cells
        // for each cell read new cell at right, make sum, look up table, shift cells
        let cellHighRight = 0;
        let cellHighCenter = oldWorld[iHigh];
        let cellHighLeft = 0;


        if (irreversibleBasicAutomaton.isPeriodic) {
            cellHighLeft = oldWorld[iHigh - 1 + worldWidth];
        }


    }

};