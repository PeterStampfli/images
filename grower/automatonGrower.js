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

// for using the next generation as current generation
// set collision of moving things (double trouble) to zero (preserve symmetry)
function copyNewCellsToCells() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let cell = newCells[index];
        if (cell === doubleTrouble) {
            cell = 0;
        }
        cells[index] = cell;
    }
}

// for imaging
function copyPositiveCellsToNewCells() {
    const length = size * size;
    for (let index = 0; index < length; index++) {
        newCells[index] = Math.max(0, cells[index]);
    }
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

// find index, return -1 if out of cell array or in border
// for all (i,j) with valid index>=0 there are valid neighbors
function getIndexInsideBorder(i, j) {
    if ((i < 2) || (i >= size - 2) || (j < 2) || (j >= size - 2)) {
        return -1;
    }
    return j * size + i;
}

// find index, return -1 if out of cell array
// for all (i,j) with valid index>=0 there are valid neighbors
function getIndexOnArray(i, j) {
    if ((i < 0) || (i >= size) || (j < 0) || (j >= size)) {
        return -1;
    }
    return j * size + i;
}

// number of neighboring static cells > 0
function neighborsMoving(i, j) {
    let sum = 0;
    const index = getIndexInsideBorder(i, j);
    if (index >= 0) {
        if (cells[index + 1] < 0) {
            sum += 1;
        }
        if (cells[index - 1] < 0) {
            sum += 1;
        }
        if (cells[index + size] < 0) {
            sum += 1;
        }
        if (cells[index - size] < 0) {
            sum += 1;
        }
        if (cells[index + size + 1] < 0) {
            sum += 1;
        }
        if (cells[index - size + 1] < 0) {
            sum += 1;
        }
        if (cells[index + size - 1] < 0) {
            sum += 1;
        }
        if (cells[index - size - 1] < 0) {
            sum += 1;
        }
    }
    return sum;
}

// number of neighboring static cells > 0
function neighborsStatic(i, j) {
    let sum = 0;
    const index = getIndexInsideBorder(i, j);
    if (index >= 0) {
        if (cells[index + 1] > 0) {
            sum += 1;
        }
        if (cells[index - 1] > 0) {
            sum += 1;
        }
        if (cells[index + size] > 0) {
            sum += 1;
        }
        if (cells[index - size] > 0) {
            sum += 1;
        }
        if (cells[index + size + 1] > 0) {
            sum += 1;
        }
        if (cells[index - size + 1] > 0) {
            sum += 1;
        }
        if (cells[index + size - 1] > 0) {
            sum += 1;
        }
        if (cells[index - size - 1] > 0) {
            sum += 1;
        }
    }
    return sum;
}

// number of empty neighboring cells
function neighborsEmpty(i, j) {
    let sum = 0;
    const index = getIndexInsideBorder(i, j);
    if (index >= 0) {
        if (cells[index + 1] === 0) {
            sum += 1;
        }
        if (cells[index - 1] === 0) {
            sum += 1;
        }
        if (cells[index + size] === 0) {
            sum += 1;
        }
        if (cells[index - size] === 0) {
            sum += 1;
        }
        if (cells[index + size + 1] === 0) {
            sum += 1;
        }
        if (cells[index - size + 1] === 0) {
            sum += 1;
        }
        if (cells[index + size - 1] === 0) {
            sum += 1;
        }
        if (cells[index - size - 1] === 0) {
            sum += 1;
        }
    }
    return sum;
}

// try to create a moving thing on cell (i,j)
// success if cell empty, 
// if cell in new generation occupied with moving thing or doubleTrouble
// set cell to double trouble, return success
// (to save symmetry, avoid collision)
// creates things on border too, will be cleared later
function trySimpleCreate(thing, i, j) {
    const index = j * size + i;
    if (cells[index] !== 0) {
        // going onto an occupied cell (in the current and next generation)
        return false;
    } else {
        // going onto an empty cell in the current generation
        // check the next generation
        if (newCells[index] === 0) {
            // place is not yet occupied, the moving thing can go there
            newCells[index] = thing;
        } else {
            // place is occupied (by another moving thing), delete both in the end
            newCells[index] = doubleTrouble;
        }
        return true;
    }
}

// change value of static cells, as part of the evolution step
function age() {
    const length = size * size - 2 * size;
    for (let index = 2 * size; index < length; index++) {
        const element = cells[index];
        if (element > 0) {
            cells[index] = Math.max(1, Math.min(255, element + ageStep));
        }
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
    console.log('simplemove diag step ' + doDiagonal);
    newCells.fill(0);
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element >= 0) {
                // do not overwrite moving things
                if (element > 0) {
                    newCells[index] = element;
                }
            } else {
                switch (-element % 10) {
                    case right:
                        trySimpleCreate(element, i + 1, j);
                        newCells[index] = trailCell;
                        break;
                    case up:
                        trySimpleCreate(element, i, j + 1);
                        newCells[index] = trailCell;
                        break;
                    case left:
                        trySimpleCreate(element, i - 1, j);
                        newCells[index] = trailCell;
                        break;
                    case down:
                        trySimpleCreate(element, i, j - 1);
                        newCells[index] = trailCell;
                        break;
                    case upRight:
                        if (doDiagonal) {
                            trySimpleCreate(element, i + 1, j + 1);
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case upLeft:
                        if (doDiagonal) {
                            trySimpleCreate(element, i - 1, j + 1);
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case downLeft:
                        if (doDiagonal) {
                            trySimpleCreate(element, i - 1, j - 1);
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case downRight:
                        if (doDiagonal) {
                            trySimpleCreate(element, i + 1, j - 1);
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                }
            }
        }
    }
}

// avoiding move
// copy static cells
// move moving, try to turn 90 degrees at collision
// leave trail of given value staticCell
function moveTurn90() {
    axisSteps += 1;
    let doDiagonal = false;
    if (diagonalSteps < 0.707 * axisSteps) {
        doDiagonal = true;
        diagonalSteps += 1;
    }
    console.log('move turn 90, diag step ' + doDiagonal);
    newCells.fill(0);
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element >= 0) {
                // do not overwrite moving things
                if (element > 0) {
                    newCells[index] = element;
                }
            } else {
                switch (-element % 10) {
                    case right:
                        if (!trySimpleCreate(element, i + 1, j)) {
                            if (element < -20) {
                                trySimpleCreate(-20 - up, i, j + 1);
                            } else {
                                trySimpleCreate(-10 - down, i, j - 1);
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case up:
                        if (!trySimpleCreate(element, i, j + 1)) {
                            if (element < -20) {
                                trySimpleCreate(-20 - left, i - 1, j);
                            } else {
                                trySimpleCreate(-10 - right, i + 1, j);
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case left:
                        if (!trySimpleCreate(element, i - 1, j)) {
                            if (element < -20) {
                                trySimpleCreate(-20 - down, i, j - 1);
                            } else {
                                trySimpleCreate(-10 - up, i, j + 1);
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case down:
                        if (!trySimpleCreate(element, i, j - 1)) {
                            if (element < -20) {
                                trySimpleCreate(-20 - right, i + 1, j);
                            } else {
                                trySimpleCreate(-10 - left, i - 1, j);
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case upRight:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i + 1, j + 1)) {
                                if (element < -20) {
                                    trySimpleCreate(-20 - upLeft, i - 1, j + 1);
                                } else {
                                    trySimpleCreate(-10 - downRight, i + 1, j - 1);
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case upLeft:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i - 1, j + 1)) {
                                if (element < -20) {
                                    trySimpleCreate(-20 - downLeft, i - 1, j - 1);
                                } else {
                                    trySimpleCreate(-10 - upRight, i + 1, j + 1);
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case downLeft:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i - 1, j - 1)) {
                                if (element < -20) {
                                    trySimpleCreate(-20 - downRight, i + 1, j - 1);
                                } else {
                                    trySimpleCreate(-10 - upLeft, i - 1, j + 1);
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case downRight:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i + 1, j - 1)) {
                                if (element < -20) {
                                    trySimpleCreate(-20 - upRight, i + 1, j + 1);
                                } else {
                                    trySimpleCreate(-10 - downLeft, i - 1, j - 1);
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                }
            }
        }
    }
}

function moveTurn9045() {
    axisSteps += 1;
    let doDiagonal = false;
    if (diagonalSteps < 0.707 * axisSteps) {
        doDiagonal = true;
        diagonalSteps += 1;
    }
    console.log('move turn 90, diag step ' + doDiagonal);
    newCells.fill(0);
    for (let j = 0; j < size; j++) {
        const jSize = j * size;
        for (let i = 0; i < size; i++) {
            const index = i + jSize;
            const element = cells[index];
            if (element >= 0) {
                // do not overwrite moving things
                if (element > 0) {
                    newCells[index] = element;
                }
            } else {
                switch (-element % 10) {
                    case right:
                        if (!trySimpleCreate(element, i + 1, j)) {
                            if (element < -20) {
                                if (!trySimpleCreate(-20 - upRight, i + 1, j + 1)) {
                                    trySimpleCreate(-20 - up, i, j + 1);
                                }
                            } else {
                                if (!trySimpleCreate(-10 - downRight, i + 1, j - 1)) {
                                    trySimpleCreate(-10 - down, i, j - 1);
                                }
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case up:
                        if (!trySimpleCreate(element, i, j + 1)) {
                            if (element < -20) {
                                if (!trySimpleCreate(-20 - upLeft, i - 1, j + 1)) {
                                    trySimpleCreate(-20 - left, i - 1, j);
                                }
                            } else {
                                if (!trySimpleCreate(-10 - upRight, i + 1, j + 1)) {
                                    trySimpleCreate(-10 - right, i + 1, j);
                                }
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case left:
                        if (!trySimpleCreate(element, i - 1, j)) {
                            if (element < -20) {
                                if (!trySimpleCreate(-20 - downLeft, i - 1, j - 1)) {
                                    trySimpleCreate(-20 - down, i, j - 1);
                                }
                            } else {
                                if (!trySimpleCreate(-10 - upLeft, i - 1, j + 1)) {
                                    trySimpleCreate(-10 - up, i, j + 1);
                                }
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case down:
                        if (!trySimpleCreate(element, i, j - 1)) {
                            if (element < -20) {
                                if (!trySimpleCreate(-20 - downRight, i + 1, j - 1)) {
                                    trySimpleCreate(-20 - right, i + 1, j);
                                }
                            } else {
                                if (!trySimpleCreate(-10 - downLeft, i - 1, j - 1)) {
                                    trySimpleCreate(-10 - left, i - 1, j);
                                }
                            }
                        }
                        newCells[index] = trailCell;
                        break;
                    case upRight:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i + 1, j + 1)) {
                                if (element < -20) {
                                    if (!trySimpleCreate(-20 - up, i, j + 1)) {
                                        trySimpleCreate(-20 - upLeft, i - 1, j + 1);
                                    }
                                } else {
                                    if (!trySimpleCreate(-10 - right, i + 1, j)) {
                                        trySimpleCreate(-10 - downRight, i + 1, j - 1);
                                    }
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case upLeft:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i - 1, j + 1)) {
                                if (element < -20) {
                                    if (!trySimpleCreate(-20 - left, i - 1, j)) {
                                        trySimpleCreate(-20 - downLeft, i - 1, j - 1);
                                    }
                                } else {
                                    if (!trySimpleCreate(-10 - up, i, j + 1)) {
                                        trySimpleCreate(-10 - upRight, i + 1, j + 1);
                                    }
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case downLeft:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i - 1, j - 1)) {
                                if (element < -20) {
                                    if (!trySimpleCreate(-20 - down, i, j - 1)) {
                                        trySimpleCreate(-20 - downRight, i + 1, j - 1);
                                    }
                                } else {
                                    if (!trySimpleCreate(-10 - left, i - 1, j)) {
                                        trySimpleCreate(-10 - upLeft, i - 1, j - 1);
                                    }
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                    case downRight:
                        if (doDiagonal) {
                            if (!trySimpleCreate(element, i + 1, j - 1)) {
                                if (element < -20) {
                                    if (!trySimpleCreate(-20 - right, i + 1, j)) {
                                        trySimpleCreate(-20 - upRight, i + 1, j + 1);
                                    }
                                } else {
                                    if (!trySimpleCreate(-10 - down, i, j - 1)) {
                                        trySimpleCreate(-10 - downLeft, i - 1, j - 1);
                                    }
                                }
                            }
                            newCells[index] = trailCell;
                        } else {
                            newCells[index] = element;
                        }
                        break;
                }
            }
        }
    }
}

// create
function spawn90() {
    console.log('spawn90');
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
                        trySimpleCreate(element, i + 1, j);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-up - 20, i, j + 1);
                        break;
                    case up:
                        trySimpleCreate(element, i, j + 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-left - 20, i - 1, j);
                        break;
                    case left:
                        trySimpleCreate(element, i - 1, j);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-down - 20, i, j - 1);
                        break;
                    case down:
                        trySimpleCreate(element, i, j - 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-right - 20, i + 1, j);
                        break;
                    case upRight:
                        trySimpleCreate(element, i + 1, j + 1);
                        trySimpleCreate(-downRight - 10, i + 1, j);
                        trySimpleCreate(-upLeft - 20, i, j + 1);
                        break;
                    case upLeft:
                        trySimpleCreate(element, i - 1, j + 1);
                        trySimpleCreate(-upRight - 10, i, j + 1);
                        trySimpleCreate(-downLeft - 20, i - 1, j);
                        break;
                    case downLeft:
                        trySimpleCreate(element, i - 1, j - 1);
                        trySimpleCreate(-upLeft - 10, i - 1, j);
                        trySimpleCreate(-downRight - 20, i, j - 1);
                        break;
                    case downRight:
                        trySimpleCreate(element, i + 1, j - 1);
                        trySimpleCreate(-downLeft - 10, i, j - 1);
                        trySimpleCreate(-upRight - 20, i + 1, j);
                        break;
                }
            }
        }
    }
}

function spawn45() {
    console.log('spawn45');
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
                        trySimpleCreate(element, i + 1, j);
                        trySimpleCreate(-downRight - 10, i, j - 1);
                        trySimpleCreate(-upRight - 20, i, j + 1);
                        break;
                    case up:
                        trySimpleCreate(element, i, j + 1);
                        trySimpleCreate(-upRight - 10, i + 1, j);
                        trySimpleCreate(-upLeft - 20, i - 1, j);
                        break;
                    case left:
                        trySimpleCreate(element, i - 1, j);
                        trySimpleCreate(-upLeft - 10, i, j + 1);
                        trySimpleCreate(-downLeft - 20, i, j - 1);
                        break;
                    case down:
                        trySimpleCreate(element, i, j - 1);
                        trySimpleCreate(-downLeft - 10, i - 1, j);
                        trySimpleCreate(-downRight - 20, i + 1, j);
                        break;
                    case upRight:
                        trySimpleCreate(element, i + 1, j + 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-up - 20, i, j + 1);
                        break;
                    case upLeft:
                        trySimpleCreate(element, i - 1, j + 1);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-left - 20, i - 1, j);
                        break;
                    case downLeft:
                        trySimpleCreate(element, i - 1, j - 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-down - 20, i, j - 1);
                        break;
                    case downRight:
                        trySimpleCreate(element, i + 1, j - 1);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-right - 20, i + 1, j);
                        break;
                }
            }
        }
    }
}

function spawn9045() {
    console.log('spawn9045');
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
                        trySimpleCreate(element, i + 1, j);
                        trySimpleCreate(-downRight - 10, i + 1, j - 1);
                        trySimpleCreate(-upRight - 20, i + 1, j + 1);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-up - 20, i, j + 1);
                        break;
                    case up:
                        trySimpleCreate(element, i, j + 1);
                        trySimpleCreate(-upRight - 10, i + 1, j + 1);
                        trySimpleCreate(-upLeft - 20, i - 1, j + 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-left - 20, i - 1, j);
                        break;
                    case left:
                        trySimpleCreate(element, i - 1, j);
                        trySimpleCreate(-upLeft - 10, i - 1, j + 1);
                        trySimpleCreate(-downLeft - 20, i - 1, j - 1);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-down - 20, i, j - 1);
                        break;
                    case down:
                        trySimpleCreate(element, i, j - 1);
                        trySimpleCreate(-downLeft - 10, i - 1, j - 1);
                        trySimpleCreate(-downRight - 20, i + 1, j - 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-right - 20, i + 1, j);
                        break;
                    case upRight:
                        trySimpleCreate(element, i + 1, j + 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-up - 20, i, j + 1);
                        trySimpleCreate(-downRight - 10, i + 1, j - 1);
                        trySimpleCreate(-upLeft - 20, i - 1, j + 1);
                        break;
                    case upLeft:
                        trySimpleCreate(element, i - 1, j + 1);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-left - 20, i - 1, j);
                        trySimpleCreate(-upRight - 10, i + 1, j + 1);
                        trySimpleCreate(-downLeft - 20, i - 1, j - 1);
                        break;
                    case downLeft:
                        trySimpleCreate(element, i - 1, j - 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-down - 20, i, j - 1);
                        trySimpleCreate(-upLeft - 10, i - 1, j + 1);
                        trySimpleCreate(-downRight - 20, i + 1, j - 1);
                        break;
                    case downRight:
                        trySimpleCreate(element, i + 1, j - 1);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-right - 20, i + 1, j);
                        trySimpleCreate(-downLeft - 10, i - 1, j - 1);
                        trySimpleCreate(-upRight - 20, i + 1, j + 1);
                        break;
                }
            }
        }
    }
}

