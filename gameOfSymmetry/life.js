/*
 generalization of game of life:

- each cell has nStates <= 256 different states, 0,1,2, ... nStates-1 (typically a power of 2)
- the cells are on a periodic, quasiperiodic, hyperbolic, fractal or whatever grid
- periodic boundary condition for periodic lattices, other bc. : some given value on border cells
- initial state: one cell in center, more cells, asymmetric initial conditions (no mirror symmetry)
- next generation:
-- calculate weighted sum = weightCenter * centerCell 
                           + weightNearest * sum of nearest neigbors 
                           + weightSecondNearest * sum of secondNearest neighbors
-- max sum = (nStates-1)*(weightCenter+4*weightNearest+4*weightSecondNearest) for square lattice
-- new state of cell = transitionTable[sum] (looking up the transition table, length maxSum+1)
- image (data) is composed of several generations of the cellular automaton
-- restricted to 32 bits, first 8 bits as grey scale image, first 24 bits as rgb image
-- shifting (multiplication) and adding: image = imageFactor * image + newCell
-- typically, imageFactor=nStates

*/

/*
set parameters directly using paramGui
other methods for testing
*/

/**
 * the automaton that makes the generations (life)
 * we might need several of them
 * @constructor Life
 */

export function Life() {
    // default parameter values
    // the number of states a cell can have
    this.nStates = 2;
    // weights for combining sum of center, nearest,2nd nearest neighbor cells
    this.weightCenter = 1;
    this.weightNearest = 1;
    this.weightSecondNearest = 1;
    // starting configuration at center of image
    this.startCenter = 1;
    this.startNearest = 0;
    this.startSecondNearest = 0;
    // multiplication factor for combining cell states into 8bit image values
    this.imageFactor = 1;
    // working arrays
    this.transitionTable = [];
    this.resetTransitionTable();
    // histogram of combined image values, for quality control
    this.imageHistogram = [];
    this.imageHistogram.length = 256; // 8 bit image
    this.imageHistogramMax = 1;
    // this.initialCells: a function that sets the cells initially. Including the boundary cells
    // default: all cells zero except at center as defined by parameters
    this.initialCellsAtCenter();
    // this.iterateBoundaryCells: a function for iterating the boundary cells
    // default: does nothing, value of boundary cells will be zero
    this.setIterationBoundaryZero();
    // set the method for reading the image
    this.setReadImageMethod(this.readImageGreyscaleNearestNeighbor);
    this.transitionTableScale = 1;
}

/**
 * set the size of the problem, 
 * has to be an odd number, (even numbers will be made odd)
 * the arrays include the added border cells of the boundary condition
 * @method Life#setSize
 * @param {int} size - has to be an odd number
 * @return this - for chaining, just in case
 */
Life.prototype.setSize = function(size) {
    // size of world (period length or width without boundary cells)
    size = size | 1; // force size to be odd
    this.size = size;
    // size plus boundary cells
    this.arraySide = size + 2;
    this.cells = new Uint8Array(this.arraySide * this.arraySide);
    this.newCells = new Uint8Array(this.arraySide * this.arraySide);
    // sets in particular the boundary cells to zero
    this.newCells.fill(0);
    // image: no boundary cells
    this.image = new Uint32Array(size * size);
    // period, accounting for finite pixels
    // goes from a pixel to a pixel with the same color
    this.periodX = size;
    this.periodY = this.arraySide * size;
    // offset for corner positions
    // this.bottomLeft=0;  
    this.bottomRight = this.arraySide - 1;
    this.topLeft = this.arraySide * (this.arraySide - 1);
    this.topRight = this.cells.length - 1;
    // position of the center
    this.centerX = Math.floor(this.arraySide / 2);
    this.centerY = this.centerX * this.arraySide;
    this.center = this.centerX + this.centerY;
    // steps
    // nearest neighbors
    this.stepRight = 1;
    this.stepLeft = -1;
    // accounting for inversion of y-axis
    this.stepUp = -this.arraySide;
    this.stepDown = this.arraySide;
    // second nearest
    this.stepUpRight = 1 - this.arraySide;
    this.stepDownRight = 1 + this.arraySide;
    this.stepUpLeft = -1 - this.arraySide;
    this.stepDownLeft = -1 + this.arraySide;
    return this;
};

/**
 * for tests. set number of states of a cell
 * @method Life#setNStates
 * @param {int} nStates
 */
Life.prototype.setNStates = function(nStates) {
    this.nStates = nStates;
    this.resetTransitionTable();
};

/**
 * set the weights for summation before looking up the transition table
 * @method Life#setWeights
 * @param {int} weightCenter
 * @param {int} weightNearest
 * @param {int} weightSecondNearest
 */
Life.prototype.setWeights = function(weightCenter, weightNearest, weightSecondNearest) {
    this.weightCenter = weightCenter;
    this.weightNearest = weightNearest;
    this.weightSecondNearest = weightSecondNearest;
    this.resetTransitionTable();
};

/**
 * set the starting configuration parameters
 * @method Life#setStartParameters
 * @param {int} startCenter - value for cell at center of image
 * @param {int} startNearest - value for cells nearest to center cell
 * @param {int} startSecondNearest - value for second nearest cells
 */
Life.prototype.setStartParameters = function(startCenter, startNearest, startSecondNearest) {
    this.startCenter = startCenter;
    this.startNearest = startNearest;
    this.startSecondNearest = startSecondNearest;
};

/**
 * set initial cells all to zero except at center (there depending on parameters)
 * @method Life#initialCellsAtCenter
 */
