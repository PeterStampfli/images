/* jshint esversion: 6 */

import {
    output,
    Pixels,
    guiUtils
} from "../libgui/modules.js";

import {
    main,
    runner
} from './mainGrower.js';

export const automaton = {};

var logger;

//=====================================
// utilities

// choose from a random array
function randomChoice(options) {
    const index = Math.floor(options.length * Math.random());
    return options[index];
}

// extend an array/matrix/vector
function extend(space, minLength) {
    if (space.length < minLength) {
        space.length = minLength;
    }
}

// log array of size*size elements
function logArray(array) {
    let index = 0;
    for (let j = 0; j < size; j++) {
        let message = j + ' : ';
        for (let i = 0; i < size; i++) {
            message += ' ' + array[index];
            index += 1;
        }
        console.log(message);
    }
}

function clearBorder() {
    const toLastRow = size * (size - 1);
    for (let i = 0; i < size; i++) {
        cells[i] = 0;
        cells[i + size] = 0;
        cells[i + toLastRow] = 0;
        cells[i + toLastRow - size] = 0;
    }
    for (let i = size; i < toLastRow; i += size) {
        cells[i] = 0;
        cells[i + 1] = 0;
        cells[i + size - 1] = 0;
        cells[i + size - 2] = 0;
    }
}

function copyNewCellsToCells() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        cells[index] = newCells[index];
    }
}

function copyPositiveCellsToNewCells() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        newCells[index] = Math.max(0, cells[index]);
    }
}

//=================================

// one to one image pixels and cells
function directImage() {
    if (trueMagnification !== 1) {
        console.error('directImage: Magnification is not equal to 1, it is ' + trueMagnification);
        return;
    }
    console.log('directImage');
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    let imageIndex = 0;
    // going over image pixels, skipping border cells
    for (var j = 0; j < height; j++) {
        // skip first two cell rows (border)
        const jCellSize = size * (2 + j);
        for (var i = 0; i < width; i++) {
            // skip first two cell columns (border)
            const cell = cells[jCellSize + i + 2];
            if (cell < -20) {
                pixels.array[imageIndex] = colorForMoverLeft;
            } else if (cell < -10) {
                pixels.array[imageIndex] = colorForMoverRight;
            } else if (cell < 0) {
                pixels.array[imageIndex] = colorForMover;
            } else {
                pixels.array[imageIndex] = colors[cell];
            }
            imageIndex += 1;
        }
    }
    output.pixels.show();
}

// image shows cells as block pixels
// shows moving cells
function nearestImage() {
    if (trueMagnification === 1) {
        directImage();
        return;
    }
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const scale = (size - 4) / width;
    let imageIndex = 0;
    for (var j = 0; j < height; j++) {
        const jCellSize = size * Math.floor(2 + j * scale);
        for (var i = 0; i < width; i++) {
            const iCell = 2 + Math.floor(i * scale);
            const cell = cells[jCellSize + iCell];
            if (cell < -20) {
                pixels.array[imageIndex] = colorForMoverLeft;
            } else if (cell < -10) {
                pixels.array[imageIndex] = colorForMoverRight;
            } else if (cell < 0) {
                pixels.array[imageIndex] = colorForMover;
            } else {
                pixels.array[imageIndex] = colors[cell];
            }
            imageIndex += 1;
        }
    }
    output.pixels.show();
}

// with linear interpolation
// moving things are invisible
function linearImage() {
    if (trueMagnification === 1) {
        directImage();
        return;
    }
    copyPositiveCellsToNewCells();
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const scale = (size - 4) / width; // inverse of size of a cell in pixels
    const offset = (3 + scale) / 2;
    let imageIndex = 0;
    for (var j = 0; j < height; j++) {
        const y = scale * j + offset;
        const jCell = Math.floor(y);
        const jCellSize = size * jCell;
        const jPlusCellSize = jCellSize + size;
        const dy = y - jCell;
        const dyPlus = 1 - dy;
        for (var i = 0; i < width; i++) {
            const x = i * scale + offset;
            const iCell = Math.floor(x);
            const iCellPlus = iCell + 1;
            const dx = x - iCell;
            const dxPlus = 1 - dx;
            let sum = dyPlus * (dxPlus * newCells[jCellSize + iCell] + dx * newCells[jCellSize + iCellPlus]);
            sum += dy * (dxPlus * newCells[jPlusCellSize + iCell] + dx * newCells[jPlusCellSize + iCellPlus]);
            pixels.array[imageIndex] = colors[Math.round(sum)];
            imageIndex += 1;
        }
    }
    output.pixels.show();
}