function spawn1359045() {
    console.log('spawn');
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
                        trySimpleCreate(element, i + 1, j);
                        trySimpleCreate(-downRight - 10, i + 1, j - 1);
                        trySimpleCreate(-upRight - 20, i + 1, j + 1);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-up - 20, i, j + 1);
                        trySimpleCreate(-downLeft - 10, i - 1, j - 1);
                        trySimpleCreate(-upLeft - 20, i - 1, j + 1);
                        break;
                    case up:
                        trySimpleCreate(element, i, j + 1);
                        trySimpleCreate(-upRight - 10, i + 1, j + 1);
                        trySimpleCreate(-upLeft - 20, i - 1, j + 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-left - 20, i - 1, j);
                        trySimpleCreate(-downRight - 10, i + 1, j - 1);
                        trySimpleCreate(-downLeft - 20, i - 1, j - 1);
                        break;
                    case left:
                        trySimpleCreate(element, i - 1, j);
                        trySimpleCreate(-upLeft - 10, i - 1, j + 1);
                        trySimpleCreate(-downLeft - 20, i - 1, j - 1);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-down - 20, i, j - 1);
                        trySimpleCreate(-upRight - 10, i + 1, j + 1);
                        trySimpleCreate(-downRight - 20, i + 1, j - 1);
                        break;
                    case down:
                        trySimpleCreate(element, i, j - 1);
                        trySimpleCreate(-downLeft - 10, i - 1, j - 1);
                        trySimpleCreate(-downRight - 20, i + 1, j - 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-right - 20, i + 1, j);
                        trySimpleCreate(-upLeft - 10, i - 1, j + 1);
                        trySimpleCreate(-upRight - 20, i + 1, j + 1);
                        break;
                    case upRight:
                        trySimpleCreate(element, i + 1, j + 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-up - 20, i, j + 1);
                        trySimpleCreate(-downRight - 10, i + 1, j - 1);
                        trySimpleCreate(-upLeft - 20, i - 1, j + 1);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-left - 20, i - 1, j);
                        break;
                    case upLeft:
                        trySimpleCreate(element, i - 1, j + 1);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-left - 20, i - 1, j);
                        trySimpleCreate(-upRight - 10, i + 1, j + 1);
                        trySimpleCreate(-downLeft - 20, i - 1, j - 1);
                        trySimpleCreate(-right - 10, i + 1, j);
                        trySimpleCreate(-down - 20, i, j - 1);
                        break;
                    case downLeft:
                        trySimpleCreate(element, i - 1, j - 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-down - 20, i, j - 1);
                        trySimpleCreate(-upLeft - 10, i - 1, j + 1);
                        trySimpleCreate(-downRight - 20, i + 1, j - 1);
                        trySimpleCreate(-up - 10, i, j + 1);
                        trySimpleCreate(-right - 20, i + 1, j);
                        break;
                    case downRight:
                        trySimpleCreate(element, i + 1, j - 1);
                        trySimpleCreate(-down - 10, i, j - 1);
                        trySimpleCreate(-right - 20, i + 1, j);
                        trySimpleCreate(-downLeft - 10, i - 1, j - 1);
                        trySimpleCreate(-upRight - 20, i + 1, j + 1);
                        trySimpleCreate(-left - 10, i - 1, j);
                        trySimpleCreate(-up - 20, i, j + 1);
                        break;
                }
            }
        }
    }
}