Life.prototype.initialCellsAtCenter = function() {
    this.initialCells = function() {
        this.fillValue(0);
        this.setCenterCells();
    };
};

/**
 * set boundary condition for iteration - periodic
 * default is not periodic
 * @method Life.setIterationBoundaryPeriodic
 */
Life.prototype.setIterationBoundaryPeriodic = function() {
    this.iterateBoundaryCells = function() {
        this.fillBorderPeriodic();
    };
};

/**
 * set boundary condition for iteration - zero value
 * @method Life.setIterationBoundaryZero
 */
Life.prototype.setIterationBoundaryZero = function() {
    this.iterateBoundaryCells = function() {};
};

/**
 * for tests. set image (shift) factor
 * multiplies the cell values for the final image before adding new automaton cell values
 * @method Life#setImageFactor
 * @param {int} factor
 */
Life.prototype.setImageFactor = function(factor) {
    this.imageFactor = factor;
    this.clearImage();
};

/**
 * set the read image method to one of the three above
 * readImageNearestNeighbor, readImageLinearInterpolation or readImageCubicInterpolation
 * @method Life#setReadImageMethod
 * @param {function} reader - a read image method
 */
Life.prototype.setReadImageMethod = function(reader) {
    this.readImage = reader;
};

// logging for debugging
//=============================================================
// convert integer 0..255 to hex string

function toHex(i) {
    let result = i.toString(16);
    if (result.length === 1) {
        result = "0" + result;
    }
    return result;
}

// make a random number between 0 and max-1

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

const thirtyTwoPower = 4294967296;

const logItemLimit = 20;

/**
 * log a square array, limited
 * @method Life.logArray
 * @param {array} array
 */
Life.logArray = function(array) {
    const size = Math.floor(Math.sqrt(array.length + 0.1));
    console.log("array, size: " + size);
    const limit = Math.min(logItemLimit, size);
    for (var j = 0; j < limit; j++) {
        const base = size * j;
        let line = toHex(j) + ":";
        for (var i = 0; i < limit; i++) {
            if (i % 4 === 0) {
                line += " ";
            }
            line += " " + toHex(array[i + base]);
        }
        console.log(line);
    }
};

/**
 * logging the transition table
 * @method Life#logTransitionTable
 */
Life.prototype.logTransitionTable = function() {
    console.log();
    const lineLength = 8;
    let line = " ";
    const length = this.transitionTable.length;
    console.log("number of states " + this.nStates);
    console.log("transitionTable: length " + length);
    for (var i = 0; i < length; i++) {
        if (i % lineLength === 0) {
            console.log(line);
            line = toHex(i) + ":";
        }
        if (i % 4 === 0) {
            line += " ";
        }
        line += " " + toHex(this.transitionTable[i]);
    }
};

/**
 * @method Life#logCells
 */
Life.prototype.logCells = function(message = "") {
    console.log();
    if (message !== "") {
        console.log(message);
    }
    console.log("cells");
    Life.logArray(this.cells);
};

/**
 * @method Life#logNewCells
 */
Life.prototype.logNewCells = function(message = " ") {
    console.log();
    if (message !== "") {
        console.log(message);
    }
    console.log("newCells");
    Life.logArray(this.newCells);
};

/**
 * @method Life#logImage
 */
Life.prototype.logImage = function(message = " ") {
    console.log();
    if (message !== "") {
        console.log(message);
    }
    console.log("Image: Factor " + this.imageFactor);
    Life.logArray(this.image);
};

/**
 * log the histogram
 * @method Life#logImageHistogram
 */
Life.prototype.logImageHistogram = function() {
    console.log("image histogram: max value " + this.imageHistogramMax);
    for (var chunk = 0; chunk < 256; chunk += 16) {
        let text = chunk + ": ";
        for (var i = 0; i < 16; i++) {
            if (i % 4 === 0) {
                text += "  ";
            }
            text += " " + this.imageHistogram[i + chunk].toFixed(2);
        }
        console.log(text);
    }
};

// working with the transition table
//====================================================================================

/**
 * update length of the transition table, clear the transition table
 * is called when changing number of states or the weights
 * @method Life#resetTransitionTable
 */
Life.prototype.resetTransitionTable = function() {
    // cells have value 0, ..., nStates-1 !!!
    const maxSum = (this.nStates - 1) * (this.weightCenter + 4 * this.weightNearest + 4 * this.weightSecondNearest);
    this.transitionTable.length = maxSum + 1;
    this.transitionTable.fill(0);
};

/**
 * set the transition table from a hexadecimal number string or an integer number
 * decoding to numbers of base nStates with transitionTable.length number of digits
 * @method Life#setTransitionTableWithCode
 * @param {int|string} code - integer or a hexadecimal number string
 */
Life.prototype.setTransitionTableWithCode = function(code) {
    if (typeof code === "string") {
        code = parseInt(code, 16);
    }
    // lowest digit gets into first number ... as one would expect
    const transitionTable = this.transitionTable;
    const nStates = this.nStates;
    const length = transitionTable.length;
    for (var i = 0; i < length; i++) {
        transitionTable[i] = code % nStates;
        code = Math.floor(code / nStates);
    }
};

/**
 * encode the transition table as a hexadecimal number string
 * @method Life.getCodeOfTransitionTable
 * @return hexadecimal number string
 */
Life.prototype.getCodeOfTransitionTable = function() {
    let code = 0;
    // lowest digit gets into first number ... as one would expect
    const transitionTable = this.transitionTable;
    const nStates = this.nStates;
    const length = transitionTable.length;
    for (var i = length - 1; i >= 0; i--) {
        code = code * nStates + transitionTable[i];
    }
    return code.toString(16);
};

