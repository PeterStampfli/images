/**
 * the automaton that makes the generations (life)
 * we might need several of them
 */

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
-- restricted to 0...255 (8 bits)
-- shifting (multiplication) and adding: image = imageFactor * image + newCell
-- typically, imageFactor=nStates

*/

/*
set parameters directly using paramGui
other methods for testing
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
    // this.iteratedBoundaryCells: a function for setting the boundary cells at each iteration.
    // default: does nothing, value of boundary cells will be zero
    this.setIterationBoundaryZero();
    // set the method for reading the image
    this.setReadImageMethod(this.readImageNearestNeighbor);
}

// setting parameters
//=============================================================

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
    this.image = new Uint8Array(size * size);
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
Life.prototype.initialCellsAtCenter=function(){
 this.initialCells = function() {
        this.fill(0);
        this.setCenterCells();
    };
};

/**
 * set boundary condition for iteration - periodic
 * default is not periodic
 * @method Life.setIterationBoundaryPeriodic
 * @param {integer} value
 */
Life.prototype.setIterationBoundaryPeriodic = function(value) {
    this.iteratedBoundaryCells = function() {
        this.fillBorderPeriodic();
    };
};

/**
 * set boundary condition for iteration - zero value
 * @method Life.setIterationBoundaryZero
 */
Life.prototype.setIterationBoundaryZero = function() {
    this.iteratedBoundaryCells = function() {};
};