/*
 * the interpolation kernel: linear interpolation is much slower, the arrow function form is slightly slower
 * it is normalized to 1 within an error of about 1.00001 ! (good enough)
 */
function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
    if (x < 1) {
        return (1.16666 * x - 2) * x * x + 0.888888;
    }
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

// cubic interpolation, moving things invisible
function cubicImage() {
    if (trueMagnification === 1) {
        directImage();
        return;
    }
    copyPositiveCellsToNewCells();
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const scale = (size - 4) / width; // inverse of size of a cell in pixels
    const offset = (3 + scale) / 2;
    let imageIndex = 0;
    for (var j = 0; j < height; j++) {
        const y = scale * j + offset;
        const jCell = Math.floor(y);
        const dy = y - jCell;
        const jCellSize = size * jCell;
        const jMCellSize = jCellSize - size;
        const j1CellSize = jCellSize + size;
        const j2CellSize = j1CellSize + size;
        const kym = kernel(1 + dy);
        const ky = kernel(dy);
        const ky1 = kernel(1 - dy);
        const ky2 = kernel(2 - dy);
        for (var i = 0; i < width; i++) {
            const x = i * scale + offset;
            const iCell = Math.floor(x);
            const dx = x - iCell;
            const cellIndex = jCellSize + iCell;
            const cellIndexM = jMCellSize + iCell;
            const cellIndex1 = j1CellSize + iCell;
            const cellIndex2 = j2CellSize + iCell;
            let kx = kernel(1 + dx);
            let sum = kx * (kym * newCells[cellIndexM - 1] + ky * newCells[cellIndex - 1] + ky1 * newCells[cellIndex1 - 1] + ky2 * newCells[cellIndex2 - 1]);
            kx = kernel(dx);
            sum += kx * (kym * newCells[cellIndexM] + ky * newCells[cellIndex] + ky1 * newCells[cellIndex1] + ky2 * newCells[cellIndex2]);
            kx = kernel(1 - dx);
            sum += kx * (kym * newCells[cellIndexM + 1] + ky * newCells[cellIndex + 1] + ky1 * newCells[cellIndex1 + 1] + ky2 * newCells[cellIndex2 + 1]);
            kx = kernel(2 - dx);
            sum += kx * (kym * newCells[cellIndexM + 2] + ky * newCells[cellIndex + 2] + ky1 * newCells[cellIndex1 + 2] + ky2 * newCells[cellIndex2 + 2]);
            pixels.array[imageIndex] = colors[Math.round(sum)];
            imageIndex += 1;
        }
    }
    output.pixels.show();
}

//======================================================

function initial1() {
    const center = Math.floor(size / 2);
    cells[center] = -up;
}

function initial2() {
    const center = (size + 1) * Math.floor(size / 2);
    cells[center + size] = -up;
    cells[center - size] = -down;
}

function initial4() {
    const center = (size + 1) * Math.floor(size / 2);
    cells[center + 1] = -right;
    cells[center + size] = -up;
    cells[center - 1] = -left;
    cells[center - size] = -down;
}

function initial4Diagonal() {
    const center = (size + 1) * Math.floor(size / 2);
    cells[center + 1 + size] = -upRight;
    cells[center - 1 + size] = -upLeft;
    cells[center - 1 - size] = -downLeft;
    cells[center + 1 - size] = -downRight;
}

function initial8() {
    initial4Diagonal();
    const center = (size + 1) * Math.floor(size / 2);
    cells[center + 2] = -right;
    cells[center + 2 * size] = -up;
    cells[center - 2] = -left;
    cells[center - 2 * size] = -down;
}

//==========================================
// action choices

const actions = [];
const actionWeights = [];
var actionSum = 0;

function clearActions() {
    actionSum = 0;
    actions.length = 0;
    actionWeights.length = 0;
}