/**
 * create the transition table using a function
 * @method Life#makeTransitionTableWith
 * @param {function} fun - return value for index
 */
Life.prototype.makeTransitionTableWith = function(fun) {
    const length = this.transitionTable.length;
    const nStates = this.nStates;
    for (var i = 0; i < length; i++) {
        this.transitionTable[i] = Math.floor(fun(i)) % nStates;
    }
};

/**
 * make a random transition table
 * @method Life#randomTransitionTable
 */
Life.prototype.randomTransitionTable = function() {
    const nStates = this.nStates;
    this.makeTransitionTableWith(function() {
        return randomInt(nStates);
    });
};

/**
 * set the transition table scale factor
 * @method Life.setTransitionTableScale
 * param {float} scale
 */
Life.prototype.setTransitionTableScale = function(scale) {
    this.transitionTableScale = scale;
};

/**
 * make a saw tooth transition table, depending on number of states
 * @method Life#sawToothTransitionTable
 */
Life.prototype.sawToothTransitionTable = function() {
    const nStates = this.nStates;
    const transitionTableScale = this.transitionTableScale;
    this.makeTransitionTableWith(function(i) {
        return i * transitionTableScale % nStates;
    });
};

/**
 * make a tent transition table, depending on number of states
 * @method Life#tentTransitionTable
 */
Life.prototype.tentTransitionTable = function() {
    const nStates = this.nStates;
    const transitionTableScale = this.transitionTableScale;
    const period = 2 * (nStates - 1);
    this.makeTransitionTableWith(function(i) {
        let result = i * transitionTableScale % period;
        if (result >= nStates) {
            result = period - result;
        }
        return result;
    });
};

//  initialization of cells
//=====================================================
// fill all cells, then change center cells and border cells

/**
 * fill all cells with the some number, modulo nStates
 * @method Life#fillValue
 * @param {number} value
 */
Life.prototype.fillValue = function(value) {
    value = value % this.nStates;
    this.cells.fill(value);
};

/**
 * fill the cells with numbers that are functions of the indices, 
 * rounded down, modulo the number of cell states
 * SYMMETRY ???
 * @method Life#fill
 * @param {function} fun - of indices i,j
 */
Life.prototype.fill = function(fun) {
    const arraySide = this.arraySide;
    const nStates = this.nStates;
    let index = 0;
    for (var j = 0; j < arraySide; j++) {
        for (var i = 0; i < arraySide; i++) {
            this.cells[index] = Math.floor(fun(i, j, arraySide)) % nStates;
            index += 1;
        }
    }
};

/**
 * fill the cells symmetrically with numbers that are functions of the indices
 * rounded down, modulo the number of cell states
 * @method Life#fillSymmetrically
 * @param {function} fun - of indices i,j
 */
Life.prototype.fillSymmetrically = function(fun) {
    const arraySide = this.arraySide;
    const center = this.centerX;
    const center2 = 2 * this.centerX;
    const cells = this.cells;
    const nStates = this.nStates;
    for (var j = 0; j <= center; j++) {
        for (var i = j; i <= center; i++) {
            const value = Math.floor(fun(i, j, arraySide)) % nStates;
            cells[i + j * arraySide] = value;
            cells[j + i * arraySide] = value;
            cells[center2 - i + j * arraySide] = value;
            cells[center2 - j + i * arraySide] = value;
            cells[i + (center2 - j) * arraySide] = value;
            cells[j + (center2 - i) * arraySide] = value;
            cells[center2 - j + (center2 - i) * arraySide] = value;
            cells[center2 - i + (center2 - j) * arraySide] = value;
        }
    }
};

/**
 * fill the cells symmetrically with random numbers, modulo 256
 * @method Life#fillSymmetricallyRandom
 */
Life.prototype.fillSymmetricallyRandom = function() {
    const nStates = this.nStates;
    this.fillSymmetrically(function(i, j) {
        return randomInt(nStates);
    });
};

/**
 * set the start cells (initialization)
 * @method Life#setCenterCells
 */
Life.prototype.setCenterCells = function() {
    const center = this.center;
    const cells = this.cells;
    cells[center] = this.startCenter;
    cells[center + this.stepUp] = this.startNearest;
    cells[center + this.stepDown] = this.startNearest;
    cells[center + this.stepRight] = this.startNearest;
    cells[center + this.stepLeft] = this.startNearest;
    cells[center + this.stepUpLeft] = this.startSecondNearest;
    cells[center + this.stepDownLeft] = this.startSecondNearest;
    cells[center + this.stepUpRight] = this.startSecondNearest;
    cells[center + this.stepDownRight] = this.startSecondNearest;
};


// border for boundary condition and initialization
//=================================================

// initially fill border with a constant value, or symmetrically (with or without mirror symmetry) with random numbers

// at each iteration use periodic boundary condition, or constant value or zero  (no random values)

/**
 * fill border cells, leave rest unchanged, do only initially (???)
 * @method Life#fillBorderValue
 * @param {number} value
 */
Life.prototype.fillBorderValue = function(value) {
    let top = this.topLeft;
    let left = 0;
    let right = this.bottomRight;
    const arraySide = this.arraySide;
    for (var i = 0; i < arraySide; i++) {
        this.cells[i] = value; // bottom border
        this.cells[top] = value; // top border
        top += 1;
        this.cells[left] = value; // left border
        left += arraySide;
        this.cells[right] = value; // right border
        right += arraySide;
    }
};

