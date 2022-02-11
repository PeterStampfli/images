/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    colors
} from "./modules.js";

export const utils = {};

//=====================================
// utilities

// forcing odd number
utils.makeOdd = function(n) {
    return Math.floor(n / 2) * 2 + 1;
};
// forcing even number
utils.makeEven = function(n) {
    return Math.floor(n / 2) * 2;
};

// choose from a random array
utils.randomChoice = function(options) {
    const index = Math.floor(options.length * Math.random());
    return options[index];
};

// extend an array/matrix/vector
utils.extend = function(space, minLength) {
    if (space.length < minLength) {
        space.length = minLength;
    }
};

// log array of size*size elements
utils.logArray = function(array, size = 0) {
    if (size <= 0) {
        size = utils.cellSize;
    }
    for (let j = size - 1; j >= 0; j--) {
        let message = j + ' : ';
        for (let i = 0; i < size; i++) {
            message += ' ' + array[i + j * size];
        }
        console.log(message);
    }
};


//===================================================
// the cell and other arrays
//  cells, sums, prevSums, cellsView, view
utils.cells = [];
utils.prevCells = [];
utils.sumCells = [];
utils.sums = [];
utils.cellsView = [];
utils.view = [];
utils.weights = [];

// initialization of variables 
// set size of arrays, and fill with 0
// size is full array of cells, including a double border of fixed zero cells
utils.setSize = function(size) {
    utils.iteration = 0;
    utils.weights.length = 0;
    size = utils.makeOdd(size);
    utils.cellSize = size;
    const size2 = size * size;
    utils.extend(utils.cells, size2);
    utils.cells.fill(0);
    utils.extend(utils.sumCells, size2);
    utils.sumCells.fill(0);
    utils.extend(utils.prevCells, size2);
    utils.prevCells.fill(0);
    utils.extend(utils.sums, size2);
    utils.sums.fill(0);
    utils.cellsViewSize = size;
    utils.extend(utils.cellsView, size2);
    utils.cellsView.fill(0);
    utils.cellsFull = false;
};

//=====================================================
// the size of the view can change, within limits
// to show a nearly full screen initially
// the visible part only increases

utils.setViewLimits = function(mini, maxi) {
    utils.viewMaxSize = maxi;
    utils.viewMinSize = mini;
};

// copy cells to cell view
// simple copy for square lattice
utils.copyCellsViewSquare = function() {
    const size2 = utils.cellSize * utils.cellSize;
    for (let i = 0; i < size2; i++) {
        utils.cellsView[i] = utils.cells[i];
    }
};

// copy the sum time average
utils.copySumCellsViewSquare = function() {
    const size2 = utils.cellSize * utils.cellSize;
    for (let i = 0; i < size2; i++) {
        utils.cellsView[i] = utils.sumCells[i];
    }
};

// copy for hexagon symmetry with shift
utils.copyCellsViewHexagon = function() {
    const size = utils.cellSize;
    const center = Math.floor(size / 2);
    for (let j = 0; j < size; j++) {
        const left = 2 + Math.floor(Math.abs(center - j) / 2);
        const right = left + size - 2 - Math.abs(center - j);
        const shift = Math.floor((j - center) / 2);
        const jSize = j * size;
        for (let i = left; i < right; i++) {
            utils.cellsView[i + jSize] = utils.cells[i + jSize + shift];
        }
    }
};


// copy for hexagon symmetry with shift
// each (automaton) cell is represented by 4 view cells
// to get a more accurate representation
utils.copyCellsViewHexagonImproved = function() {
    const size = utils.cellSize;
    utils.logArray(utils.cells);
    const cellsViewSize = 2 * (size - 2);
    utils.cellsViewSize = cellsViewSize;
    console.log(cellsViewSize);
    utils.extend(utils.cellsView, cellsViewSize * cellsViewSize);
    utils.cellsView.fill(0);
    const center = Math.floor(size / 2);
    for (let j = 0; j < cellsViewSize; j++) {
        const jSuper = 1 + Math.floor(j / 2);
        const shift = jSuper - center;
        const jSize = j * cellsViewSize;
        const jSuperSize = jSuper * size;
        for (let i = 0; i < cellsViewSize; i++) {
            const iSuper = 1 + Math.floor((i + shift) / 2);
            if ((i >= 0) && (i < cellsViewSize)) {
                utils.cellsView[i + jSize] = utils.cells[iSuper + jSuperSize];
            }
        }
    }
    utils.logArray(utils.cellsView, cellsViewSize);
};

