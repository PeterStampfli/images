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
};

//=========================================
// boundary
utils.clearBoundary = function(array, size = 0) {
    if (size <= 0) {
        size = utils.size;
    }
    // doing the inner boundary
    let end = 2 * size - 2;
    for (let index = size + 1; index <= end; index++) {
        array[index] = inner;
    }
    end = size * size - size - 2;
    for (let index = size * size - 2 * size + 1; index <= end; index++) {
        array[index] = inner;
    }
    end = size * size - 2 * size + 1;
    for (let index = 1 + size; index <= end; index += size) {
        array[index] = inner;
    }
    end = size * size - size - 2;
    for (let index = 2 * size - 2; index <= end; index += size) {
        array[index] = inner;
    }
    // outer boundary
    end = size - 1;
    for (let index = 0; index <= end; index++) {
        array[index] = outer;
    }
    end = size * size - 1;
    for (let index = end - size + 1; index <= end; index++) {
        array[index] = outer;
    }
    end = size * size - size;
    for (let index = 0; index <= end; index += size) {
        array[index] = outer;
    }
    end = size * size - 1;
    for (let index = size - 1; index <= end; index += size) {
        array[index] = outer;
    }
};

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