/**
 * fill border cells with random values symmetrically 
 * with a function depending on distance from corner
 * @method Life#fillBorderSymmetricallyRandom
 * @param {function} fun - f(i, arraySide)
 */
Life.prototype.fillBorderSymmetrically = function(fun) {
    const arraySide = this.arraySide;
    const center = this.centerX;
    const center2 = 2 * this.centerX;
    const cells = this.cells;
    const nStates = this.nStates;
    const arraySize = this.cells.length;
    for (var i = 0; i <= center; i++) {
        const value = Math.floor(fun(i, arraySide)) % nStates;
        this.cells[i] = value; // bottom border
        this.cells[center2 - i] = value; // bottom border
        this.cells[i * arraySide] = value;
        this.cells[(center2 - i) * arraySide] = value;
        this.cells[i * arraySide + arraySide - 1] = value;
        this.cells[(center2 - i) * arraySide + arraySide - 1] = value;
        this.cells[arraySize - 1 - i] = value;
        this.cells[arraySize - 1 - center2 + i] = value;
    }
};

/**
 * fill border cells with random values symmetrically
 * @method Life#fillBorderSymmetricallyRandom
 */
Life.prototype.fillBorderSymmetricallyRandom = function() {
    const nStates = this.nStates;
    this.fillBorderSymmetrically(function() {
        return randomInt(nStates);
    });
};

/**
 * fill border cells symmetrically, without mirror symmetry
 * with a function depending on distance from corner
 * @method Life#fillBorderSymmetricallyNoMirror
 * @param {function} fun - f(i, arraySide)
 */
Life.prototype.fillBorderSymmetricallyNoMirror = function(fun) {
    const arraySide = this.arraySide;
    const center = this.centerX;
    const center2 = 2 * this.centerX;
    const cells = this.cells;
    const nStates = this.nStates;
    const arraySize = this.cells.length;
    for (var i = 0; i < arraySide; i++) {
        const value = Math.floor(fun(i, arraySide)) % nStates;
        this.cells[i] = value;
        this.cells[(arraySide - i - 1) * arraySide] = value;
        this.cells[i * arraySide + arraySide - 1] = value;
        this.cells[arraySize - 1 - i] = value;
    }
};

/**
 * fill border cells with random values symmetrically, without mirror symmetry
 * @method Life#fillBorderSymmetricallyNoMirrorRandom
 */
Life.prototype.fillBorderSymmetricallyNoMirrorRandom = function() {
    const nStates = this.nStates;
    this.fillBorderSymmetricallyNoMirror(function() {
        return randomInt(nStates);
    });
};

// for iteration

/**
 * fill border cells, periodic boundary condition, need to do each cycle
 * @method Life#fillBorderPeriodic
 */
Life.prototype.fillBorderPeriodic = function() {
    const arraySide = this.arraySide;
    const end = arraySide - 1;
    // first do borders between corners
    let top = this.topLeft + 1;
    let right = this.bottomRight + arraySide;
    let left = arraySide;
    for (var i = 1; i < end; i++) {
        this.cells[i] = this.cells[i + this.periodY]; // bottom border
        this.cells[top] = this.cells[top - this.periodY]; // top border
        top += 1;
        this.cells[left] = this.cells[left + this.periodX]; // left border
        left += arraySide;
        this.cells[right] = this.cells[right - this.periodX]; // right border
        right += arraySide;
    }
    // the corners
    this.cells[0] = this.cells[this.periodX + this.periodY];
    this.cells[this.bottomRight] = this.cells[this.bottomRight - this.periodX + this.periodY];
    this.cells[this.topLeft] = this.cells[this.topLeft + this.periodX - this.periodY];
    this.cells[this.topRight] = this.cells[this.topRight - this.periodX - this.periodY];
};

// iteration
//=====================================================

/**
 * make the new generation in this.newCells
 * supposing that this.cells has correct boundary condition
 * @method Life#makeNewGeneration
 */
Life.prototype.makeNewGeneration = function() {
    const arraySide = this.arraySide;
    const size = this.size;
    const maxIndex = this.arraySide - 2;
    const stepUpRight = this.stepUpRight;
    const stepDownRight = this.stepDownRight;
    const stepUp = this.stepUp;
    const stepDown = this.stepDown;
    const cells = this.cells;
    const newCells = this.newCells;
    const image = this.image;
    const transitionTable = this.transitionTable;
    const weightCenter = this.weightCenter;
    const weightNearest = this.weightNearest;
    const weightSecondNearest = this.weightSecondNearest;
    const imageFactor = this.imageFactor;
    var index, imageIndex, sumExCenterLeft, sumExCenter, sumExCenterRight, left, center, right;

    // going through all cells that belong to the image, omit border cells
    imageIndex = -1;
    for (var j = 1; j <= maxIndex; j++) {
        index = j * arraySide;
        center = cells[index];
        right = cells[index + 1];
        sumExCenter = cells[index + stepUp] + cells[index + stepDown];
        sumExCenterRight = cells[index + stepUpRight] + cells[index + stepDownRight];
        for (var i = 1; i <= maxIndex; i++) {
            index += 1;
            imageIndex += 1;
            left = center;
            center = right;
            right = cells[index + 1];
            sumExCenterLeft = sumExCenter;
            sumExCenter = sumExCenterRight;
            sumExCenterRight = cells[index + stepUpRight] + cells[index + stepDownRight];
            const totalSum = weightCenter * center + weightNearest * (left + right + sumExCenter) + weightSecondNearest * (sumExCenterLeft + sumExCenterRight);
            const newState = transitionTable[totalSum];
            newCells[index] = newState;
        }
    }
};