// time average
utils.copySumCellsViewHexagon = function() {
    const size = utils.cellSize;
    const center = Math.floor(utils.cellSize / 2);
    for (let j = 0; j < size; j++) {
        const left = 2 + Math.floor(Math.abs(center - j) / 2);
        const right = left + size - 2 - Math.abs(center - j);
        const shift = Math.floor((j - center) / 2);
        const jSize = j * size;
        for (let i = left; i < right; i++) {
            utils.cellsView[i + jSize] = utils.sumCells[i + jSize + shift];
        }
    }
};

// switching
utils.copyCellsView = utils.copyCellsViewSquare;

// determine limits of nonzero cells (view)
// suppose that image only grows
// limit and symmetrize
// determine stop
utils.getViewHalf = function() {
    const size = utils.cellsViewSize;
    console.log('size cellsview ' + size);
    const center = Math.floor(size / 2);
    let index = 0;
    let low = size;
    let high = 0;
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            if (utils.cellsView[index] > 0) {
                low = Math.min(low, i, j);
                high = Math.max(high, i, j);
            }
            index += 1;
        }
    }

    console.log('high low', high, low);

    // size of visible cells in limits
    let viewSize = high - low + 1;
    console.log('viewsize ' + viewSize);
    viewSize = Math.min(Math.max(viewSize, utils.viewMinSize), utils.viewMaxSize);

    if (size & 1) { // odd
        viewSize = utils.makeOdd(viewSize);
    } else {
        viewSize = utils.makeEven(viewSize);
    }
    console.log('viewsize adj ' + viewSize);


    utils.viewMinSize = viewSize;
    // total size with double border
    utils.viewSize = viewSize + 4;


};

// make reduced view matrix
utils.makeView = function() {
    const size = utils.cellsViewSize;
    const viewSize = utils.viewSize;
    utils.extend(utils.view, viewSize * viewSize);
    // shift between the two centers
    const shift = (size - viewSize) / 2;
    console.log('shift ' + shift);
    for (let j = 0; j < viewSize; j++) {
        for (let i = 0; i < viewSize; i++) {
            utils.view[i + j * viewSize] = utils.cellsView[i + shift + (j + shift) * size];
        }
    }
};

// normalize view matrix
utils.normalizeView = function() {
    const length = utils.viewSize * utils.viewSize;
    let maxi = 1;
    for (let i = 0; i < length; i++) {
        maxi = Math.max(maxi, utils.view[i]);
    }
    const factor = 0.99 / maxi;
    for (let i = 0; i < length; i++) {
        utils.view[i] *= factor;
    }
    utils.logArray(utils.view, utils.viewSize);
};

utils.nearestImage = function() {
    console.log('nearestImage');
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const size = utils.viewSize;
    const cells = utils.view;
    const scale = (size - 4) / width;
    let imageIndex = 0;
    for (var j = 0; j < height; j++) {
        const jCellSize = size * Math.floor(2 + j * scale);
        for (var i = 0; i < width; i++) {
            const iCell = 2 + Math.floor(i * scale);
            const colorIndex = Math.floor(colors.n * cells[jCellSize + iCell]);
            pixels.array[imageIndex] = colors.table[colorIndex];
            imageIndex += 1;
        }
    }
    output.pixels.show();
};

