/* jshint esversion: 6 */

import {
    output,
    Pixels
} from "../libgui/modules.js";

import {
    main
} from './mainCA.js';

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

//=======================================
// color tables as integer colors
const color = {};
color.alpha = 255;

function greys() {
    extend(colors, nStates);
    for (let i = 0; i < nStates; i++) {
        const grey = Math.floor(i / (nStates - 1) * 255.9);
        color.red = grey;
        color.blue = grey;
        color.green = grey;
        colors[i] = Pixels.integerOfColor(color);
    }
}

function redYellowWhite() {
    extend(colors, nStates);
    const first = Math.floor(nStates * 0.33);
    const second = Math.floor(nStates * 0.66);
    for (let i = 0; i < nStates; i++) {
        if (i < first) {
            color.red = Math.floor(i / first * 255.9);
            color.blue = 0;
            color.green = 0;
        } else if (i < second) {
            color.red = 255;
            color.green = Math.floor((i - first + 1) / (second - first + 1) * 255.9);
            color.blue = 0;
        } else {
            color.red = 255;
            color.green = 255;
            color.blue = Math.floor((i - second + 1) / (nStates - second + 1) * 255.9);
        }
        colors[i] = Pixels.integerOfColor(color);
    }
}

function randomBlue() {
    extend(colors, nStates);
    for (let i = 0; i < nStates; i++) {
        const grey = Math.floor(i / (nStates - 1) * 255.9);
        color.red = Math.floor(Math.random() * 255.9);
        color.green = 255 - color.red;
        color.blue = grey;
        colors[i] = Pixels.integerOfColor(color);
    }
}

function randomRedGreen() {
    extend(colors, nStates);
    for (let i = 0; i < nStates; i++) {
        const grey = Math.floor(i / (nStates - 1) * 255.9);
        color.red = grey;
        color.green = 255 - color.red;
        color.blue = Math.floor(Math.random() * 255.9);
        colors[i] = Pixels.integerOfColor(color);
    }
}

function bordeaux() {
    extend(colors, nStates);
    for (let i = 0; i < nStates; i++) {
        const grey = Math.floor(i / (nStates - 1) * 255.9);
        color.red = Math.min(255, 510 - 2 * grey);
        color.green = Math.max(0, 255 - 2 * grey);
        color.blue = Math.max(0, Math.floor(255 - grey * grey / 100));
        colors[i] = Pixels.integerOfColor(color);
    }
}

function colorTest() {
    output.startDrawing();
    output.pixels.update();
    const pixels = output.pixels;
    const width = output.canvas.width;
    const height = output.canvas.height;
    const blockSize = Math.floor(width / 10) + 1;
    let index = 0;
    for (var j = 0; j < height; j++) {
        const colorIndexBase = Math.floor(j / blockSize) * Math.floor(width / blockSize);
        for (var i = 0; i < width; i++) {
            const colorIndex = (colorIndexBase + Math.floor(i / blockSize)) % nStates;
            pixels.array[index] = colors[colorIndex];
            index += 1;
        }
    }
    output.pixels.show();
}

//========================================
// transition tables

function sumOf(numbers) {
    const length = numbers.length;
    let sum = 0;
    for (let i = 0; i < length; i++) {
        sum += numbers[i];
    }
    return sum;
}

function sawTooth() {
    const maxSum = nStates * (4 * sumOf(weights) - 3 * weights[0]);
    extend(transitionTable, maxSum + 1);
    for (let i = 0; i <= maxSum; i++) {
        transitionTable[i] = i % nStates;
    }
}

function triangle() {
    const maxSum = nStates * (4 * sumOf(weights) - 3 * weights[0]);
    extend(transitionTable, maxSum + 1);
    const period = 2 * nStates - 2;
    for (let i = 0; i <= maxSum; i++) {
        let value = i % period;
        if (value >= nStates) {
            value = period - value;
        }
        transitionTable[i] = value;
    }
}

//=================================================
// initial state
// size arrays: prevCells, cells, sums
// size includes the double border
// clear cells, set center and prevCenter, no boundary
function initialState(config) {
    const size2 = size * size;
    extend(cells, size2);
    cells.fill(0);
    extend(prevCells, size2);
    prevCells.fill(0);
    extend(sums, size2);
    sums.fill(0);
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
    prevCells[center] = 1;
}