// rotate direction of move
function rotate90() {
    console.log('rotate90');
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

function rotateMinus90() {
    console.log('rotateMinus90');
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element < 0) {
            if (-element % 10 <= 2) {
                element -= 6;
            } else {
                element += 2;
            }
        }
        newCells[index] = element;
    }
}

function rotate45() {
    console.log('rotate45');
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element < 0) {
            if (-element % 10 >= 8) {
                element += 7;
            } else {
                element -= 1;
            }
        }
        newCells[index] = element;
    }
}

function rotateMinus45() {
    console.log('rotateMinus45');
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element < 0) {
            if (-element % 10 === 1) {
                element -= 7;
            } else {
                element += 1;
            }
        }
        newCells[index] = element;
    }
}

// strong color change
function lighten() {
    console.log('lighten');
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element > 0) {
            element = Math.max(1, Math.min(255, element + lightenValue));
        }
        newCells[index] = element;
    }
}

function darken() {
    console.log('darken');
    const length = size * size;
    for (let index = 0; index < length; index++) {
        let element = cells[index];
        if (element > 0) {
            element = Math.max(1, Math.min(255, element - darkenValue));
        }
        newCells[index] = element;
    }
}

// create new static cells at places near occupied cell
// but not near moving cell, avoids overrunning moving cell
function expand() {
    console.log('expand');
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
    console.log('shrink');
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

// smoothing: delete static cells with less than 4 neighbors
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
    initial4();
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

function clampf(x) {
    return Math.max(0, Math.min(255, Math.round(x)));
}

function greys() {
    for (let i = 0; i < 256; i++) {
        const j = invertColors ? 255 - i : i;
        color.red = i;
        color.blue = i;
        color.green = i;
        colors[j] = Pixels.integerOfColor(color);
    }
}

function ice() {
    for (let i = 0; i < 256; i++) {
        const j = invertColors ? 255 - i : i;
        color.red = clampf(3 * (i - 170));
        color.blue = clampf(3 * i);
        color.green = clampf(3 * (i - 85));
        colors[j] = Pixels.integerOfColor(color);
    }
}

function blueGreenYellow() {
    for (let i = 0; i < 256; i++) {
        const j = invertColors ? 255 - i : i;
        color.red = clampf(3 * (i - 170));
        color.blue = (i < 85) ? clampf(3 * i) : clampf(1.5 * (255 - i));
        color.green = clampf(3 * (i - 85));
        colors[j] = Pixels.integerOfColor(color);
    }
}

function blueRedYellow() {
    for (let i = 0; i < 256; i++) {
        const j = invertColors ? 255 - i : i;
        color.green = clampf(3 * (i - 170));
        color.blue = (i < 85) ? clampf(4 * i) : clampf(1.5 * (255 - i));
        color.red = clampf(3 * (i - 60));
        colors[j] = Pixels.integerOfColor(color);
    }
}

function redYellowWhite() {
    for (let i = 0; i < 256; i++) {
        const j = invertColors ? 255 - i : i;
        color.red = clampf(3 * i);
        color.blue = clampf(3 * (i - 170));
        color.green = clampf(3 * (i - 85));
        colors[j] = Pixels.integerOfColor(color);
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

// double occupation with movers: clear later (in copy?)
const doubleTrouble = -100;

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
// value for static cells in trail of moving things
var trailCell = 128;
// value for expanding static cells
var expanCell = 200;
// value for ageing
var ageStep = 5;
var lightenValue = 50;
var darkenValue = 30;
var invertColors = true;

automaton.magnification = 5;
automaton.saveLast = false;

// drawing: canvas might have been resized
automaton.draw = function() {
    output.startDrawing();
    nearestImage();

    // colorTest();
};

automaton.step = function() {
    if (hasMoving()) {
        clearBorder();
        age();
        randomAction();
        copyNewCellsToCells();
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
    addAction(moveTurn9045, 1);
  //  addAction(moveTurn90, 1);
    //   addAction(simpleMove, 1);
    //   addAction(spawn1359045, 0.15);
    //addAction(spawn45, 0.2);
    // addAction(spawn9045, 0.2);
    addAction(spawn90, 0.2);
    //   addAction(expand, 0.3);
    // addAction(shrink, 0.2);
    //  addAction(smooth, 0.3);
    //  addAction(rotate90, 0.05);
    //addAction(rotateMinus90, 0.4);
    //   addAction(darken, 0.4);
    greys();
    ice();
    blueGreenYellow();
    redYellowWhite();
    blueRedYellow();

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
    }).add({
        type: 'boolean',
        params: automaton,
        property: 'saveLast',
        labelText: 'save last image'
    });
    logger = main.gui.addLogger();
};