utils.linearImage = function() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const size = 5 + 2 * utils.viewHalf;
    const cells = utils.view;
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
            let sum = dyPlus * (dxPlus * cells[jCellSize + iCell] + dx * cells[jCellSize + iCellPlus]);
            sum += dy * (dxPlus * cells[jPlusCellSize + iCell] + dx * cells[jPlusCellSize + iCellPlus]);
            const colorIndex = Math.floor(colors.n * sum);
            pixels.array[imageIndex] = colors.table[colorIndex];
            imageIndex += 1;
        }
    }
    output.pixels.show();
};

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

utils.cubicImage = function() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const size = 5 + 2 * utils.viewHalf;
    const cells = utils.view;
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
            let sum = kx * (kym * cells[cellIndexM - 1] + ky * cells[cellIndex - 1] + ky1 * cells[cellIndex1 - 1] + ky2 * cells[cellIndex2 - 1]);
            kx = kernel(dx);
            sum += kx * (kym * cells[cellIndexM] + ky * cells[cellIndex] + ky1 * cells[cellIndex1] + ky2 * cells[cellIndex2]);
            kx = kernel(1 - dx);
            sum += kx * (kym * cells[cellIndexM + 1] + ky * cells[cellIndex + 1] + ky1 * cells[cellIndex1 + 1] + ky2 * cells[cellIndex2 + 1]);
            kx = kernel(2 - dx);
            sum += kx * (kym * cells[cellIndexM + 2] + ky * cells[cellIndex + 2] + ky1 * cells[cellIndex1 + 2] + ky2 * cells[cellIndex2 + 2]);
            const colorIndex = Math.max(Math.floor(colors.n * sum), 0);
            pixels.array[imageIndex] = colors.table[colorIndex];
            imageIndex += 1;
        }
    }
    output.pixels.show();
};

utils.image = utils.cubicImage;

//==========================================
// initialization
// initial state

// configuration for square lattice

//      5 3 4
//    4 2 1 2 5
//    3 1 0 1 3
//    5 2 1 2 4
//      4 3 5

utils.initialStateSquare = function(config) {
    const size = utils.cellSize;
    const cells = utils.cells;
    let center = (size - 1) / 2;
    center = center + center * size;
    cells[center] = config[0];
    cells[center + 1] = config[1];
    cells[center - 1] = config[1];
    cells[center + size] = config[1];
    cells[center - size] = config[1];
    cells[center + 1 + size] = config[2];
    cells[center + 1 - size] = config[2];
    cells[center - 1 + size] = config[2];
    cells[center - 1 - size] = config[2];
    cells[center + 2] = config[3];
    cells[center - 2] = config[3];
    cells[center + 2 * size] = config[3];
    cells[center - 2 * size] = config[3];
    cells[center + 2 * size - 1] = config[4];
    cells[center - 2 * size + 1] = config[4];
    cells[center + 2 + size] = config[4];
    cells[center - 2 - size] = config[4];
    cells[center + 2 * size + 1] = config[5];
    cells[center - 2 * size - 1] = config[5];
    cells[center + 2 - size] = config[5];
    cells[center - 2 + size] = config[5];
    utils.prevCells[center] = 1;
};

// configuration for hexagonal lattice
// unshifted

//      6 4 5
//     3 2 1 3
//    5 1 0 2 6
//     4 2 1 4
//      6 3 5

// shifted
//        6 4 5
//      3 2 1 3
//    5 1 0 2 6
//    4 2 1 4
//    6 3 5

utils.initialStateHexagon = function(config) {
    const size = utils.cellSize;
    const cells = utils.cells;
    let center = (size - 1) / 2;
    center = center + center * size;
    cells[center] = config[0];
    cells[center - 1] = config[1];
    cells[center + 1 + size] = config[1];
    cells[center - size] = config[1];
    cells[center + 1] = config[2];
    cells[center + size] = config[2];
    cells[center - 1 - size] = config[2];
    cells[center - 1 + size] = config[3];
    cells[center + 2 + size] = config[3];
    cells[center - 1 - 2 * size] = config[3];
    cells[center + 1 + 2 * size] = config[4];
    cells[center + 1 - size] = config[4];
    cells[center - 2 - size] = config[4];
    cells[center - 2 * size] = config[5];
    cells[center - 2] = config[5];
    cells[center + 2 + 2 * size] = config[5];
    cells[center - 2 - 2 * size] = config[6];
    cells[center + 2] = config[6];
    cells[center + 2 * size] = config[6];
    utils.prevCells[center] = 1;
};
//===========================================
// sums
//      5 3 4
//    4 2 1 2 5
//    3 1 0 1 3
//    5 2 1 2 4
//      4 3 5

