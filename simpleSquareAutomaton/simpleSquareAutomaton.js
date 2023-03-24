/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    ColorInput,
    output
} from "../libgui/modules.js";

const automaton = {};

let size = 100;
const prevStates = [];
const states = [];
const nextStates = [];
automaton.nStates = 2;
const maxNStates = 6;
// least common multiplicator
const bigNumber = 60;

automaton.prevWeight = 0;
automaton.centerWeight = 1;
automaton.neighborWeight = 1;
automaton.neighbor2Weight = 0;

automaton.stepsToDo=10;
automaton.timer=0;
automaton.timerValue=0;

const colors = [];
colors.length = 6;
colors[0] = '#ffffff';
colors[1] = '#000000';
colors[2] = '#6666ff';
colors[3] = '#aa0000';
colors[4] = '#88ffff';
colors[5] = '#ffff88';

function create() {
    size = output.canvas.width;
    const size2 = size * size;
    prevStates.length = size2;
    states.length = size2;
    nextStates.length = size2;
}

function reset(){
    automaton.time=0;
    automaton.timer.setValueOnly(0);
        prevStates.fill(0);
    states.fill(0);
    nextStates.fill(0);
    const half = Math.floor(size / 2);
    states[half + half * size] = 1;
}

function advance() {
   automaton.time += 1;
    automaton.timer.setValueOnly(automaton.time);
        const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const sizeM = size - 1;
    const sizeP = size + 1;
    for (var j = 1; j < sizeM; j++) {
        let index = j * size+1;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size]);
            sum += neighbor2Weight * (states[index - sizeM] + states[index - sizeP] + states[index + sizeM] + states[index + sizeP]);
            nextStates[index]=sum%bigNumber;
            index += 1;
        }
    }
    const sizeMsize=size*sizeM;
    for (var index=size;index<sizeMsize;index++){
        prevStates[index]=states[index];
        states[index]=nextStates[index];
    }
}

function draw() {
    output.isDrawing = true;
    output.pixels.update();
    const pixelsArray = output.pixels.array;
    const width = output.canvas.width;
    const height = output.canvas.height;
    const intColors = [];
    intColors.length = colors.length;
    const colorObj = {};
    for (let i = 0; i < colors.length; i++) {
        ColorInput.setObject(colorObj, colors[i]);
        intColors[i] = Pixels.integerOfColor(colorObj);
    }
    const nStates = automaton.nStates;
    let size2 = size * size;
    for (let index = 0; index < size2; index++) {
        pixelsArray[index] = intColors[states[index] % nStates];
    }
    output.pixels.show();
}

function all() {
    create();
    reset();
    draw();
}

function setup() {
    const gui = new ParamGui({
        name: 'automaton',
        closed: false
    });
    // create an output canvas
    output.createCanvas(gui);
    output.createPixels();
    output.setCanvasWidthToHeight(1);
    output.drawCanvasChanged = all;

const nStatesController = gui.add({
        type: 'number',
        params: automaton,
        property: 'nStates',
        min: 2,
        step: 1,
        max:6,
        onChange: function() {
            draw();
        }
    });

    gui.add({
        type: 'number',
        params: automaton,
        property: 'prevWeight',
        labelText: 'weights prev',
        step: 1,
        min: 0,
        onChange: function() {
            reset();
            draw();
        }
    }).add({
        type: 'number',
        params: automaton,
        property: 'centerWeight',
        labelText: 'center',
        step: 1,
        min: 0,
        onChange: function() {
            reset();
            draw();
        }
    });
    gui.add({
        type: 'number',
        params: automaton,
        property: 'neighborWeight',
        labelText: '1st neighbor',
        step: 1,
        min: 0,
        onChange: function() {
            reset();
            draw();
        }
    }).add({
        type: 'number',
        params: automaton,
        property: 'neighbor2Weight',
        labelText: '2nd',
        step: 1,
        min: 0,
        onChange: function() {
            reset();
            draw();
        }
    });
    

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
            advance();
            draw();
        }
    }).add({
        type: "number",
        params: automaton,
        property: "stepsToDo",
        labelText: 'steps',
        onChange: function() {
            console.log(automaton.stepsToDo);
        }
    }).add({
        type: 'button',
        buttonText: 'run',
        onChange: function() {
            console.log(automaton.stepsToDo);
            for (let i = 0; i < automaton.stepsToDo; i++) {
                advance();
            }
            draw();
        }
    });

    automaton.timer = gui.add({
        type: "number",
        params: automaton,
        property: "timerValue",
        labelText: 'time',
        onChange: function() {
            automaton.timer.setValueOnly(automaton.time);
        }
    });

    gui.addParagraph("colors for states");
    for (let i = 0; i < colors.length; i++) {
        gui.add({
            type: 'color',
            params: colors,
            property: i,
            onChange: draw
        });
    }
    
    all();

}

setup();