//=========================================
// boundary
function setBoundary(outer = 0, inner = 0) {
    // doing the inner boundary
    let end = 2 * size - 2;
    for (let index = size + 1; index <= end; index++) {
        cells[index] = inner;
    }
    end = size * size - size - 2;
    for (let index = size * size - 2 * size + 1; index <= end; index++) {
        cells[index] = inner;
    }
    end = size * size - 2 * size + 1;
    for (let index = 1 + size; index <= end; index += size) {
        cells[index] = inner;
    }
    end = size * size - size - 2;
    for (let index = 2 * size - 2; index <= end; index += size) {
        cells[index] = inner;
    }
    // outer boundary
    end = size - 1;
    for (let index = 0; index <= end; index++) {
        cells[index] = outer;
    }
    end = size * size - 1;
    for (let index = end - size + 1; index <= end; index++) {
        cells[index] = outer;
    }
    end = size * size - size;
    for (let index = 0; index <= end; index += size) {
        cells[index] = outer;
    }
    end = size * size - 1;
    for (let index = size - 1; index <= end; index += size) {
        cells[index] = outer;
    }
}

function periodicBoundary() {
    const shift = size - 4;
    const shiftSize = shift * size;
    /*up and down*/
    /*first row*/
    let end = size - 3;
    for (let index = 2; index <= end; index++) {
        cells[index] = cells[index + shiftSize];
    }
    /*second row*/
    end = 2 * size - 3;
    for (let index = size + 2; index <= end; index++) {
        cells[index] = cells[index + shiftSize];
    }
    /*before last row*/
    end = size * size - size - 3;
    for (let index = size * size - 2 * size + 2; index <= end; index++) {
        cells[index] = cells[index - shiftSize];
    }
    /*last row*/
    end = size * size - 3;
    for (let index = end - size + 2; index <= end; index++) {
        cells[index] = cells[index - shiftSize];
    }
    /*first column*/
    end = size * size - size;
    for (let index = 0; index <= end; index += size) {
        cells[index] = cells[index + shift];
    }
    /*second column*/
    end = size * size - size + 1;
    for (let index = 1; index <= end; index += size) {
        cells[index] = cells[index + shift];
    }
    /*before last column*/
    end = size * size - 2;
    for (let index = size - 2; index <= end; index += size) {
        cells[index] = cells[index - shift];
    }
    /*last column*/
    end = size * size - 1;
    for (let index = size - 1; index <= end; index += size) {
        cells[index] = cells[index - shift];
    }
}
//===========================================
// sum using given weights

function makeSum() {
    const w0 = weights[0];
    const w1 = weights[1];
    const w2 = weights[2];
    const w3 = weights[3];
    const w4 = weights[4];
    const w5 = weights[5];
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const center = i + jSize;
            let sum = w0 * cells[center];
            if (w1 > 0) {
                sum += w1 * (cells[center + 1] + cells[center - 1] + cells[center + size] + cells[center - size]);
            }
            if (w2 > 0) {
                sum += w2 * (cells[center + 1 + size] + cells[center + 1 - size] + cells[center - 1 + size] + cells[center - 1 - size]);
            }
            if (w3 > 0) {
                sum += w3 * (cells[center + 2] + cells[center - 2] + cells[center + 2 * size] + cells[center - 2 * size]);
            }
            if (w4 > 0) {
                sum += w4 * (cells[center + 2 * size - 1] + cells[center - 2 * size + 1] + cells[center + 2 + size] + cells[center - 2 - size]);
            }
            if (w5 > 0) {
                sum += w5 * (cells[center + 2 * size + 1] + cells[center - 2 * size - 1] + cells[center + 2 - size] + cells[center - 2 + size]);
            }
            sums[center] = sum;
        }
    }
}

//============================================
// making the transitions

function irreversibleTransition() {
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            cells[index] = table[sums[index]];
        }
    }
}

function reversibleTransition() {
    const sizeM2 = size - 2;
    for (let j = 2; j < sizeM2; j++) {
        const jSize = j * size;
        for (let i = 2; i < sizeM2; i++) {
            const index = i + jSize;
            const rememberState = cells[index];
            cells[index] = (prevCells[index] + table[sums[index]]) % nStates;
            prevCells[index] = rememberState;
        }
    }
}

//===========================================
// making the image

function nearestImage() {
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
            pixels.array[imageIndex] = colors[cells[jCellSize + iCell]];
            imageIndex += 1;
        }
    }
    output.pixels.show();
}

function linearImage() {
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
            let sum = dyPlus * (dxPlus * cells[jCellSize + iCell] + dx * cells[jCellSize + iCellPlus]);
            sum += dy * (dxPlus * cells[jPlusCellSize + iCell] + dx * cells[jPlusCellSize + iCellPlus]);
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

function cubicImage() {
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
            let sum = kx * (kym * cells[cellIndexM - 1] + ky * cells[cellIndex - 1] + ky1 * cells[cellIndex1 - 1] + ky2 * cells[cellIndex2 - 1]);
            kx = kernel(dx);
            sum += kx * (kym * cells[cellIndexM] + ky * cells[cellIndex] + ky1 * cells[cellIndex1] + ky2 * cells[cellIndex2]);
            kx = kernel(1 - dx);
            sum += kx * (kym * cells[cellIndexM + 1] + ky * cells[cellIndex + 1] + ky1 * cells[cellIndex1 + 1] + ky2 * cells[cellIndex2 + 1]);
            kx = kernel(2 - dx);
            sum += kx * (kym * cells[cellIndexM + 2] + ky * cells[cellIndex + 2] + ky1 * cells[cellIndex1 + 2] + ky2 * cells[cellIndex2 + 2]);
            pixels.array[imageIndex] = colors[Math.round(sum)];
            imageIndex += 1;
        }
    }
    output.pixels.show();
}

