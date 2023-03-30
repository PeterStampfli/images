/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    ColorInput,
    output
} from "../libgui/modules.js";

const automaton = {};

automaton.stepsToDo=10;

let width = 100;
let height = 100;
let total = width * height;
var pixelsArray;
const color = {};
color.alpha = 255;

function randomColor() {
    color.red = Math.floor(255.9 * Math.random());
    color.blue = Math.floor(255.9 * Math.random());
    color.green = Math.floor(255.9 * Math.random());
    return Pixels.integerOfColor(color);
}

function create() {
    output.isDrawing = true;
    output.pixels.update();
    pixelsArray = output.pixels.array;
    width = output.canvas.width;
    height = output.canvas.height;
    total = width * height;
}

function reset() {
    for (let i = 0; i < total; i++) {
        pixelsArray[i] = randomColor();
    }

}

// random rectangle
function randomRect() {
    var h;
    let xLow = Math.floor(width * Math.random());
    let xHigh = Math.floor(width * Math.random());
    if (xLow > xHigh) {
        h = xLow;
        xLow = xHigh;
        xHigh = h;

    }
    let yLow = Math.floor(height * Math.random());
    let yHigh = Math.floor(height * Math.random());
    if (yLow > yHigh) {
        h = yLow;
        yLow = yHigh;
        yHigh = h;
    }
    const xc = Math.floor((xLow + xHigh)/2);
    const yc = Math.floor((yLow + yHigh)/2);
    for (let y = yLow; y < yc; y++) {
        for (let x = xLow; x < xc; x++) {
            const c = pixelsArray[x + y * width];
pixelsArray[2*xc-x + y * width]=c;
pixelsArray[2*xc-x + (2*yc-y) * width]=c;
pixelsArray[x + (2*yc-y) * width]=c;

        }
    }
}

function step(){
    randomRect();
}

function draw() {

    output.pixels.show();
}



function setup() {
    const gui = new ParamGui({
        name: '',
        closed: false
    });
    // create an output canvas
    output.createCanvas(gui);
    output.createPixels();
    output.drawCanvasChanged = function() {
        create();
        reset();
        draw();
    };


    gui.add({
        type: 'button',
        buttonText: 'reset',
        onChange: function() {
            reset();
            draw();
        }
    }).add({
        type: 'button',
        buttonText: 'step',
        onChange: function() {
            step();
            draw();
        }
    }).add({
        type: "number",
        params: automaton,
        property: "stepsToDo",
        labelText: 'steps',
    }).add({
        type: 'button',
        buttonText: 'run',
        onChange: function() {
            for (let i = 0; i < automaton.stepsToDo; i++) {
step();
            }
            draw();
        }
    });


    create();
    reset();
    draw();
}

setup();