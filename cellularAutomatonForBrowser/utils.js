/* jshint esversion: 6 */

export const utils = {};

//=====================================
// utilities

// forcing odd number
utils.makeOdd = function(n) {
    return Math.floor(n / 2) * 2 + 1;
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
        size = utils.size;
    }
    let index = 0;
    for (let j = 0; j < size; j++) {
        let message = j + ' : ';
        for (let i = 0; i < size; i++) {
            message += ' ' + array[index];
            index += 1;
        }
        console.log(message);
    }
};


//===================================================
// the cell and other arrays
//  cells, sums, prevSums, cellsView, view
utils.cells = [];
utils.prevCells = [];
utils.sums = [];
utils.cellsView = [];
utils.view = [];

// initialization
utils.setSize = function(size) {
    size = utils.makeOdd(size);
    utils.size = size;
    const size2 = size * size;
    extend(utils.cells, size2);
    utils.cells.fill(0);
    extend(utils.prevCells, size2);
    utils.prevCells.fill(0);
    extend(utils.sums, size2);
    utils.sums.fill(0);
    extend(utils.cellsView, size2);
    utils.cellsView.fill(0);
    // initialize limits (region grows only)
};

//=====================================================
// adapted microscopic view
// center-viewHalf ... center+viewHalf

utils.setViewLimits = function(mini, maxi) {
    utils.viewHalfMax = Math.floor(maxi / 2);
    utils.viewHalf = Math.floor(mini / 2);
};

// copy cells to cell view
// simple copy for square lattice
utils.copyCellsViewSquare = function() {
    const size2 = utils.size * utils.size;
    for (let i = 0; i < size2; i++) {
        utils.cellsView[i] = utils.cells[i];
    }
};

// copy for hexagon symmetry with shift
utils.copyCellsViewHexagon = function() {
    const size = utils.size;
    const center = Math.floor(utils.size / 2);
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

// determine limits of nonzero cells (view)
// suppose that image only grows
// limit and symmetrize
// determine stop
utils.getViewHalf = function() {
    const size = utils.size;
    const center = Math.floor(utils.size / 2);
    let index = 0;
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            if (utils.cellsView[index] > 0) {
                utils.viewHalf = Math.max(utils.viewHalf, Math.abs(i - center), Math.abs(j - center));
            }
            index += 1;
        }
    }
    utils.cellsFull = (utils.viewHalf > center - 2);
    utils.viewHalf = Math.min(utils.viewHalf, utils.viewHalfMax);
};

// make reduced view matrix
utils.makeView = function() {
    const viewSize = 5 + 2 * utils.viewHalf;
    utils.extend(utils.view, viewSize * viewSize);
    utils.view.fill(0);
    const center = Math.floor(utils.size / 2);
    // diagonal shift between the two centers
    const shift = (center - 2 - utils.viewHalf) * (viewSize + 1);
    // without upper,lower border 
    const top = (viewSize - 2) * viewSize;
    for (let index = 2 * viewSize; index < top; index++) {
        utils.view[index] = utils.cellsView[index + shift];
    }
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

function cubicImage() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = width;
    const size = 5 + 2 * utils.viewHalf;
 const cells=utils.view;
    const scale = (size - 4) / width; // inverse of size of a cell in pixels
    const offset = (3 + scale) / 2;
    const factor = nColors / nStates;
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
            const colorIndex = Math.floor(factor * Math.round(sum));
            pixels.array[imageIndex] = colors[colorIndex];
            imageIndex += 1;
        }
    }
    output.pixels.show();
}

//==========================================
// initialization

//===========================================
// sums

//============================================
// making the transitions

// transition tables, needs number of states
utils.nStates = 16;

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

utils.transitionTable = utils.triangleTable;

utils.irreversibleTransition = function() {
    const size = utils.size;
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            utils.cells[index] = utils.transitionTable(utils.sums[index]);
        }
    }
};

utils.reversibleTransition = function() {
    const size = utils.size;
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            const rememberState = utils.cells[index];
            utils.cells[index] = (utils.prevCells[index] + utils.transitionTable(utils.sums[index])) % utils.nStates;
            utils.prevCells[index] = rememberState;
        }
    }
};