utils.makeSumSquare = function(weights) {
    const cells = utils.cells;
    const sums = utils.sums;
    const size = utils.cellSize;
    var cm12, c02, c12;
    var cm21, cm11, c01, c11, c21;
    var cm20, cm10, c00, c10, c20;
    var cm2m1, cm1m1, c0m1, c1m1, c2m1;
    var cm1m2, c0m2, c1m2;
    const w0 = weights[0];
    const w1 = weights[1];
    const w2 = weights[2];
    const w3 = weights[3];
    const w4 = weights[4];
    const w5 = weights[5];
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        let center = j * size + 1;
        c02 = cells[center + 2 * size];
        c12 = cells[center + 2 * size + 1];
        cm11 = cells[center + size - 1];
        c01 = cells[center + size];
        c11 = cells[center + size + 1];
        c21 = cells[center + size + 2];
        cm10 = cells[center - 1];
        c00 = cells[center];
        c10 = cells[center + 1];
        c20 = cells[center + 2];
        cm1m1 = cells[center - size - 1];
        c0m1 = cells[center - size];
        c1m1 = cells[center - size + 1];
        c2m1 = cells[center - size + 2];
        c0m2 = cells[center - 2 * size];
        c1m2 = cells[center - 2 * size + 1];
        for (let i = 2; i < sizeM2; i++) {
            center += 1;
            cm12 = c02;
            c02 = c12;
            c12 = cells[center + 1 + 2 * size];
            cm21 = cm11;
            cm11 = c01;
            c01 = c11;
            c11 = c21;
            c21 = cells[center + 2 + size];
            cm20 = cm10;
            cm10 = c00;
            c00 = c10;
            c10 = c20;
            c20 = cells[center + 2];
            cm2m1 = cm1m1;
            cm1m1 = c0m1;
            c0m1 = c1m1;
            c1m1 = c2m1;
            c2m1 = cells[center + 2 - size];
            cm1m2 = c0m2;
            c0m2 = c1m2;
            c1m2 = cells[center + 1 - 2 * size];
            let sum = w0 * c00;
            sum += w1 * (c01 + cm10 + c10 + c0m1);
            sum += w2 * (c11 + cm11 + c1m1 + cm1m1);
            sum += w3 * (c02 + cm20 + c20 + c0m2);
            sum += w4 * (cm12 + cm2m1 + c1m2 + c21);
            sum += w5 * (c12 + c2m1 + cm1m2 + cm21);
            sums[center] = sum;
        }
    }
};

