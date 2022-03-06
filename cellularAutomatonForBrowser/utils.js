/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    colors
} from "./colors.js";

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
utils.size = 201;
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
utils.setSize = function() {
    let size = utils.size;
    utils.iteration = 0;
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
    utils.viewMinSize = 5;
    utils.stop = false;
};

//=====================================================

// copy cells to cell view
// simple copy for square lattice
utils.copyCellsViewSquare = function() {
    const cellsView = utils.cellsView;
    const cells = utils.cells;
    const size2 = utils.cellSize * utils.cellSize;
    for (let i = 0; i < size2; i++) {
        cellsView[i] = cells[i];
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
// each (automaton) cell is represented by 4 view cells
// to get a more accurate representation
// we need zero borders of 2 cells width plus a buffer border because of shifts
utils.copyCellsViewHexagon = function() {
    const size = utils.cellSize;
    // double content plus 2 times 3 border
    const cellsViewSize = 2 * (size - 4) + 6;
    utils.cellsViewSize = cellsViewSize;
    utils.extend(utils.cellsView, cellsViewSize * cellsViewSize);
    utils.cellsView.fill(0);
    const cellsView = utils.cellsView;
    const cells = utils.cells;
    const cellsViewSizeM2 = cellsViewSize - 2;
    const center = Math.floor(size / 2);
    for (let j = 2; j < cellsViewSizeM2; j++) {
        const jSuper = Math.floor((j + 1) / 2);
        const shift = jSuper - center;
        const jSize = j * cellsViewSize;
        const jSuperSize = jSuper * size;
        for (let i = 2; i < cellsViewSizeM2; i++) {
            const iSuper = Math.floor((i + 1 + shift) / 2);
            if ((iSuper >= 0) && (iSuper < size)) {
                cellsView[i + jSize] = cells[iSuper + jSuperSize];
            }
        }
    }
};

// time average
utils.copySumCellsViewHexagon = function() {
    const size = utils.cellSize;
    // double content plus 2 times 3 border
    const cellsViewSize = 2 * (size - 4) + 6;
    utils.cellsViewSize = cellsViewSize;
    utils.extend(utils.cellsView, cellsViewSize * cellsViewSize);
    utils.cellsView.fill(0);
    const cellsViewSizeM2 = cellsViewSize - 2;
    const center = Math.floor(size / 2);
    for (let j = 2; j < cellsViewSizeM2; j++) {
        const jSuper = Math.floor((j + 1) / 2);
        const shift = jSuper - center;
        const jSize = j * cellsViewSize;
        const jSuperSize = jSuper * size;
        for (let i = 2; i < cellsViewSizeM2; i++) {
            const iSuper = Math.floor((i + 1 + shift) / 2);
            if ((iSuper >= 0) && (iSuper < size)) {
                utils.cellsView[i + jSize] = utils.sumCells[iSuper + jSuperSize];
            }
        }
    }
};

// improved copy for hexagon symmetry with shift
// each (automaton) cell is represented by 6*5=30 view cells
// to get a more accurate representation
// we need zero borders of 2 cells width plus a buffer border because of shifts
utils.copyCellsViewImprovedHexagon = function() {
    const size = utils.cellSize;
    // six times content plus 2 times 2 border
    const cellsViewSize = 6 * (size - 4) + 4;
    console.log('size,viewsize', size, cellsViewSize);
    utils.cellsViewSize = cellsViewSize;
    utils.extend(utils.cellsView, cellsViewSize * cellsViewSize);
    utils.cellsView.fill(0);
    const cellsView = utils.cellsView;
    const cells = utils.cells;
    const cellsCenter = Math.floor(size / 2);
    const verticalOffset = Math.floor((cellsViewSize - 5 * (size - 4)) / 2);
    console.log('verticalOffset', verticalOffset);
    for (let jCell = 2; jCell < size - 2; jCell++) {
        const offset = jCell - cellsCenter;
        // the border!
        const left = Math.max(2, 2 + offset);
        const right = Math.min(size - 2, size - 2 + offset);
        console.log('j,offset,left,right', jCell, offset, left, right);
        const jImage = 5 * (jCell - 2) + verticalOffset + 2;
        console.log("jCell,jImage", jCell, jImage);
        const jCellSize = jCell * size;
        const jImageSize = jImage * cellsViewSize;
        for (let iCell = left; iCell < right; iCell++) {
            const cell = cells[iCell + jCellSize];
            //  console.log('iCell,value',iCell,cell);
            // offset also includes double border of zeros plus going to 'center' of hhexagon
            const iImage = 6 * (iCell - 2) + 5 - 3 * offset;
            //   console.log('iIamge,jImage',iImage,jImage,cellsViewSize)
            const indexBase = iImage + jImageSize;
            for (let i = -2; i < 2; i++) {
                cellsView[indexBase + i] = cell;
                cellsView[indexBase + i + cellsViewSize] = cell;
                cellsView[indexBase + i + 2 * cellsViewSize] = cell;
                cellsView[indexBase + i - cellsViewSize] = cell;
                cellsView[indexBase + i - 2 * cellsViewSize] = cell;
            }
            cellsView[indexBase - 3 * cellsViewSize] = cell;
            cellsView[indexBase - 1 - 3 * cellsViewSize] = cell;
            cellsView[indexBase + 3 * cellsViewSize] = cell;
            cellsView[indexBase - 1 + 3 * cellsViewSize] = cell;
            cellsView[indexBase - 1 + 3 * cellsViewSize] = cell;
            cellsView[indexBase - 3] = cell;
            cellsView[indexBase - 3 + cellsViewSize] = cell;
            cellsView[indexBase - 3 - cellsViewSize] = cell;
            cellsView[indexBase + 2] = cell;
            cellsView[indexBase + 2 + cellsViewSize] = cell;
            cellsView[indexBase + 2 - cellsViewSize] = cell;
        }
    }
};

utils.copySumCellsViewImprovedHexagon = function() {};

// improved copy for hexagon symmetry with shift
// each (automaton) cell is represented by 8*7=56 view cells
// to get a more accurate representation
// we need zero borders of 2 cells width plus a buffer border because of shifts
utils.copyCellsViewUltimateHexagon = function() {
    const size = utils.cellSize;
    // six times content plus 2 times 2 border
    const cellsViewSize = 8 * (size - 4) + 4;
    utils.cellsViewSize = cellsViewSize;
    utils.extend(utils.cellsView, cellsViewSize * cellsViewSize);
    utils.cellsView.fill(0);
    const cellsView = utils.cellsView;
    const cells = utils.cells;
    const cellsCenter = Math.floor(size / 2);
    const verticalOffset = Math.floor((cellsViewSize - 7 * (size - 4)) / 2);
    for (let jCell = 2; jCell < size - 2; jCell++) {
        const offset = jCell - cellsCenter;
        // the border!
        const left = Math.max(2, 2 + offset);
        const right = Math.min(size - 2, size - 2 + offset);
        const jImage = 7 * (jCell - 2) + verticalOffset + 2;
        const jCellSize = jCell * size;
        const jImageSize = jImage * cellsViewSize;
        for (let iCell = left; iCell < right; iCell++) {
            const cell = cells[iCell + jCellSize];
            const iImage = 8 * (iCell - 2) + 5 - 4 * offset;
            const indexBase = iImage + jImageSize;
            for (let i = -2; i < 4; i++) {
                cellsView[indexBase + i] = cell;
                cellsView[indexBase + i + cellsViewSize] = cell;
                cellsView[indexBase + i + 2 * cellsViewSize] = cell;
                cellsView[indexBase + i + 3 * cellsViewSize] = cell;
                cellsView[indexBase + i - cellsViewSize] = cell;
                cellsView[indexBase + i - 2 * cellsViewSize] = cell;
                cellsView[indexBase + i - 3 * cellsViewSize] = cell;
            }
            cellsView[indexBase - 4 * cellsViewSize] = cell;
            cellsView[indexBase + 1 - 4 * cellsViewSize] = cell;
            cellsView[indexBase + 4 * cellsViewSize] = cell;
            cellsView[indexBase + 1 + 4 * cellsViewSize] = cell;
            cellsView[indexBase - 3 + 2 * cellsViewSize] = cell;
            cellsView[indexBase - 3 + cellsViewSize] = cell;
            cellsView[indexBase - 3] = cell;
            cellsView[indexBase - 3 - cellsViewSize] = cell;
            cellsView[indexBase - 3 - 2 * cellsViewSize] = cell;
            cellsView[indexBase + 4 + 2 * cellsViewSize] = cell;
            cellsView[indexBase + 4 + cellsViewSize] = cell;
            cellsView[indexBase + 4] = cell;
            cellsView[indexBase + 4 - cellsViewSize] = cell;
            cellsView[indexBase + 4 - 2 * cellsViewSize] = cell;
        }
    }
};

// switching
utils.copyCellsView = utils.copyCellsViewSquare;

// determine limits of nonzero cells (view)
utils.getViewLimits = function() {
    const size = utils.cellsViewSize;
    let index = 0;
    let bottom = size;
    let top = 0;
    let left = size;
    let right = 0;
    const cellsView=utils.cellsView;
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            if (cellsView[index] > 0) {
                bottom = Math.min(bottom, j);
                top = Math.max(top, j);
                left = Math.min(left, i);
                right = Math.max(right, i);
            }
            index += 1;
        }
    }
    utils.top = top;
    utils.bottom = bottom;
    utils.left = left;
    utils.right = right;
    utils.viewSize = 6 + Math.max(top - bottom + 1, right - left + 1);
};

