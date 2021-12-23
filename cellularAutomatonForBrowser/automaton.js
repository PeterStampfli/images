/* jshint esversion: 6 */

import {
    output,
    Pixels
} from "../libgui/modules.js";

import {
    main
} from './main.js';

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
    extend(sums, size2);
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

//=======================================
// the basic cellular automaton

const prevCells = []; // reversible
const cells = [];
const sums = [];
const transitionTable = [];
var weights = [10];
var nStates = 10;
var size = 11; // including border
const colors = []; // integer colors



// drawing: canvas might have been resized
automaton.draw = function() {
    output.startDrawing();
    output.canvasContext.fillStyle = '#8899ff';
    output.canvasContext.fillRect(0, 0, output.canvas.width, output.canvas.height);

    colorTest();
};

automaton.step = function() {
    console.log('automaton steps');
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

const transitionTableGenerators = [sawTooth, triangle];

const colorGenerators = [greys, randomBlue, randomRedGreen, redYellowWhite, bordeaux];

// reset, and a new random setup
automaton.reset = function() {
    size = Math.floor(randomChoice(sizes) / 2) * 2 + 1;
    nStates = randomChoice(nStatesOptions);
    size = 9;
    const initialConfig = randomChoice(configs);
    initialConfig[0] = randomChoice(centerCells);
    console.log(initialConfig);
    initialState(initialConfig);
    setBoundary(randomChoice(initialBorders), 0);
    logArray(cells);
    weights = randomChoice(configs);
    weights[0] = randomChoice(centerCells);
    const transitionTableGenerator = randomChoice(transitionTableGenerators);
    transitionTableGenerator();
    const colorGenerator = randomChoice(colorGenerators);
    colorGenerator();
};

automaton.setup = function() {
    logger = main.gui.addLogger();

};