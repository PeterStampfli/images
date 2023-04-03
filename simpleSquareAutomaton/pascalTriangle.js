/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    ColorInput,
    output
} from "../libgui/modules.js";

const automaton = {};

let width = 100;
let height = 100;
let total = width * height;
const states = [];
automaton.nStates = 2;

const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});

const white = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});

function create() {
    width = output.canvas.width;
    height = output.canvas.height;
    total = width * height;
    states.length = total;
}

// hexagon lattice, advance line
function advance() {
    states.fill(0);
    states[Math.floor(width / 2)] = 1;
    const rows = Math.min(height - 1, width - 2);
    const widthM = width - 1;
    const nStates = automaton.nStates;
    for (let row = 1; row <= rows; row++) {
        let index = row * width + 2;
        const offset = (row % 2 === 0) ? width + 1 : width - 1;
        for (let i = 2; i < widthM; i++) {
            let sum = states[index - width] + states[index - offset];
            states[index] = sum % nStates;
            index += 1;
        }
    }
}

function draw() {
    output.isDrawing = true;
    output.pixels.update();
    const pixelsArray = output.pixels.array;

    for (let index = 0; index < total; index++) {
        if (states[index] === 0) {
            pixelsArray[index] = white;
        } else {
            pixelsArray[index] = black;
        }
    }
    output.pixels.show();
}

function setup() {
    const gui = new ParamGui({
        name: 'automaton',
        closed: false
    });
    // create an output canvas
    output.createCanvas(gui);
    output.createPixels();
    output.drawCanvasChanged = function() {
        create();
        advance();
        draw();
    };

    const nStatesController = gui.add({
        type: 'number',
        params: automaton,
        property: 'nStates',
        min: 2,
        step: 1,
        onChange: function() {
            advance();
            draw();
        }
    });

    create();
    advance();
    draw();
}

setup();