// make reduced view matrix
utils.makeView = function() {
    const size = utils.cellsViewSize;
    const viewSize = utils.viewSize;
    utils.extend(utils.view, viewSize * viewSize);
    utils.view.fill(0);
    const view=utils.view;
    const cellsView=utils.cellsView;
    const xBorder = Math.floor((viewSize - (utils.right - utils.left + 1)) / 2);
    const yBorder = Math.floor((viewSize - (utils.top - utils.bottom + 1)) / 2);
    const xOffset = xBorder - utils.left;
    const yOffset = yBorder - utils.bottom;
    for (let j = utils.bottom; j <= utils.top; j++) {
        const jOffsetViewSize = (j + yOffset) * viewSize;
        const jSize = j * size;
        for (let i = utils.left; i <= utils.right; i++) {
            view[jOffsetViewSize + i + xOffset] = cellsView[jSize + i];
        }
    }
};

// normalize view matrix
utils.normalizeView = function() {
    const length = utils.viewSize * utils.viewSize;
    const view=utils.view;
    let maxi = 1;
    for (let i = 0; i < length; i++) {
        maxi = Math.max(maxi, view[i]);
    }
    const factor = 0.99 / maxi;
    for (let i = 0; i < length; i++) {
        view[i] *= factor;
    }
};