// shifted
//        6 4 5
//      3 2 1 3
//    5 1 0 2 6
//    4 2 1 4
//    6 3 5
utils.makeSumHexagon = function(weights) {
    const cells = utils.cells;
    const sums = utils.sums;
    const size = utils.cellSize;
    var c02, c12, c22;
    var cm11, c01, c11, c21;
    var cm20, cm10, c00, c10, c20;
    var cm2m1, cm1m1, c0m1, c1m1;
    var cm2m2, cm1m2, c0m2;
    //inverted
    const w0 = weights[0];
    const w1 = weights[2];
    const w2 = weights[1];
    const w3 = weights[4];
    const w4 = weights[3];
    const w5 = weights[6];
    const w6 = weights[5];
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        let center = j * size + 1;
        c12 = cells[center + 2 * size + 1];
        c22 = cells[center + 2 * size + 2];
        c01 = cells[center + size];
        c11 = cells[center + size + 1];
        c21 = cells[center + size + 2];
        cm10 = cells[center - 1];
        c00 = cells[center];
        c10 = cells[center + 1];
        c20 = cells[center + 2];
        cm1m1 = cells[center - size - 1];
        c0m1 = cells[center - size];
        c1m1 = cells[center - size + 1];
        cm1m2 = cells[center - 2 * size - 1];
        c0m2 = cells[center - 2 * size];
        for (let i = 2; i < sizeM2; i++) {
            center += 1;
            c02 = c12;
            c12 = c22;
            c22 = cells[center + 2 + 2 * size];
            cm11 = c01;
            c01 = c11;
            c11 = c21;
            c21 = cells[center + 2 + size];
            cm20 = cm10;
            cm10 = c00;
            c00 = c10;
            c10 = c20;
            c20 = cells[center + 2];
            cm2m1 = cm1m1;
            cm1m1 = c0m1;
            c0m1 = c1m1;
            c1m1 = cells[center + 1 - size];
            cm2m2 = cm1m2;
            cm1m2 = c0m2;
            c0m2 = cells[center - 2 * size];
            let sum = w0 * c00;
            sum += w1 * (cm10 + c11 + c0m1);
            sum += w2 * (c10 + c01 + cm1m1);
            sum += w3 * (cm11 + c21 + cm1m2);
            sum += w4 * (c12 + cm2m1 + c1m1);
            sum += w5 * (c22 + cm20 + c0m2);
            sum += w6 * (c02 + c20 + cm2m2);
            sums[center] = sum;
        }
    }
};

//==================================
// configurations square lattice
utils.center = function(c) {
    return [c, 0, 0, 0, 0, 0, 0];
};

utils.neumann = function(c, f) {
    return [c, f, 0, 0, 0, 0, 0];
};

utils.moore = function(c, f) {
    return [c, f, f, 0, 0, 0, 0];
};

utils.cross = function(c, f) {
    return [c, f, 0, f, 0, 0, 0];
};

utils.rotateSquare = function(c, f) {
    return [c, f, 0, 0, f, 0, 0];
};

utils.rotateCross = function(c, f) {
    return [c, f, 0, f, f, 0, 0];
};

// configurations hexagon/triangle lattice

utils.hexagon = function(c, f) {
    return [c, f, f, 0, 0, 0, 0];
};

utils.bigHexagon = function(c, f) {
    return [c, f, f, f, f, 0, 0];
};

utils.rotateHexagon = function(c, f) {
    return [c, 0, 0, f, 0, f, 0];
};

utils.triangle = function(c, f) {
    return [c, f, 0, 0, 0, 0, 0];
};

utils.bigTriangle = function(c, f) {
    return [c, f, f, f, 0, 0, 0];
};


//============================================
// making the transitions

// transition tables, needs number of states
utils.nStates = 16;
utils.trianglePeriod = 40;

utils.setNStates = function(n) {
    utils.nStates = n;
    utils.trianglePeriod = 2 * n - 2;
};

// sawtooth table
utils.sawToothTable = function(sum) {
    return sum % utils.nStates;
};

// slow sawtooth table
utils.slowToothTable = function(sum) {
    return Math.floor((sum + 1) / 2) % utils.nStates;
};

// triangle table
utils.triangleTable = function(sum) {
    let value = sum % utils.trianglePeriod;
    if (value >= nStates) {
        value = utils.trianglePeriod - value;
    }
    return value;
};

// make transition and sum cells (for time-average)
// to get more structure: sum modulo maxAverage
utils.maxAverage = 1000;


utils.transitionTable = utils.triangleTable;

utils.irreversibleTransition = function() {
    const size = utils.cellSize;
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            utils.cells[index] = utils.transitionTable(utils.sums[index]);
            utils.sumCells[index] = (utils.sumCells[index] + utils.cells[index]) % utils.maxAverage;
        }
    }
};

utils.reversibleTransitionAdditive = function() {
    const size = utils.cellSize;
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            const rememberState = utils.cells[index];
            utils.cells[index] = (utils.prevCells[index] + utils.transitionTable(utils.sums[index])) % utils.nStates;
            utils.sumCells[index] = (utils.sumCells[index] + utils.cells[index]) % utils.maxAverage;
            utils.prevCells[index] = rememberState;
        }
    }
};