/**
* set the read image method to one of the three above
* readImageNearestNeighbor, readImageLinearInterpolation or readImageCubicInterpolation
* @method Life#setReadImageMethod
* @param {function} reader - a read image method
*/
Life.prototype.setReadImageMethod=function(reader){
 this.readImage=reader;
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
        let line = toHex(j) + ": ";
        for (var i = 0; i < limit; i++) {
            if ((i % 5 === 0) && (i > 0)) {
                line += " |";
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
    const length = this.transitionTable.length;
    console.log("number of states " + this.nStates);
    console.log("transitionTable: length " + length);
    for (var i = 0; i < length; i++) {
        console.log(toHex(i) + ": " + toHex(this.transitionTable[i]));
    }
};

/**
 * @method Life#logCells
 */
Life.prototype.logCells = function(message = " ") {
    console.log();
    console.log(message);
    console.log("cells");
    Life.logArray(this.cells);
};

/**
 * @method Life#logNewCells
 */
Life.prototype.logNewCells = function(message = " ") {
    console.log();
    console.log(message);
    console.log("newCells");
    Life.logArray(this.newCells);
};

/**
 * @method Life#logImage
 */
Life.prototype.logImage = function(message = " ") {
    console.log();
    console.log(message);
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
 * set the transition table from a hexadecimal number string
 * decoding to numbers of base nStates with transitionTable.length number of digits
 * @method Life#decodeTransitionTable
 * @param {int|string} code - integer or a hexadecimal number string
 */
Life.prototype.decodeTransitionTable = function(code) {
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
 * @method Life.encodeTransitionTable
 * @return hexadecimal number string
 */
Life.prototype.encodeTransitionTable = function() {
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
 * make a saw tooth transition table, depending on number of states
 * @method Life#makeSawToothTransitionTable
 */
Life.prototype.makeSawToothTransitionTable = function() {
    const nStates = this.nStates;
    this.makeTransitionTableWith(function(i) {
        return i % nStates;
    });
};

/**
 * make a tent transition table, depending on number of states
 * @method Life#makeTentTransitionTable
 */
Life.prototype.makeTentTransitionTable = function() {
    const nStates = this.nStates;
    const period = 2 * (nStates - 1);
    this.makeTransitionTableWith(function(i) {
        let result = i % period;
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
    value=value % this.nStates;
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
 * fill border cells, leave rest unchanged, need to do only initially
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
 * fill border cells with random values symmetrically with a function depending on distance from corner
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
    this.fillBorderSymmetrically(function(){
        return randomInt(nStates);
    });
};

/**
 * fill border cells with random values symmetrically, without mirror symmetry
 * @method Life#fillBorderSymmetricallyRandomNoMirror
 */
Life.prototype.fillBorderSymmetricallyRandomNoMirror = function() {
    const arraySide = this.arraySide;
    const center = this.centerX;
    const center2 = 2 * this.centerX;
    const cells = this.cells;
    const nStates = this.nStates;
    const arraySize = this.cells.length;
    for (var i = 0; i < arraySide; i++) {
        let value = randomInt(nStates);
        this.cells[i] = value;
        this.cells[(arraySide - i - 1) * arraySide] = value;
        this.cells[i * arraySide + arraySide - 1] = value;
        this.cells[arraySize - 1 - i] = value;
    }
};

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
            image[imageIndex] = imageFactor * image[imageIndex] + newState;
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
 * @return true if some cells are not zero
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


/**
 * find maximum value of image
 * needed for drawing a normalized image on canvas with max contrast
 * @method Life#calculateMaxImageValue
 * @return number - maximum
 */
Life.prototype.calculateMaxImageValue = function(a) {
    return this.image.reduce((result, element) => Math.max(result, element), -100000);
};

/**
 * calculate the image histogram, normalized by size
 * and calculate max
 * @method Life#makeImageHistogram
 */
Life.prototype.makeImageHistogram = function() {
    const imageHistogram = this.imageHistogram;
    imageHistogram.fill(0);
    this.image.forEach(value => imageHistogram[value] += 1);
    const factor = 1 / this.image.length;
    imageHistogram.forEach((element, i) => imageHistogram[i] = factor * element);
    this.imageHistogramMax = imageHistogram.reduce((result, element) => Math.max(result, element));
};

// reading out the image
//=====================================

/**
 * reading the image using nearest neighbor interpolation
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space
 * coordinates clamped to image
 * @method Life.readImageNearestNeighbor
 * @param {float} x
 * @param {float} y
 * @return integer, between 0 and 255, image value
 */
Life.prototype.readImageNearestNeighbor = function(x, y) {
    const size = this.size;
    x = Math.max(0, Math.min(size - 1, Math.floor(size * x))); // x=0...1/size goes to first column with index 0
    y = Math.max(0, Math.min(size - 1, Math.floor(size * y))); // similarly for y
    return this.image[x + y * size];
};

/**
 * reading the image using linear interpolation
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space (1/size)
 * coordinates clamped to image (approximating image cells outside by the next one inside)
 * a point between 0.5/size and 1.5/size interpolates between image[0] and image[1]
 * @method Life.readImageLinearInterpolation
 * @param {float} x
 * @param {float} y
 * @return integer, between 0 and 255, image value
 */
Life.prototype.readImageLinearInterpolation = function(x, y) {
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
    return result;
};

/*
the interpolation kernel: linear interpolation is much slower, the arrow function form is slightly slower
it is normalized to 1 within an error of about 1.00001 ! (good enough)
*/
function kernel(x) { // Mitchell-Netrovali, B=C=0.333333, 0<x<2
    if (x < 1) {
        return (1.16666 * x - 2) * x * x + 0.888888;
    }
    return ((2 - 0.388888 * x) * x - 3.33333) * x + 1.777777;
}

/**
 * reading the image using cubic interpolation
 * in reduced coordinates, going from 0 to 1
 * each image cell takes the same space
 * a point between 1.5/size and 2.5/size interpolates using image[0] to image[3]
 * coordinates clamped to image (approximating image cells outside by the next one inside)
 * @method Life.readImageCubicInterpolation
 * @param {float} x
 * @param {float} y
 * @return integer, between 0 and 255, image value
 */
Life.prototype.readImageCubicInterpolation = function(x, y) {
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
      return result;
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
 * show this image on the canvas, block-pixels
 * @method Life#imageOnCanvas
 */
Life.prototype.imageOnCanvas = function() {
    // scaling from canvas to image
    const image = this.image;
    const imageSize = this.size;
    const canvasSize = Life.canvasSize;
    const scale = imageSize / canvasSize;
    // scaling the image value, & floor
    const maxImageValue = this.calculateMaxImageValue();
    console.log(maxImageValue);
    const pixelFactor = 255.9 / maxImageValue;
    // the pixels
    const imageData = Life.theCanvasContext.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data;
    console.log(pixels);
    console.log(pixels.length);
    let pixelIndex = 0;
    for (var jCanvas = 0; jCanvas < canvasSize; jCanvas++) {
        const jImage = Math.floor(jCanvas * scale);
        const jImageSize = jImage * imageSize;
        for (var iCanvas = 0; iCanvas < canvasSize; iCanvas++) {
            const iImage = Math.floor(iCanvas * scale);
            const imageValue = Math.floor(pixelFactor * image[iImage + jImageSize]);
            pixels[pixelIndex] = imageValue;
            pixels[pixelIndex + 1] = imageValue;
            pixels[pixelIndex + 2] = imageValue;
            pixels[pixelIndex + 3] = 255;
            pixelIndex += 4;
        }
    }
    Life.theCanvasContext.putImageData(imageData, 0, 0);
};