utils.nearestImage = function() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const size = utils.viewSize;
    const cells = utils.view;
    const colorsTable=colors.table;
    const colorsN=colors.n;
    const scale = (size - 4) / width;
    let imageIndex = 0;
    for (var j = 0; j < height; j++) {
        const jCellSize = size * Math.floor(2 + j * scale);
        for (var i = 0; i < width; i++) {
            const iCell = 2 + Math.floor(i * scale);
            const colorIndex = Math.floor(colorsN * cells[jCellSize + iCell]);
            pixels.array[imageIndex] = colorsTable[colorIndex];
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
    const size = utils.viewSize;
    const cells = utils.view;
    const scale = (size - 4) / width; // inverse of size of a cell in pixels
    const offset = (3 + scale) / 2;
    const colorsTable=colors.table;
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
            pixels.array[imageIndex] = colorsTable[colorIndex];
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
    const size = utils.viewSize;
    const cells = utils.view;
    const colorsTable=colors.table;
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
            const colorIndex = Math.min(Math.max(Math.floor(colors.n * sum), 0), colors.n - 1);
            pixels.array[imageIndex] = colorsTable[colorIndex];
            imageIndex += 1;
        }
    }
    output.pixels.show();
};

utils.image = utils.cubicImage;

//==========================================
// setup of initial state
// various configurations

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
    cells[center + 2 * size + 2] = config[6];
    cells[center - 2 * size - 2] = config[6];
    cells[center + 2 - 2 * size] = config[6];
    cells[center - 2 + 2 * size] = config[6];
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
    const c0 = config[0];
    const c1 = config[1];
    const c2 = config[1];
    const c3 = config[2];
    const c4 = config[2];
    const c5 = config[3];
    const c6 = config[3];
    let center = (size - 1) / 2;
    center = center + center * size;
    cells[center] = c0;
    cells[center - 1] = c1;
    cells[center + 1 + size] = c1;
    cells[center - size] = c1;
    cells[center + 1] = c2;
    cells[center + size] = c2;
    cells[center - 1 - size] = c2;
    cells[center - 1 + size] = c3;
    cells[center + 2 + size] = c3;
    cells[center - 1 - 2 * size] = c3;
    cells[center + 1 + 2 * size] = c4;
    cells[center + 1 - size] = c4;
    cells[center - 2 - size] = c4;
    cells[center - 2 * size] = c5;
    cells[center - 2] = c5;
    cells[center + 2 + 2 * size] = c5;
    cells[center - 2 - 2 * size] = c6;
    cells[center + 2] = c6;
    cells[center + 2 * size] = c6;
    utils.prevCells[center] = 1;
};