/**
 * clear the image
 * @method Life#clearImage
 */
Life.prototype.clearImage = function() {
    this.image.fill(0);
};

/**
 * clear the new cells
 * @method Life#clearNewCells
 */
Life.prototype.clearNewCells = function() {
    this.newCells.fill(0);
};

/**
 * update image with info from state of cells (without border)
 * compose with earlier data
 * @method Life#updateImage
 */
Life.prototype.updateImage = function() {
    const arraySide = this.arraySide;
    const size = this.size;
    const maxIndex = this.arraySide - 2;
    const cells = this.cells;
    const image = this.image;
    const imageFactor = this.imageFactor;
    var index, imageIndex;
    // going through all cells that belong to the image, omit border cells
    imageIndex = -1;
    for (var j = 1; j <= maxIndex; j++) {
        index = j * arraySide;
        for (var i = 1; i <= maxIndex; i++) {
            index += 1;
            imageIndex += 1;
            image[imageIndex] = imageFactor * image[imageIndex] + cells[index];
        }
    }
};

/**
 * test if all cells have the same value (excluding boundary cells)
 * @method Life#equalCells
 * @return true if all cells not on the border have the same value
 */
Life.prototype.equalCells = function() {
    const arraySide = this.arraySide;
    const maxIndex = this.arraySide - 2;
    const cells = this.cells;
    const newCells = this.newCells;
    const value = cells[arraySide + 1];
    var index;
    // going through all cells that belong to the image, omit border cells
    for (var j = 1; j <= maxIndex; j++) {
        index = j * arraySide;
        for (var i = 1; i <= maxIndex; i++) {
            index += 1;
            if (cells[index] !== value) {
                return false;
            }
        }
    }
    return true;
};

/**
 * copy new generation to old, including border cell
 * note that making the newCell array it is initiatlized to zero
 * making a new generation does not change the border elements of newCells
 * thus the value of the border elements is always zero
 * @method Life#cellsFromNewCells
 */
Life.prototype.cellsFromNewCells = function() {
    this.cells.set(this.newCells);
};

// reading out the image
//=====================================

// quality control of the first 8 bits

/**
 * find maximum value of image, first 8 bits
 * for quality control  ???
 * @method Life#calculateMaxImageValue
 * @return number - maximum
 */
Life.prototype.calculateMaxImageValue = function(a) {
    return this.image.reduce((result, element) => Math.max(result, element & 255), -100000);
};

/**
 * calculate the image histogram, normalized by total number of image cells
 * only the first 8 bits
 * so we get the fraction of cells that has a given value
 * and calculate maximum histogram value (fail if this is too large)
 * @method Life#makeImageHistogram
 */
Life.prototype.makeImageHistogram = function() {
    const imageHistogram = this.imageHistogram;
    imageHistogram.fill(0);
    this.image.forEach(value => imageHistogram[value & 255] += 1);
    const factor = 1 / this.image.length;
    imageHistogram.forEach((element, i) => imageHistogram[i] = factor * element);
    this.imageHistogramMax = imageHistogram.reduce((result, element) => Math.max(result, element));
};

/**
 * reading the grey scale image using nearest neighbor interpolation
 * only the first 8 bits
 * colors got to this.red, this.green and this.blue
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space
 * coordinates clamped to image
 * @method Life.readGreyscaleImageNearestNeighbor
 * @param {float} x
 * @param {float} y
 */
Life.prototype.readGreyscaleImageNearestNeighbor = function(x, y) {
    const size = this.size;
    x = Math.max(0, Math.min(size - 1, Math.floor(size * x))); // x=0...1/size goes to first column with index 0
    y = Math.max(0, Math.min(size - 1, Math.floor(size * y))); // similarly for y
    const result = this.image[x + y * size];
    this.red = result;
    this.green = result;
    this.blue = result;
};

/**
 * reading an rgb image using nearest neighbor interpolation
 * from the first 24 bits
 * colors got to this.red, this.green and this.blue
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space
 * coordinates clamped to image
 * @method Life.readGreyscaleImageNearestNeighbor
 * @param {float} x
 * @param {float} y
 */
Life.prototype.readRGBImageNearestNeighbor = function(x, y) {
    const size = this.size;
    x = Math.max(0, Math.min(size - 1, Math.floor(size * x))); // x=0...1/size goes to first column with index 0
    y = Math.max(0, Math.min(size - 1, Math.floor(size * y))); // similarly for y
    const result = this.image[x + y * size];
    this.red = result & 255;
    this.green = (result >>> 8) & 255; // shift right for unsigned int
    this.blue = (result >>> 16) & 255;
};

/**
 * reading the image using linear interpolation
 * in reduced coordinates, going from 0 to 1
 * only the first 8 bits
 * colors got to this.red, this.green and this.blue
 * each image cell takes the same space (1/size)
 * coordinates clamped to image (approximating image cells outside by the next one inside)
 * a point between 0.5/size and 1.5/size interpolates between image[0] and image[1]
 * @method Life.readGreyscaleImageLinearInterpolation
 * @param {float} x
 * @param {float} y
 */