function addAction(action, weight) {
    actionSum += weight;
    actions.push(action);
    actionWeights.push(weight);
}

function randomAction() {
    let choice = actionSum * Math.random();
    const length = actions.length - 1;
    for (let i = 0; i < length; i++) {
        choice -= actionWeights[i];
        if (choice < 0) {
            const action = actions[i];
            action();
            return;
        }
    }
    const action = actions[length];
    action();
}

//=======================================
// color tables as integer colors

const color = {};
color.alpha = 255;
const colors = [];
colors.length = 256;
const colorForMover = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: 255
});
const colorForMoverLeft = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 0,
    alpha: 255
});
const colorForMoverRight = Pixels.integerOfColor({
    red: 0,
    green: 255,
    blue: 0,
    alpha: 255
});

function greys() {
    for (let i = 0; i < 256; i++) {
        color.red = i;
        color.blue = i;
        color.green = i;
        colors[i] = Pixels.integerOfColor(color);
    }
}

function colorTest() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = output.canvas.height;
    const blockSize = Math.floor(width / 20) + 1;
    let index = 0;
    for (var j = 0; j < height; j++) {
        const colorIndexBase = Math.floor(j / blockSize) * Math.floor(width / blockSize);
        for (var i = 0; i < width; i++) {
            const colorIndex = (colorIndexBase + Math.floor(i / blockSize)) % 256;
            pixels.array[index] = colors[colorIndex];
            index += 1;
        }
    }
    output.pixels.show();
}

//=======================================

// cells<0 are moving
// cells>0 are static images

// directions: 1 right, 2 up right, 3 up, 4 up left, 5 left, 6 down left, 7 down, 8 down right

// -1x goes to the right at obstacle, -2x goes to the left

const right = 1;
const upRight = 2;
const up = 3;
const upLeft = 4;
const left = 5;
const downLeft = 6;
const down = 7;
const downRight = 8;

// cell arrays with borders of 2 hidden cells
const cells = [];
const newCells = [];
var size;
var trueMagnification;
var axisSteps, diagonalSteps;
// parameters
var periodic = false;
// value for static cells in trail of moving things
var trailCell = 128;
// value for expanding static cells
var expanCell = 200;
// value for ageing
var ageStep = 5;
var lightenValue = 50;
var darkenValue = 30;

automaton.magnification = 30;
automaton.saveLast = false;

// drawing: canvas might have been resized
automaton.draw = function() {
    output.startDrawing();
    nearestImage();

    //colorTest();
};

automaton.step = function() {
    if (hasMoving()) {
        clearBorder();
        age();
        randomAction();
        copyCells();
    } else {
        if (!runner.recording && automaton.saveLast) {
            const name = output.saveName.getValue();
            const type = output.saveType.getValue();
            guiUtils.saveCanvasAsFile(output.canvas, name, type,
                function() {
                    runner.reset();
                });
        } else {
            runner.reset();
        }
    }
};

// reset, and a new random setup
automaton.reset = function() {
    logger.clear();
    // determine active cells size
    size = output.canvas.width / automaton.magnification;
    size = 2 * Math.floor(size / 2) + 1;
    trueMagnification = output.canvas.width / size; // show block pixels, round down
    // add double border
    size += 4;
    extend(cells, size * size);
    cells.fill(0);
    extend(newCells, size * size);
    axisSteps = 0;
    diagonalSteps = 0;
    clearActions();
    /*  addAction(simpleMove, 1);
    addAction(spawn1359045, 0.2);
    // addAction(spawn45, 0.3);
    //   addAction(expand, 0.2);
    //   addAction(shrink, 0.2);
    //  addAction(smooth, 0.2);
    //  addAction(rotate90, 0.2);
    //addAction(rotateMinus90, 0.4);
    //   addAction(darken, 0.4);
*/
    greys();

    initial4Diagonal();

    logArray(cells);

};

automaton.setup = function() {
    console.log('automaton setup');
    main.gui.add({
        type: 'number',
        params: automaton,
        property: 'magnification',
        step: 1,
        min: 1,
        onChange: function() {
            automaton.reset();
        }
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'saveLast',
        labelText: 'save last image'
    });
    logger = main.gui.addLogger();
};