/* jshint esversion: 6 */

import {
    output,
    ParamGui
}
from "../libgui/modules.js";

import {
    colorTable,
    displayRectangularColorTable
}
from "./modules.js";

/**
 * create an initial configuration for the cells
 * choosing between different symmetries, deterministic or random
 * display always
 * active only if automaton has stopped, explicit reset ?
 * @namespace initialCells
 */
export const initialCells = {};

// set info about the cells and the world
//=========================================================

var worldData, worldWidth, worldHeight, worldNStates;

// center of the world is at (centerX,centerY)
var centerX, centerY;

// world goes from i=-centerX, ... +centerX and j=-centerY, ... +centerY
// relative to this center, and for odd worldWidth and worldHeight

/**
 * set the width and height of the world, its center
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
    centerX = Math.floor(0.5 * worldWidth);
    centerY = Math.floor(0.5 * worldHeight);
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
 * limit number ranges in ui
 * @method initialCells.setNStates
 * @param {int} n
 */
initialCells.setNStates = function(n) {
    worldNStates = n;
    centerCellController.uiElement.setHigh(n - 1);
    nearestController.uiElement.setHigh(n - 1);
    secondController.uiElement.setHigh(n - 1);
};

// different setups -> choices
//=====================================================

// simple motif at center, depending on parameters

initialCells.centerMotif = function() {
    worldData.fill(0);
    setCell(0, 0, initialCells.center);
    setCell(1, 0, initialCells.nearest);
    setCell(-1, 0, initialCells.nearest);
    setCell(0, 1, initialCells.nearest);
    setCell(0, -1, initialCells.nearest);
    setCell(1, 1, initialCells.second);
    setCell(1, -1, initialCells.second);
    setCell(-1, 1, initialCells.second);
    setCell(-1, -1, initialCells.second);
};

// simply calculate a random state, of given number of states, 
// numbers 0...worldNStates
function randomState() {
    return Math.floor(worldNStates * Math.random());
}

// cell relative to center gets given value
function setCell(i, j, value) {
    worldData[centerX + i + (centerY + j) * worldWidth] = value;
}

// fill world with zeros, except border
// to get random numberss only at border
initialCells.border = function() {
    for (var i = -centerX + 1; i < centerX; i++) {
        for (var j = -centerY + 1; j < centerY; j++) {
            setCell(i, j, 0);
        }
    }
};

// do nothing, as 'filter'
initialCells.all = function() {};

// fill outside the axis
initialCells.axis = function() {
    for (var i = 1; i <= centerX; i++) {
        for (var j = 1; j <= centerY; j++) {
            setCell(i, j, 0);
            setCell(i, -j, 0);
            setCell(-i, j, 0);
            setCell(-i, -j, 0);
        }
    }
};

initialCells.random = function() {
    const length = worldData.length;
    for (var i = 0; i < length; i++) {
        worldData[i] = randomState();
    }
};

initialCells.randomBorder = function() {
    initialCells.random();
    fillInside();
};

initialCells.randomVerticalMirror = function() {
    for (var i = 0; i <= centerX; i++) {
        for (var j = -centerY; j <= centerY; j++) {
            const state = randomState();
            setCell(i, j, state);
            setCell(-i, j, state);
        }
    }
};

initialCells.randomBorderVerticalMirror = function() {
    initialCells.randomVerticalMirror();
    fillInside();
};

initialCells.randomVerticalHorizontalMirror = function() {
    for (var i = 0; i <= centerX; i++) {
        for (var j = 0; j <= centerY; j++) {
            const state = randomState();
            setCell(i, j, state);
            setCell(-i, j, state);
            setCell(i, -j, state);
            setCell(-i, -j, state);
        }
    }
};

initialCells.randomBorderVerticalHorizontalMirror = function() {
    initialCells.randomVerticalHorizontalMirror();
    fillInside();
};

initialCells.randomInversion = function() {
    for (var i = 0; i <= centerX; i++) {
        for (var j = -centerY; j <= centerY; j++) {
            const state = randomState();
            setCell(i, j, state);
            setCell(-i, -j, state);
        }
    }
};

initialCells.randomBorderInversion = function() {
    initialCells.randomInversion();
    fillInside();
};

initialCells.randomVerHorDiagMirror = function() {
    worldData.fill(0);
    const halfAxis = Math.min(centerX, centerY);
    for (var i = 0; i <= halfAxis; i++) {
        for (var j = 0; j <= i; j++) {
            const state = randomState();
            setCell(i, j, state);
            setCell(i, -j, state);
            setCell(-i, j, state);
            setCell(-i, -j, state);
            setCell(j, i, state);
            setCell(j, -i, state);
            setCell(-j, i, state);
            setCell(-j, -i, state);
        }
    }
};

