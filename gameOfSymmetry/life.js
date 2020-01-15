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
    // defaults, for tests
    this.nStates = 2;
    this.weightCenter = 1;
    this.weightNearest = 1;
    this.weightSecondNearest = 1;
    this.transitionTable = [];
    this.resetTransitionTable();
    this.imageHistogram = []; // of image values, for quality control
    this.imageHistogram.length = 256;
    this.imageHistogramMax = 0;

}


// convert integer 0..255 to hex string

function toHex(i) {
    let result = i.toString(16);
    if (result.length === 1) {
        result = "0" + result;
    }
    return result;
}

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
 * find maximum value of image
 * @method Life#maxImageValue
 * @return number - maximum
 */
Life.prototype.maxImageValue = function(a) {
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

/**
 * log the histogram
 * @method Life#logImageHistogram
 */
Life.prototype.logImageHistogram = function() {
    console.log("image histogram: max value " + this.imageHistogramMax);
    for (var chunk = 0; chunk < 256; chunk += 16) {
        let text = chunk + ": ";
        for (var i = 0; i < 16; i++) {
        	if (i%4===0){
        		text+="  ";
        	}
            text += " " + this.imageHistogram[i + chunk].toFixed(2);
        }
        console.log(text);
    }
};


/**
 * set the size of the problem, is the periodicity
 * has to be an odd number, will be odded
 * the arrays include the added border cells of the boundary condition
 * @method Life#setSize
 * @param {int} size - has to be an odd number
 * @return this - for chaining, just in case
 */
Life.prototype.setSize = function(size) {
    // size of world (period length or width without boundary cells)
    size = (size >> 1) << 1 | 1; // force size to be odd
    console.log(size);
    this.size = size;
    // size plus boundary cells
    this.arraySide = size + 2;
    this.cells = new Uint8Array(this.arraySide * this.arraySide);
    this.newCells = new Uint8Array(this.arraySide * this.arraySide);
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
 * update length of the transition table, clear the transition table
 * @method Life#resetTransitionTable
 */
Life.prototype.resetTransitionTable = function() {
    // cells have value 0, ..., nStates-1 !!!
    const maxSum = (this.nStates - 1) * (this.weightCenter + 4 * this.weightNearest + 4 * this.weightSecondNearest);
    this.transitionTable.length = maxSum + 1;
    this.transitionTable.fill(0);
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
 * create the transition table using a function
 * @method Life#makeTransitionTableWith
 * @param {function} fun - return value for index
 */
Life.prototype.makeTransitionTableWith = function(fun) {
    const length = this.transitionTable.length;
    for (var i = 0; i < length; i++) {
        this.transitionTable[i] = fun(i);
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
 * @method Life#setImageFactor
 * @param {int} factor
 */
Life.prototype.setImageFactor = function(factor) {
    this.imageFactor = factor;
    this.clearImage();
};

/**
 * set the weights
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
 * @param {int} startCenter
 * @param {int} startNearest
 * @param {int} startSecondNearest
 */
Life.prototype.setStartParameters = function(startCenter, startNearest, startSecondNearest) {
    this.startCenter = startCenter;
    this.startNearest = startNearest;
    this.startSecondNearest = startSecondNearest;
};

/**
 * set the start cells
 * @method Life#setStartCells
 */
Life.prototype.setStartCells = function() {
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

// array routines for initialization, boundary conditions and what not
/**
 * fill the cells with numbers that are functions of the indices, module 256
 * @method Life#fill
 * @param {function} fun - of indices i,j
 */
Life.prototype.fill = function(fun) {
    const arraySide = this.arraySide;
    let index = 0;
    for (var j = 0; j < arraySide; j++) {
        for (var i = 0; i < arraySide; i++) {
            this.cells[index] = fun(i, j, arraySide) & 255;
            index += 1;
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
 * fill cells with some number
 * not very usefull, rather a note to self
 * @method Life#fillValue
 * @param {number} value
 */
Life.prototype.fillValue = function(value) {
    this.cells.fill(value);
};

/**
 * fill border cells, leave rest unchanged
 * @method Life#fillBorder
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
 * fill border cells, periodic boundary condition
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
 * this.cells has correct boundary condition
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

    // going through all cells that belpong to the image, omit border cells
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
 * copy new generation to old 
 * @method Life#copyNewCells
 */
Life.prototype.copyNewCells = function() {
    this.cells.set(this.newCells);
};

/**
* create a canvas to show the image (tests)
* attach to document.body
* resize to document.documentElement.clientHeight
* @method Life.createCanvas
*/
Life.prototype.createCanvas=function(){
this.theCanvas = document.createElement("canvas");
       document.body.appendChild(this.theCanvas);
this. theCanvasContext=this.theCanvas.getContext('2d');
this.theCanvas.style.backgroundColor="blue";
this.theCanvas.style.position="absolute";
this.theCanvas.style.top="0px";
this.theCanvas.style.left="0px";

};

/* drawing
imageData = theCanvasContext.getImageData(0, 0, size, size)
theCanvasContext.putImageData(imageData,0, 0)
pixels=imageData.data     as Uint8Array


    // resizing maxheight to fit window
    const popup = this;

    function autoResize() {
        popup.resize();
    }

    window.addEventListener("resize", autoResize, false);
    // destroying the event listener
    this.destroyResizeEvent = function() {
        window.removeEventListener("resize", autoResize, false);
    };

    resize: canvasSize _> theCanvas.width/height=size   (not style)
*/