utils.reversibleTransitionSubtractive = function() {
    const size = utils.cellSize;
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            const rememberState = utils.cells[index];
            utils.cells[index] = (utils.nStates - utils.prevCells[index] + utils.transitionTable(utils.sums[index])) % utils.nStates;
            utils.sumCells[index] = (utils.sumCells[index] + utils.cells[index]) % utils.maxAverage;
            utils.prevCells[index] = rememberState;
        }
    }
};

utils.transition = utils.irreversibleTransition;

// see if non-zero cells are in the border
// or next to the border. Then no more steps should be done
utils.checkBorder = function() {
    console.log('checkb');
    utils.cellsFull = false;
    const size = utils.cellSize;
    for (let i = 0; i < size; i++) {
        let full = (utils.cells[i] > 0) || (utils.cells[i + size] > 0) || (utils.cells[i + (size - 1) * size] > 0) || (utils.cells[i + (size - 2) * size] > 0);
        full = full || (utils.cells[i * size] > 0) || (utils.cells[i * size + 1] > 0) || (utils.cells[i * size + size - 1] > 0) || (utils.cells[i * size + size - 2] > 0);
        if (full) {
            utils.cellsFull = true;
            console.log('ceellsfu at ' + i);
            return;
        }

    }

};

//  how to run things
//===============================================================

// transitions
//=============================

//utils.transitionTable = utils.triangleTable;
//utils.sawToothTable
//utils.slowToothTable
//utils.triangleTable

//utils.transition=utils.irreversibleTransition;
//utils.reversibleTransitionAdditive
//utils.reversibleTransitionSubtractive
//utils.irreversibleTransition

// image
//====================
//utils.image = utils.cubicImage;
//utils.linearImage
//utils. nearestImage

// hexagon - square
//====================================
// (set config for start)
//utils.initialState=utils.initialStateSquare
//utils.initialStateSquare = function(config)
//utils.initialStateHexagon = function(config)

// (set config for weights)
//utils.makeSum=makeSumSquare
//utils.makeSumSquare = function(weights) 
//utils.makeSumHexagon = function(weights) 

//utils.copyCellsView=utils.copyCellsViewSquare;
//utils.copyCellsViewHexagon
//utils.copyCellsViewSquare
// average
//utils.maxAverage=....;
//utils.copySumCellsViewHexagon
//utils.copySumCellsViewSquare

utils.squareLattice = function(average = false) {
    utils.initialState = utils.initialStateSquare;
    utils.makeSum = utils.makeSumSquare;
    if (average) {
        utils.copyCellsView = utils.copySumCellsViewSquare;
    } else {
        utils.copyCellsView = utils.copyCellsViewSquare;
    }
};

utils.hexagonLattice = function(average = false) {
    utils.initialState = utils.initialStateHexagon;
    utils.makeSum = utils.makeSumHexagon;
    if (average) {
        utils.copyCellsView = utils.copySumCellsViewHexagon;
    } else {
        //  utils.copyCellsView = utils.copyCellsViewHexagon;
        utils.copyCellsView = utils.copyCellsViewHexagonImproved;
    }

};


// initialization
//====================================================
//utils.setSize(size);
// add weights
//colors.setN(n<size);
//utils.setViewLimits(mini, maxi);     maxi< size   (size/2?)
//utils.setNStates(n);
//utils.initialState(config);
//utils.maxAverage=....;

// complete sample setup
// see setups.js

// step (universal)
//===============

utils.step = function() {
    const actualWeights = utils.weights[utils.iteration % utils.weights.length];
    utils.iteration += 1;
    utils.makeSum(actualWeights);
    utils.transition();
    utils.checkBorder();
};

utils.draw = function() {
    utils.copyCellsView();
    utils.getViewHalf();
    utils.makeView();
    utils.normalizeView();
    utils.image();
};

// stop
//==========
//  utils.cellsFull===true

// stepping is universal, choose things in the initialization