initialCells.randomC4 = function() {
    worldData.fill(0);
    const halfAxis = Math.min(centerX, centerY);
    for (var i = 0; i <= halfAxis; i++) {
        for (var j = 0; j <= halfAxis; j++) {
            const state = randomState();
            setCell(i, j, state);
            setCell(-i, -j, state);
            setCell(j, -i, state);
            setCell(-j, i, state);
        }
    }
};

// making the ui and interacting
//======================================================

/**
 * drawing after changes of parameters: number of different colors and the color table type
 * here: drawing a sample for tests
 * overwrite for running life
 * @method initialCells.draw
 */
initialCells.draw = function() {
    console.error('initialCells.draw essentially undefined');
};

/**
 * make initial cell configuration and update the ui
 * @method initialCells.make
 */
initialCells.make = function() {
    if (initialCells.region === initialCells.centerMotif) {
        symmetryController.hide();
        redoButton.hide();
        centerCellController.show();
        nearestController.show();
        secondController.show();
        initialCells.centerMotif();
    } else {
        symmetryController.show();
        redoButton.show();
        centerCellController.hide();
        nearestController.hide();
        secondController.hide();
        initialCells.symmetry();
        initialCells.region();
    }
};

// setting up the choices
const regionOptions = {
    center: initialCells.centerMotif,
    all: initialCells.all,
    border: initialCells.border,
    axis: initialCells.axis
};

const symmetryOptions = {
    none: initialCells.random,
    mirror: initialCells.randomVerticalMirror,
    twoMirrors: initialCells.randomVerticalHorizontalMirror,
    inversion: initialCells.randomInversion,
    d4: initialCells.randomVerHorDiagMirror,
    c4: initialCells.randomC4
};

const selectionArgs = {
    type: 'selection',
    params: initialCells,
    onChange: function() {
        initialCells.make();
        initialCells.draw();
    }
};

initialCells.region = initialCells.centerMotif;
initialCells.symmetry = initialCells.random;

// number args object for the gui
const numberControllerArgs = {
    type: 'number',
    params: initialCells,
    onChange: function() {
        initialCells.make();
        initialCells.draw();
    }
};

initialCells.center = 3;
initialCells.nearest = 2;
initialCells.second = 1;

/**
 * create the gui (ui elements)
 * method initialCells.createUI
 * @param {ParamGui} gui
 */
var regionController, symmetryController, redoButton;
var centerCellController, nearestController, secondController;

initialCells.createUI = function(gui) {
    regionController = gui.add(selectionArgs, {
        property: 'region',
        options: regionOptions
    });
    symmetryController = gui.add(selectionArgs, {
        property: 'symmetry',
        options: symmetryOptions
    });
    redoButton = gui.add({
        type: 'button',
        buttonText: 'redo random pattern',
        onClick: function() {
            initialCells.make();
            initialCells.draw();
        }
    });

    centerCellController = gui.add(numberControllerArgs, {
        property: 'center'
    });
    nearestController = gui.add(numberControllerArgs, {
        property: 'nearest'
    });
    secondController = gui.add(numberControllerArgs, {
        property: 'second'
    });
};


// test this, and show how to set it up
//=======================================================

/**
 * set up a test
 * @method initialCells.setupTest
 */
initialCells.setupTest = function() {
    const gui = new ParamGui({}, {
        closed: false
    });
    output.createCanvas(gui);
    output.draw = displayRectangularColorTable.draw;
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
    const initGui = gui.addFolder({
        closed: false,
        name: 'initial configuration'
    });
    initialCells.createUI(gui);

    const height = 7;
    const width = 7;
    const nStates = 4;

    const world = [];
    world.length = width * height;

    // initialize this module
    initialCells.setDimensions(width, height);
    initialCells.setData(world);
    initialCells.setNStates(nStates);
    initialCells.draw = displayRectangularColorTable.draw;

    // final setup/display
    initialCells.make();

    // initialize the color table
    colorTable.setNColors(nStates);
    colorTable.create();
    colorTable.draw = displayRectangularColorTable.draw;
    // initialize display
    displayRectangularColorTable.setDimensions(width, height); // sets canvas width to height
    displayRectangularColorTable.setImageNStates(nStates);
    displayRectangularColorTable.setData(world);

    output.resizeCanvas(); // adjust to dimensions
    displayRectangularColorTable.draw();
};

/* use with
<script type="module">
import {
    initialCells,
}
from "./modules.js";

initialCells.setupTest();
</script>
*/