/* jshint esversion: 6 */

import {
    output,
    Pixels
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

// of elements larger than zero
// not all cells<0 (?)
function maxArray(a) {
    const length = a.length;
    let result = a[0];
    for (let i = 1; i < length; i++) {
        result = Math.max(result, a[i]);
    }
    return result;
}

function minArray(a) {
    const length = a.length;
    let result = 100000;
    for (let i = 1; i < length; i++) {
        const element = a[i];
        if (element > 0) {
            result = Math.min(result, a[i]);
        }
    }
    return result;
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
colors.length = 255;
const colorForMover = Pixels.integerOfColor({
    red: 255,
    green: 0,
    blue: 0,
    alpha: 255
});

function greys() {
    for (let i = 0; i < 255; i++) {
        color.red = i;
        color.blue = i;
        color.green = i;
        colors[i] = Pixels.integerOfColor(color);
    }
}

//============================================
// doing the cell tables

// find index, return -1 if out of bounds and not periodic
function getIndex(i, j) {
    if (periodic) {
        if (i < 0) {
            i = i + size;
        }
        if (i >= size) {
            i = i - size;
        }
        if (j < 0) {
            j = j + size;
        }
        if (j >= size) {
            j = j - size;
        }
    } else {
        if ((i < 0) || (i >= size) || (j < 0) || (j >= size)) {
            return -1;
        }
    }
    return j * size + i;
}

function copyCells() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        cells[index] = newCells[index];
    }
}

function showCells() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const scale = 1 / trueMagnification;
    let imageIndex = 0;
    for (var j = 0; j < height; j++) {
        const jCellSize = size * Math.floor(j * scale);
        for (var i = 0; i < width; i++) {
            const iCell = Math.floor(i * scale);
            const cell = cells[jCellSize + iCell];
            if (cell < 0) {
                pixels.array[imageIndex] = colorForMover;
            } else {
                pixels.array[imageIndex] = colors[cell];
            }
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

function initial8() {
    const center = (size + 1) * Math.floor(size / 2);
    cells[center + 1] = -right;
    cells[center + 1 + size] = -upRight;
    cells[center + size] = -up;
    cells[center - 1 + size] = -upLeft;
    cells[center - 1] = -left;
    cells[center - 1 - size] = -downLeft;
    cells[center - size] = -down;
    cells[center + 1 - size] = -downRight;
}

// test if there are moving cells
function hasMoving() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        if (cells[index] < 0) {
            return true;
        }
    }
    return false;
}

// number of neighboring moving things
function neighborsMoving(i, j) {
    let sum = 0;
    let index = getIndex(i + 1, j);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j + 1);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i, j + 1);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i + 1, j + 1);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j - 1);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i, j - 1);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    index = getIndex(i + 1, j - 1);
    if ((index >= 0) && (cells[index] < 0)) {
        sum += 1;
    }
    return sum;
}

// calculate number of static neighbors
function neighborsStatic(i, j) {
    let sum = 0;
    let index = getIndex(i + 1, j);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j + 1);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i, j + 1);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i + 1, j + 1);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j - 1);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i, j - 1);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    index = getIndex(i + 1, j - 1);
    if ((index >= 0) && (cells[index] > 0)) {
        sum += 1;
    }
    return sum;
}

// calculate number of empty neighbors
function neighborsEmpty(i, j) {
    let sum = 0;
    let index = getIndex(i + 1, j);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j + 1);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i, j + 1);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i + 1, j + 1);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i - 1, j - 1);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i, j - 1);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    index = getIndex(i + 1, j - 1);
    if ((index >= 0) && (cells[index] === 0)) {
        sum += 1;
    }
    return sum;
}

// try to place a moving thing on cell (i,j)
// success if cell empty and surrounded by not more than one moving cell
// (to save symmetry, avoid collision)
function trySimpleMove(thing, i, j) {
    const newIndex = getIndex(i, j);
    if ((newIndex >= 0) && (cells[newIndex] === 0) && (neighborsMoving(i, j) <= 1)) {
        newCells[newIndex] = thing;
    }
}

// simple move
// copy static cells
// move moving, disappear in case of collision
// leave trail of given value staticCell
function simpleMove() {
    axisSteps += 1;
    let doDiagonal = false;
    if (diagonalSteps < 0.707 * axisSteps) {
        doDiagonal = true;
        diagonalSteps += 1;
    }
    newCells.fill(0);
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element >= 0) {
                if (element > 0) {
                    newCells[index] = element;
                }
            } else {
                switch (-element % 10) {
                    case right:
                        trySimpleMove(element, i + 1, j);
                        newCells[index] = trailCell;
                        break;
                    case up:
                        trySimpleMove(element, i, j + 1);
                        newCells[index] = trailCell;
                        break;
                    case left:
                        trySimpleMove(element, i - 1, j);
                        newCells[index] = trailCell;
                        break;
                    case down:
                        trySimpleMove(element, i, j - 1);
                        newCells[index] = trailCell;
                        break;
                    case upRight:
                        if (doDiagonal) {
                            trySimpleMove(element, i + 1, j + 1);
                            newCells[index] = trailCell;
                        }
                        break;
                    case upLeft:
                        if (doDiagonal) {
                            trySimpleMove(element, i - 1, j + 1);
                            newCells[index] = trailCell;
                        }
                        break;
                    case downLeft:
                        if (doDiagonal) {
                            trySimpleMove(element, i - 1, j - 1);
                            newCells[index] = trailCell;
                        }
                        break;
                    case downRight:
                        if (doDiagonal) {
                            trySimpleMove(element, i + 1, j - 1);
                            newCells[index] = trailCell;
                        }
                        break;
                }
            }
        }
    }
}