Life.prototype.readGreyscaleImageLinearInterpolation = function(x, y) {
    const size = this.size;
    const image = this.image;
    // interpolation between low and high
    x *= size;
    const xHigh = Math.max(0, Math.min(size - 1, Math.round(x))); // x between 0.5/size and 1.5/size interpolates between cells 0 and 1
    const xLow = Math.max(xHigh - 1);
    const dx = x - xLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
    y *= size;
    let yHigh = Math.max(0, Math.min(size - 1, Math.round(y)));
    let yLow = Math.max(0, yHigh - 1);
    const dy = y - yLow - 0.5;
    yHigh *= size;
    yLow *= size;
    let result = (1 - dx) * ((1 - dy) * image[xLow + yLow] + dy * image[xLow + yHigh]);
    result += dx * ((1 - dy) * image[xHigh + yLow] + dy * image[xHigh + yHigh]);
    result = Math.round(result) & 255;
    this.red = result;
    this.green = result;
    this.blue = result;
};

/**
 * reading the image using linear interpolation
 * in reduced coordinates, going from 0 to 1
 * the first 24 bits, for an rgb image
 * colors got to this.red, this.green and this.blue
 * each image cell takes the same space (1/size)
 * coordinates clamped to image (approximating image cells outside by the next one inside)
 * a point between 0.5/size and 1.5/size interpolates between image[0] and image[1]
 * @method Life.readGreyscaleImageLinearInterpolation
 * @param {float} x
 * @param {float} y
 */
Life.prototype.readRGBImageLinearInterpolation = function(x, y) {
    const size = this.size;
    const image = this.image;
    // interpolation between low and high
    x *= size;
    const xHigh = Math.max(0, Math.min(size - 1, Math.round(x))); // x between 0.5/size and 1.5/size interpolates between cells 0 and 1
    const xLow = Math.max(xHigh - 1);
    const dx = x - xLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
    y *= size;
    let yHigh = Math.max(0, Math.min(size - 1, Math.round(y)));
    let yLow = Math.max(0, yHigh - 1);
    const dy = y - yLow - 0.5;
    yHigh *= size;
    yLow *= size;
    const pix00 = image[xLow + yLow];
    const pix10 = image[xHigh + yLow];
    const pix01 = image[xLow + yHigh];
    const pix11 = image[xHigh + yHigh];
    //  the weights
    const f00 = (1 - dx) * (1 - dy);
    const f01 = (1 - dx) * dy;
    const f10 = dx * (1 - dy);
    const f11 = dy * dx;
    this.red = 0 | (0.5 + f00 * (pix00 & 0xff) + f10 * (pix10 & 0xff) + f01 * (pix01 & 0xff) + f11 * (pix11 & 0xff));
    this.green = 0 | (0.5 + f00 * (pix00 >>> 8 & 0xff) + f10 * (pix10 >>> 8 & 0xff) + f01 * (pix01 >>> 8 & 0xff) + f11 * (pix11 >>> 8 & 0xff));
    this.blue = 0 | (0.5 + f00 * (pix00 >>> 16 & 0xff) + f10 * (pix10 >>> 16 & 0xff) + f01 * (pix01 >>> 16 & 0xff) + f11 * (pix11 >>> 16 & 0xff));
};

/*
the interpolation kernel: linear interpolation of the kernel is much slower, the arrow function form is slightly slower
it is normalized to 1 within an error of about 1.00001 ! (good enough)
*/
function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
    if (x < 1) {
        return (1.16666 * x - 2) * x * x + 0.888888;
    }
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

/**
 * reading the greyscale image using cubic interpolation
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space
 * a point between 1.5/size and 2.5/size interpolates using image[0] to image[3]
 * coordinates clamped to image (approximating image cells outside by the next one inside)
 * @method Life.readGreyscaleImageCubicInterpolation
 * @param {float} x
 * @param {float} y
 * @return integer, between 0 and 255, image value
 */
Life.prototype.readGreyscaleImageCubicInterpolation = function(x, y) {
    const size = this.size;
    const image = this.image;
    // interpolation between low and high
    x *= size;
    const xHigh = Math.max(0, Math.min(size - 1, Math.round(x))); // x between 0.5/size and 1.5/size interpolates between cells 0 and 1
    const xLow = Math.max(0, xHigh - 1);
    const xLower = Math.max(0, xLow - 1);
    const xHigher = Math.min(size - 1, xHigh + 1);
    const dx = x - xLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
    y *= size;
    let yHigh = Math.max(0, Math.min(size - 1, Math.round(y)));
    let yLow = Math.max(0, yHigh - 1);
    let yLower = Math.max(0, yLow - 1);
    let yHigher = Math.min(size - 1, yHigh + 1);
    const dy = y - yLow - 0.5;
    yHigh *= size;
    yLow *= size;
    yLower *= size;
    yHigher *= size;
    // dx, dy relate to the cell at (xLow+yLow)
    const weightXLow = kernel(dx);
    const weightXHigh = kernel(1 - dx);
    const weightXLower = kernel(1 + dx);
    const weightXHigher = kernel(2 - dx);

    const weightYLow = kernel(dy);
    const weightYHigh = kernel(1 - dy);
    const weightYLower = kernel(1 + dy);
    const weightYHigher = kernel(2 - dy);

    let result = weightXLower * (weightYLower * image[xLower + yLower] + weightYLow * image[xLower + yLow] + weightYHigh * image[xLower + yHigh] + weightYHigher * image[xLower + yHigher]);
    result += weightXLow * (weightYLower * image[xLow + yLower] + weightYLow * image[xLow + yLow] + weightYHigh * image[xLow + yHigh] + weightYHigher * image[xLow + yHigher]);
    result += weightXHigh * (weightYLower * image[xHigh + yLower] + weightYLow * image[xHigh + yLow] + weightYHigh * image[xHigh + yHigh] + weightYHigher * image[xHigh + yHigher]);
    result += weightXHigher * (weightYLower * image[xHigher + yLower] + weightYLow * image[xHigher + yLow] + weightYHigh * image[xHigher + yHigh] + weightYHigher * image[xHigher + yHigher]);
    result = Math.max(0, Math.min(255, Math.round(result))); // beware of negative values
    this.red = result;
    this.green = result;
    this.blue = result;
};