utils.prevStateHexagon = function(config) {
    const size = utils.cellSize;
    const cells = utils.prevCells;
    const c0 = config[0];
    const c1 = config[1];
    const c2 = config[1];
    const c3 = config[2];
    const c4 = config[2];
    const c5 = config[3];
    const c6 = config[3];
    let center = (size - 1) / 2;
    center = center + center * size;
    cells[center] = c0;
    cells[center - 1] = c1;
    cells[center + 1 + size] = c1;
    cells[center - size] = c1;
    cells[center + 1] = c2;
    cells[center + size] = c2;
    cells[center - 1 - size] = c2;
    cells[center - 1 + size] = c3;
    cells[center + 2 + size] = c3;
    cells[center - 1 - 2 * size] = c3;
    cells[center + 1 + 2 * size] = c4;
    cells[center + 1 - size] = c4;
    cells[center - 2 - size] = c4;
    cells[center - 2 * size] = c5;
    cells[center - 2] = c5;
    cells[center + 2 + 2 * size] = c5;
    cells[center - 2 - 2 * size] = c6;
    cells[center + 2] = c6;
    cells[center + 2 * size] = c6;
};
//===========================================
// sums
// without the double border of zero cells

// weights for square lattice

//      5 3 4
//    4 2 1 2 5
//    3 1 0 1 3
//    5 2 1 2 4
//      4 3 5

utils.makeSumSquare = function(weights) {
    const cells = utils.cells;
    const sums = utils.sums;
    const size = utils.cellSize;
    var cm22, cm12, c02, c12, c22;
    var cm21, cm11, c01, c11, c21;
    var cm20, cm10, c00, c10, c20;
    var cm2m1, cm1m1, c0m1, c1m1, c2m1;
    var cm2m2, cm1m2, c0m2, c1m2, c2m2;
    const w0 = weights[0];
    const w1 = weights[1];
    const w2 = weights[2];
    const w3 = weights[3];
    const w4 = weights[4];
    const w5 = weights[5];
    const w6 = weights[6];
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        let center = j * size + 1;
        cm12 = cells[center + 2 * size - 1];
        c02 = cells[center + 2 * size];
        c12 = cells[center + 2 * size + 1];
        c22 = cells[center + 2 * size + 2];
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
        cm1m2 = cells[center - 2 * size - 1];
        c0m2 = cells[center - 2 * size];
        c1m2 = cells[center - 2 * size + 1];
        c2m2 = cells[center - 2 * size + 2];
        for (let i = 2; i < sizeM2; i++) {
            center += 1;
            cm22 = cm12;
            cm12 = c02;
            c02 = c12;
            c12 = c22;
            c22 = cells[center + 2 + 2 * size];
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
            cm2m2 = cm1m2;
            cm1m2 = c0m2;
            c0m2 = c1m2;
            c1m2 = c2m2;
            c2m2 = cells[center + 2 - 2 * size];
            let sum = w0 * c00;
            sum += w1 * (c01 + cm10 + c10 + c0m1);
            sum += w2 * (c11 + cm11 + c1m1 + cm1m1);
            sum += w3 * (c02 + cm20 + c20 + c0m2);
            sum += w4 * (cm12 + cm2m1 + c1m2 + c21);
            sum += w5 * (c12 + c2m1 + cm1m2 + cm21);
            sum += w6 * (c22 + c2m2 + cm2m2 + cm22);
            sums[center] = Math.abs(sum);
        }
    }
};