// create
function spawn90() {
    newCells.fill(0);
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element >= 0) {
                if (element > 0) {
                    newCells[index] = element;
                }
            } else {
                newCells[index] = trailCell;
                switch (-element % 10) {
                    case right:
                        trySimpleMove(element, i + 1, j);
                        trySimpleMove(-down - 10, i, j - 1);
                        trySimpleMove(-up - 20, i, j + 1);
                        break;
                    case up:
                        trySimpleMove(element, i, j + 1);
                        trySimpleMove(-right - 10, i + 1, j);
                        trySimpleMove(-left - 20, i - 1, j);
                        break;
                    case left:
                        trySimpleMove(element, i - 1, j);
                        trySimpleMove(-up - 10, i, j + 1);
                        trySimpleMove(-down - 20, i, j - 1);
                        break;
                    case down:
                        trySimpleMove(element, i, j - 1);
                        trySimpleMove(-left - 10, i - 1, j);
                        trySimpleMove(-right - 20, i + 1, j);
                        break;
                    case upRight:
                        trySimpleMove(element, i + 1, j + 1);
                        trySimpleMove(-downRight - 10, i + 1, j);
                        trySimpleMove(-upLeft - 20, i, j + 1);
                        break;
                    case upLeft:
                        trySimpleMove(element, i - 1, j + 1);
                        trySimpleMove(-upRight - 10, i, j + 1);
                        trySimpleMove(-downLeft - 20, i - 1, j);
                        break;
                    case downLeft:
                        trySimpleMove(element, i - 1, j - 1);
                        trySimpleMove(-upLeft - 10, i - 1, j);
                        trySimpleMove(-downRight - 20, i, j - 1);
                        break;
                    case downRight:
                        trySimpleMove(element, i + 1, j - 1);
                        trySimpleMove(-downLeft - 10, i, j - 1);
                        trySimpleMove(-upRight - 20, i + 1, j);
                        break;
                }
            }
        }
    }
}

// rotate direction of move
function rotate90() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element < 0) {
            if (-element % 10 >= 7) {
                element += 6;
            } else {
                element -= 2;
            }
        }
        newCells[index] = element;
    }
}

// strong color change
function lighten() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element > 0) {
            element = Math.max(1, Math.min(255, element + lightenValue));
        }
        newCells[index] = element;
    }
}

// create new static cells at places near occupied cell
function expand() {
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element != 0) {
                newCells[index] = element;
            } else {
                if ((neighborsMoving(i, j) === 0) && (neighborsStatic(i, j) > 0)) {
                    newCells[index] = expanCell;
                } else {
                    newCells[index] = 0;
                }
            }
        }
    }
}

// delete static cells in contact with empty cells
function shrink() {
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element <= 0) {
                newCells[index] = element;
            } else {
                if (neighborsEmpty(i, j) > 0) {
                    newCells[index] = 0;
                } else {
                    newCells[index] = element;
                }
            }
        }
    }
}

// smoothing: delete static cells with less than 4
function smooth() {
    console.log('smooth');
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element <= 0) {
                newCells[index] = element;
            } else {
                if (neighborsEmpty(i, j) > 4) {
                    newCells[index] = 0;
                } else {
                    newCells[index] = element;
                }
            }
        }
    }
}

// change value of static cells, as part of the evolution step
function age() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        const element = cells[index];
        if (element > 0) {
            cells[index] = Math.max(1, Math.min(255, element + ageStep));
        }
    }
}

//=========================================

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

automaton.magnification = 10;

// drawing: canvas might have been resized
automaton.draw = function() {
    output.startDrawing();
    output.canvasContext.fillStyle = '#8888ff';
    output.canvasContext.fillRect(0, 0, output.canvas.width, output.canvas.height);
    showCells();
};

automaton.step = function() {
    console.log('automaton steps');
    if (hasMoving()) {
        age();
        randomAction();
        copyCells();
    } else {
        automaton.reset();
    }
};

// reset, and a new random setup
automaton.reset = function() {
    logger.clear();
    console.log('automaton resets');
    size = output.canvas.width / automaton.magnification;
    size = 2 * Math.floor(size / 2) + 1;
    trueMagnification = output.canvas.width / size; // show block pixels, round down
    extend(cells, size * size);
    cells.fill(0);
    extend(newCells, size * size);
    axisSteps = 0;
    diagonalSteps = 0;
    clearActions();
    addAction(simpleMove, 1);
    addAction(spawn90, 0.3);
    //addAction(expand, 0.2);
    //   addAction(shrink, 0.2);
    //  addAction(smooth, 0.2);
    //  addAction(rotate90, 0.2);
    addAction(lighten, 0.2);

    greys();

    initial4();

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
    });
    logger = main.gui.addLogger();
};