/**
 * reading the rgb color image using cubic interpolation
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space
 * a point between 1.5/size and 2.5/size interpolates using image[0] to image[3]
 * coordinates clamped to image (approximating image cells outside by the next one inside)
 * @method Life.readRGBImageCubicInterpolation
 * @param {float} x
 * @param {float} y
 * @return integer, between 0 and 255, image value
 */
Life.prototype.readRGBImageCubicInterpolation = function(x, y) {
    const size = this.size;
    const image = this.image;
    // interpolation between low and high
    x *= size;
    const xHigh = Math.max(0, Math.min(size - 1, Math.round(x))); // x between 0.5/size and 1.5/size interpolates between cells 0 and 1
    const xLow = Math.max(0, xHigh - 1);
    const xLower = Math.max(0, xLow - 1);
    const xHigher = Math.min(size - 1, xHigh + 1);
    const dx = x - xLow - 0.5; // element with index 0 lies at 0.5 (scaled), shift of cell centers
    y *= size;
    let yHigh = Math.max(0, Math.min(size - 1, Math.round(y)));
    let yLow = Math.max(0, yHigh - 1);
    let yLower = Math.max(0, yLow - 1);
    let yHigher = Math.min(size - 1, yHigh + 1);
    const dy = y - yLow - 0.5;
    // multiplying with row width
    yHigh *= size;
    yLow *= size;
    yLower *= size;
    yHigher *= size;
    // dx, dy relate to the cell at (xLow+yLow)
    const kym = kernel(1 + dy);
    const ky0 = kernel(dy);
    const ky1 = kernel(1 - dy);
    const ky2 = kernel(2 - dy);
    let pixM = image[xLower + yLower];
    let pix0 = image[xLow + yLower];
    let pix1 = image[xHigh + yLower];
    let pix2 = image[xHigher + yLower];
    let kx = kernel(1 + dx);
    let red = kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
    let green = kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
    let blue = kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
    pixM = image[xLower + yLow];
    pix0 = image[xLow + yLow];
    pix1 = image[xHigh + yLow];
    pix2 = image[xHigher + yLow];
    kx = kernel(dx);
    red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
    green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
    blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
    pixM = image[xLower + yHigh];
    pix0 = image[xLow + yHigh];
    pix1 = image[xHigh + yHigh];
    pix2 = image[xHigher + yHigh];
    kx = kernel(1 - dx);
    red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
    green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
    blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
    pixM = image[xLower + yHigher];
    pix0 = image[xLow + yHigher];
    pix1 = image[xHigh + yHigher];
    pix2 = image[xHigher + yHigher];
    kx = kernel(2 - dx);
    red += kx * (kym * (pixM & 0xFF) + ky0 * (pix0 & 0xFF) + ky1 * (pix1 & 0xFF) + ky2 * (pix2 & 0xFF));
    green += kx * (kym * (pixM >>> 8 & 0xFF) + ky0 * (pix0 >>> 8 & 0xFF) + ky1 * (pix1 >>> 8 & 0xFF) + ky2 * (pix2 >>> 8 & 0xFF));
    blue += kx * (kym * (pixM >>> 16 & 0xFF) + ky0 * (pix0 >>> 16 & 0xFF) + ky1 * (pix1 >>> 16 & 0xFF) + ky2 * (pix2 >>> 16 & 0xFF));
    this.red = Math.max(0, Math.min(255, Math.round(red)));
    this.green = Math.max(0, Math.min(255, Math.round(green)));
    this.blue = Math.max(0, Math.min(255, Math.round(blue)));
};

// interaction elements
//=====================================

/**
 * create a canvas to show the image (tests)
 * and a fitting div for controls
 * attach to document.body
 * resize to document.documentElement.clientHeight
 * @method Life.createCanvas
 */
Life.createCanvasDiv = function() {
    Life.theCanvas = document.createElement("canvas");
    document.body.appendChild(Life.theCanvas);
    this.theCanvasContext = Life.theCanvas.getContext('2d');
    Life.theCanvas.style.backgroundColor = "blue";
    Life.theCanvas.style.position = "absolute";
    Life.theCanvas.style.top = "0px";
    Life.theCanvas.style.left = "0px";
    Life.theDiv = document.createElement("div");
    document.body.appendChild(Life.theDiv);
    Life.theDiv.style.position = "absolute";
    Life.theDiv.style.top = "0px";
    Life.theDiv.style.top = "0px";
    Life.theDiv.style.backgroundColor = "yellow";
    Life.theDiv.style.padding = "10px";

    function resize() {
        Life.canvasSize = document.documentElement.clientHeight;
        Life.theCanvas.width = Life.canvasSize;
        Life.theCanvas.height = Life.canvasSize;
        Life.theDiv.style.left = Life.canvasSize + "px";
        Life.theDiv.style.height = Life.canvasSize - 20 + "px";
        Life.theDiv.style.width = document.documentElement.clientWidth - Life.canvasSize - 20 + "px";
    }

    window.addEventListener("resize", resize, false);
    resize();
};