// for hexagon lattice

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
    const w1 = weights[1];
    const w2 = weights[1];
    const w3 = weights[2];
    const w4 = weights[2];
    const w5 = weights[3];
    const w6 = weights[3];
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
            sums[center] = Math.abs(sum);
        }
    }
};

//==================================

// making the transitions

// without the double border, that remains always cleared

// transition tables, needs number of states
utils.colors = 4;
utils.nStates = 4;
utils.trianglePeriod = 40;

// sawtooth table
utils.sawToothTable = function(sum) {
    return sum % utils.nStates;
};
// inverse sawtooth table
utils.inverseSawToothTable = function(sum) {
    sum = sum % utils.nStates;
    return (sum === 0) ? 0 : utils.nStates - sum;
};

// slow sawtooth table
utils.slowToothTable = function(sum) {
    return Math.floor((sum + 1) / 2) % utils.nStates;
};

// triangle table
utils.triangleTable = function(sum) {
    let value = sum % utils.trianglePeriod;
    if (value >= utils.nStates) {
        value = utils.trianglePeriod - value;
    }
    return value;
};

// make transition and sum cells (for time-average)
// to get more structure: sum modulo maxAverage
utils.maxAverage = 10;
utils.average = false;

utils.transitionTable = utils.sawToothTable;

utils.reversible = 0;

utils.transition = function() {
    const cells = utils.cells;
    const size = utils.cellSize;
    const reversible = utils.reversible;
    const reversibleSum = utils.reversibleSum;
    const prevCells = utils.prevCells;
    const transitionTable = utils.transitionTable;
    const sums = utils.sums;
    const nStates = utils.nStates;
    const sizeM2 = size - 2;
    const transition = [];
    transition.length = 1000;
    for (let i = 0; i < 1000; i++) {
        transition[i] = transitionTable(i);
    }
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            const rememberState = cells[index];
            if (reversibleSum) {
                cells[index] = (reversible * prevCells[index] + transition[sums[index]]) % nStates;
            } else {
                const prev = (reversible * prevCells[index]) % nStates;
                const trans = transition[sums[index]];
                cells[index] = prev ^ trans;
            }
            prevCells[index] = rememberState;
        }
    }
};

// see if non-zero cells are next to the border (third rows or columns)
// Then no more steps should be done
utils.checkBorder = function() {
    utils.stop = false;
    const cells = utils.cells;
    const size = utils.cellSize;
    for (let i = 0; i < size; i++) {
        let full = (cells[i + 2 * size] > 0) || (cells[i + (size - 3) * size] > 0);
        full = full || (cells[i * size + 2] > 0) || (cells[i * size + size - 3] > 0);
        if (full) {
            utils.stop = true;
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
        utils.copyCellsView = utils.copyCellsViewHexagon;
    }
};

utils.improvedHexagonLattice = function(average = false) {
    utils.initialState = utils.initialStateHexagon;
    utils.makeSum = utils.makeSumHexagon;

    if (average) {
        utils.copyCellsView = utils.copySumCellsViewImprovedHexagon;
    } else {
        //  utils.copyCellsView = utils.copyCellsViewHexagon;
        utils.copyCellsView = utils.copyCellsViewImprovedHexagon;
    }
};
utils.lattice = utils.squareLattice;


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
    utils.getViewLimits();
    utils.makeView();
    utils.normalizeView();
    utils.image();
};

// stop
//==========
//  utils.stop===true

// stepping is universal, choose things in the initialization