//=======================================
// the basic cellular automaton

const prevCells = []; // reversible
const cells = [];
const sums = [];
const transitionTable = [];
var weights = [10];
var nStates = 10;
var size = 11; // including border
var boundary = -1; // periodic
const colors = []; // integer colors
var imager = linearImage;
var transition = irreversibleTransition;

// drawing: canvas might have been resized
automaton.draw = function() {
    output.startDrawing();
    periodicBoundary();
    imager();
};

automaton.step = function() {
    console.log('automaton steps');
    console.log(boundary);
    if (boundary > 0) {
        console.log('set ' + boundary);
        setBoundary(boundary);
    }
    transition();
};

const sizes = [15, 20, 30, 40, 80];

//      5 3 4
//    4 2 1 2 5
//    3 1 0 1 3
//    5 2 1 2 4
//      4 3 5

const configs = [];
configs.push([1, 1, 0, 0, 0, 0]);
configs.push([1, 1, 1, 0, 0, 0]);
configs.push([1, 1, 1, 1, 0, 0]);
configs.push([1, 1, 1, 0, 1, 0]);
configs.push([1, 1, 1, 1, 1, 0]);
configs.push([1, 1, 1, 0, 0, 1]);
configs.push([1, 1, 1, 1, 0, 1]);
configs.push([1, 1, 1, 1, 1, 1]);

const centerCells = [0, 1, 1, 1, 2];

const initialBorders = [0, 0, 0, 1, 1, 2];

const boundaries = [-1, -1, 0, 0, 1]; // < 0 is periodic

const nStatesOptions = [4, 8, 12, 20, 40];

const sawToothProbability = 0.6;

const reversibleProbability = 0.5;

const imagers = [1, 2, 2, 3, 3, 3]; // nearest, linear, cubic

const colorGenerators = [1, 2, 3, 4, 5]; //greys, randomBlue, randomRedGreen, redYellowWhite, bordeaux

// reset, and a new random setup
automaton.reset = function() {
    logger.clear();
    size = Math.floor(randomChoice(sizes) / 2) * 2 + 1;
    nStates = randomChoice(nStatesOptions);
    nStates = 3;
    size = 9;
    logger.log(nStates + ' states, ' + (size - 4) * (size - 4) + ' cells');
    // initial configuration of cells including boundary
    const initialConfig = randomChoice(configs);
    initialConfig[0] = randomChoice(centerCells);
    logger.log('initial configuration ' + initialConfig);
    initialState(initialConfig);
    const initialBorder = randomChoice(initialBorders);
    logger.log('initial border ' + initialBorder);
    setBoundary(initialBorder, 0);
    // making the sum, set border
    weights = randomChoice(configs);
    weights[0] = randomChoice(centerCells);
    logger.log('weights ' + weights);
    boundary = randomChoice(boundaries);
    if (boundary < 0) {
        logger.log('periodic boundary');
    } else {
        logger.log('boundary: outer ' + boundary + ' (inner=0)');
    }
    // transition
    if (Math.random() < sawToothProbability) {
        logger.log('sawtooth table');
        sawTooth();
    } else {
        logger.log('triangle table');
        triangle();
    }
    if (Math.random() < reversibleProbability) {
        logger.log('reversible');
        transition = irreversibleTransition;
    } else {
        logger.log('irreversible');
        transition = reversibleTransition;
    }
    // imaging
    switch (randomChoice(colorGenerators)) {
        case 1:
            greys();
            logger.log('Colors: greys');
            break;
        case 2:
            randomBlue();
            logger.log('Colors: random blue');
            break;
        case 3:
            randomRedGreen();
            logger.log('Colors: randomRedGreen');
            break;
        case 4:
            redYellowWhite();
            logger.log('Colors: redYellowWhite');
            break;
        case 5:
            bordeaux();
            logger.log('Colors: bordeaux');
            break;
    }
    switch (randomChoice(imagers)) {
        case 1:
            imager = nearestImage;
            logger.log('image: blockpixels');
            break;
        case 2:
            imager = linearImage;
            logger.log('image: linear interpolation');
            break;
        case 3:
            imager = cubicImage;
            logger.log('image: cubic interpolation');
            break;
    }
};

automaton.setup = function() {
    logger = main.gui.addLogger();
};