/**
 * add a button to the Life.theDiv
 * @method Life.addButton
 * @param {string} text
 * @return the button
 */
Life.addButton = function(text) {
    const button = document.createElement("button");
    Life.theDiv.appendChild(button);
    button.textContent = text;
    return button;
};

/**
 * show this image on the canvas, block pixels or interpolation, grey scale
 * @method Life#imageOnCanvas
 */
Life.prototype.imageOnCanvas = function() {
    // scaling from canvas to image
    const readImage = this.readImage;
    const canvasSize = Life.canvasSize;
    const scale = 1 / canvasSize; // coordinates from 0 to 1
    // the pixels
    const imageData = Life.theCanvasContext.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data;
    console.log(pixels);
    console.log(pixels.length);
    let pixelIndex = 0;
    for (var jCanvas = 0; jCanvas < canvasSize; jCanvas++) {
        const y = jCanvas * scale;
        for (var iCanvas = 0; iCanvas < canvasSize; iCanvas++) {
            const x = iCanvas * scale;
            readImage(x, y);
            pixels[pixelIndex] = this.red;
            pixels[pixelIndex + 1] = this.green;
            pixels[pixelIndex + 2] = this.blue;
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
        }
    }
    Life.theCanvasContext.putImageData(imageData, 0, 0);
};

//===========================================================================================
//

// setting parameters
//=============================================================
//
// for the cellular automaton: setup
//----------------------------------------------------
// setSize(size)
// setNStates(nStates)
// setWeights(weightCenter, weightNearest, weightSecondNearest)
// setIterationBoundaryPeriodic() - make that the boundary cells repeat cells periodically
// setIterationBoundaryZero() - the boundary cells have value zero, as those in newCells
// initialCellsAtCenter() - sets initialCells(), fills with zeros, except near the center, with values given by:
// setStartParameters(startCenter, startNearest, startSecondNearest)
//
// other methods for setting initial state of cells (defining the initialCells() method)
//...........................................................................
// all cells
// fillValue(value) - fills all cells with the same value
// fill(fun) - fill cells using a function(i,j), no symmetry
// fillSymmetrically(func) - fill with mirror and rotational symmetry using a function(i,j)
// fillSymmetricallyRandom - fill with mirror and rotational symmetry, random values
// border cells
// fillBorderValue(value) - fill the border cells with given value
// fillBorderSymmetrically(fun) - fill the border with mirror and rotational symmetry, values of a function(distance from corner)
// fillBorderSymmetricallyRandom() - fill border with mirror and rotational symmetry, random values
// fillBorderSymmetricallyNoMirror(fun) - fill the border with rotational symmetry only, values of a function(distance from corner)
// fillBorderSymmetricallyNoMirrorRandom() - fill the border with rotational symmetry only, random values
//
// setting up the transition table
//........................................
// resetTransitionTable() - called automatically upon changes to nStates, weights. Sets lenght of table. Clears the table.
// javascript: maximum safe integer is 2**53 - 1, an integer can encode 52 bits
// setTransitionTableWithCode() - set the transition table using a hex number string or an integer
// getCodeOfTransitionTable() - get transition table as a hex number string
// makeTransitionTableWith(fun) - make the ntable using values of a function of the index i
// randomTransitionTable() - random values
// setTransitionTableScale(scale) - stretching the saw tooth and tent transition table
// sawtoothTransitionTable() - make a transition table with saw tooth shape
// tentTransitionTable() - make a transition table with tent (triangle) shape
//
// for the image (8 bit image)
//..............................
// setImageFactor() - factor for shifting up the info in image before adding value of cells
// calculateMaxImageValue() - calculates maximum value in image, for scaling/adjusting contrast
// setReadImageMethod() - set the method for reading the image (transfer to canvas), image goes from 0...1, interpolation
//                 readImageGreyscaleNearestNeighbor  reads nearest neighbor 8 bits, giving a greyscale image
//                 readImageRGBNearestNeighbor  reads nearest neighbor 24 bits, giving an rgbimage
//                 readGreyscaleImageLinearInterpolation  interpolation,  8 bits, giving a greyscale image
//                 readRGBImageLinearInterpolation  interpolation, 24 bits, RGB image
//                 readImageGreyscaleCubicInterpolation  cubic interpolation, 8 bits greyscale
//                 readImageRGBCubicInterpolation  cubic interpolation, 8 bits greyscale
// makeImageHistogram() - calculates the histogram of image values, as a fraction of all image cells, for quality control
//  imageHistogramMax - the maximum value of the histogram, should not be too large

// running life
//==========================================
//
// for the cellular automation: initialization
//-------------------------------------------
// clearNewCells() - make all newCells=0
// clearImage() - all image cells=0
// initialCells() - (abstract) method for setting cells initially
//
// for the cellular automaton: iteration
//-----------------------------------------------
// makeNewGeneration() - updates the cells, new state goes to newCells
// cellsFromNewCells() - copy data of the new cells buffer to the cells
// iterateBoundaryCells() - updates the boundary
// updateImage() - update the image information (shift in info from cells)
// equalCells() - returns true if all cells have the same value (FAIL)

// bug hunting
//======================
//
// logTransitionTable()
// logImageHistogram()
// logImage()
// logCells()
// logNewCells()
//
// simple interaction elements
//----------------------------------
// Life.createCanvasDiv() - create a div with a canvas, (re)sizes to fill the height of the window
// Life.addButton(text) - create a button with given text, returns the button, set its onClick - method to do something
// imageOnCanvas() - draw this image on the canvas

//========================================================================================
// doing it
//==============================================================
