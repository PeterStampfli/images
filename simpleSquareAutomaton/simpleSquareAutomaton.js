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
const bigNumber = 2520;

automaton.offset = 0;
automaton.prevWeight = 0;
automaton.centerWeight = 1;
automaton.neighborWeight = 1;
automaton.neighbor2Weight = 0;

automaton.stepsToDo = 10;
automaton.timer = 0;
automaton.timerValue = 0;

const colors = [];
const colorControllers = [];
colors.length = 9;
colors[0] = '#bbbbff';
colors[1] = '#000000';
colors[2] = '#6666ff';
colors[3] = '#aa0000';
colors[4] = '#88ffff';
colors[5] = '#ffff88';
colors[6] = '#ff00ff';
colors[7] = '#ff8844';
colors[8] = '#ff00ff';

colors.zeroWhiteElseBlack = function() {
    for (let i = 1; i < colors.length; i++) {
        colorControllers[i].setValueOnly('#000000');
    }
    colorControllers[0].setValueOnly('#ffffff');
};

colors.greys = function() {
    colorControllers[0].setValueOnly('#ffffff');
    colorControllers[1].setValueOnly('#000000');
    colorControllers[2].setValueOnly('#bbbbbb');
    colorControllers[3].setValueOnly('#888888');
    colorControllers[4].setValueOnly('#dddddd');
    colorControllers[5].setValueOnly('#666666');
    colorControllers[6].setValueOnly('#eeeeee');
    colorControllers[7].setValueOnly('#444444');
    colorControllers[8].setValueOnly('#cccccc');
};

colors.rainbow = function() {
    colorControllers[0].setValueOnly('#ffffff');
    colorControllers[1].setValueOnly('#000000');
    colorControllers[2].setValueOnly('#4444ff');
    colorControllers[3].setValueOnly('#ffff00');
    colorControllers[4].setValueOnly('#00eeee');
    colorControllers[5].setValueOnly('#ff0000');
    colorControllers[6].setValueOnly('#ff8800');
    colorControllers[7].setValueOnly('#ff33ff');
    colorControllers[8].setValueOnly('#aaaaaa');
};

colors.blues = function() {
    colorControllers[0].setValueOnly('#000000');
    colorControllers[1].setValueOnly('#ffffff');
    colorControllers[2].setValueOnly('#aaf8ff');
    colorControllers[3].setValueOnly('#44bbff');
    colorControllers[4].setValueOnly('#6688bb');
    colorControllers[5].setValueOnly('#440099');
    colorControllers[6].setValueOnly('#770088');
    colorControllers[7].setValueOnly('#888888');
    colorControllers[8].setValueOnly('#aaaaaa');
};

colors.setup = colors.greys;

function create() {
    size = output.canvas.width;
    const size2 = size * size;
    prevStates.length = size2;
    states.length = size2;
    nextStates.length = size2;
}

function reset() {
    automaton.time = 0;
    automaton.timer.setValueOnly(0);
    prevStates.fill(0);
    states.fill(0);
    nextStates.fill(0);
    const half = Math.floor(size / 2);
    if ((automaton.advance === advanceHexagonLine) || (automaton.advance === advanceSquareLine)) {
        // top line
        states[half] = 1;
    } else {
        // center, even sum of indices
        states[half + half * size + automaton.offset] = 1;
    }
}

// copy all states
function copy() {
    automaton.time += 1;
    automaton.timer.setValueOnly(automaton.time);
    const sizeMsize = size * (size - 1);
    for (var index = size; index < sizeMsize; index++) {
        prevStates[index] = states[index];
        states[index] = nextStates[index];
    }
}

// hexagontriangle lattice
function advancehexagontriangle() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const sizeM = size - 1;
    const sizeP = size + 1;
    for (var j = 1; j < sizeM; j += 2) {
        let index = j * size + 1;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            switch (i % 3) {
                case 0:
                    sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size] + states[index + size + 1] + states[index - size + 1]);
                    break;
                case 1:
                    sum += neighborWeight * (states[index - 1] + states[index + size + 1] + states[index - size + 1]);
                    break;
                case 2:
                    sum += neighborWeight * (states[index + 1] + states[index + size] + states[index - size]);
                    break;
            }
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
        index = j * size + sizeP;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            switch (i % 3) {
                case 0:
                    sum += neighborWeight * (states[index - 1] + states[index + size] + states[index - size]);
                    break;
                case 1:
                    sum += neighborWeight * (states[index + 1] + states[index + size - 1] + states[index - size - 1]);
                    break;
                case 2:
                    sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size] + states[index + size - 1] + states[index - size - 1]);
                    break;
            }
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
    }
    copy();
}


// dodecagon triangle lattice
function advanceDodecagonTriangle() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const sizeM = size - 1;
    const sizeM2 = size - 2;
    const sizeP = size + 1;
    for (var j = 2; j < sizeM2; j += 2) {
        let index = j * size + 1;
        for (let i = 2; i < sizeM2; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            switch (i % 3) {
                case 0:
                    sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size] + states[index + size + 1] + states[index - size + 1]);
                    sum += neighbor2Weight * (states[index + 2 * size] + states[index - 2 * size] + states[index + size + 2] + states[index - size + 2] + states[index + size - 1] + states[index - size - 1]);
                    break;
                case 1:
                    sum += neighborWeight * (states[index - 1] + states[index + size + 1] + states[index - size + 1]);
                    break;
                case 2:
                    sum += neighborWeight * (states[index + 1] + states[index + size] + states[index - size]);
                    break;
            }
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
        index = j * size + sizeP;
        for (let i = 2; i < sizeM2; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            switch (i % 3) {
                case 0:
                    sum += neighborWeight * (states[index - 1] + states[index + size] + states[index - size]);
                    break;
                case 1:
                    sum += neighborWeight * (states[index + 1] + states[index + size - 1] + states[index - size - 1]);
                    break;
                case 2:
                    sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size] + states[index + size - 1] + states[index - size - 1]);
                    sum += neighbor2Weight * (states[index + 2 * size] + states[index - 2 * size] + states[index + size + 1] + states[index - size + 1] + states[index + size - 2] + states[index - size - 2]);
                    break;
            }
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
    }
    copy();
}

// hexagonal lattice
function advanceHex() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const sizeM = size - 1;
    const sizeP = size + 1;
    for (var j = 1; j < sizeM; j += 2) {
        let index = j * size + 1;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size] + states[index + sizeM] + states[index - sizeP]);
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
        index = j * size + sizeP;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size] + states[index + sizeP] + states[index - sizeM]);
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
    }
    copy();
}

// square lattice
function advanceSquare() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const sizeM = size - 1;
    const sizeP = size + 1;
    for (var j = 1; j < sizeM; j++) {
        let index = j * size + 1;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size]);
            sum += neighbor2Weight * (states[index - sizeM] + states[index - sizeP] + states[index + sizeM] + states[index + sizeP]);
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
    }
    copy();
}

// semiregular octagon square lattice
function advanceOctagonSquare() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const sizeM = size - 1;
    const sizeP = size + 1;
    for (var j = 1; j < sizeM; j++) {
        let index = j * size + 1;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            sum += neighborWeight * (states[index - 1] + states[index + 1] + states[index - size] + states[index + size]);
            // for octagons
            if ((i + j) % 2 === 0) {
                sum += neighbor2Weight * (states[index - sizeM] + states[index - sizeP] + states[index + sizeM] + states[index + sizeP]);
            }
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
    }
    copy();
}

// triangle lattice
function advanceTriangle() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const sizeM = size - 1;
    const sizeP = size + 1;
    for (var j = 1; j < sizeM; j++) {
        let index = j * size + 1;
        for (let i = 1; i < sizeM; i++) {
            let sum = prevWeight * prevStates[index] + centerWeight * states[index];
            sum += neighborWeight * (states[index - 1] + states[index + 1]);
            // for octagons
            if ((i + j) % 2 === 0) {
                sum += neighborWeight * states[index - size];
            } else {
                sum += neighborWeight * states[index + size];
            }
            nextStates[index] = sum % bigNumber;
            index += 1;
        }
    }
    copy();
}

// square lattice, advance line
function advanceSquareLine() {
    automaton.time += 1;
    automaton.timer.setValueOnly(automaton.time);
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const sizeM = size - 2;
    const sizeP = size + 1;
    let index = automaton.time * size + 2;
    for (let i = 2; i < sizeM; i++) {
        let sum = centerWeight * states[index - size];
        sum += neighborWeight * (states[index - size - 1] + states[index - size + 1]);
        sum += neighbor2Weight * (states[index - size + 2] + states[index - size - 2]);
        states[index] = sum % bigNumber;
        index += 1;
    }

}

// hexagon lattice, advance line
function advanceHexagonLine() {
    automaton.time += 1;
    automaton.timer.setValueOnly(automaton.time);
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const sizeM = size - 2;
    const sizeP = size + 1;
    let index = automaton.time * size + 2;
    const offset = (automaton.time % 2 === 0) ? size + 1 : size - 1;
    for (let i = 2; i < sizeM; i++) {
        let sum = states[index - size] + states[index - offset];
        states[index] = sum % bigNumber;
        index += 1;
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

    automaton.advance = advanceSquare;

    gui.add({
        type: 'selection',
        params: automaton,
        property: 'advance',
        labelText: 'lattice',
        options: {
            square: advanceSquare,
            'octagon square': advanceOctagonSquare,
            hexagon: advanceHex,
            triangle: advanceTriangle,
            'hexagon triangle': advancehexagontriangle,
            'dodecagon triangle': advanceDodecagonTriangle,
            'Pascal triangle': advanceHexagonLine,
            'square line': advanceSquareLine
        },
        onChange: function() {
            reset();
            draw();
        }
    });

    const nStatesController = gui.add({
        type: 'number',
        params: automaton,
        property: 'nStates',
        min: 2,
        step: 1,
        max: colors.length,
        onChange: function() {
            draw();
        }
    }).add({
        type: 'number',
        params: automaton,
        property: 'offset',
        min: -1,
        step: 1,
        max: 1,
        onChange: function() {
            reset();
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
            automaton.advance();
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
                automaton.advance();
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

    gui.add({
        type: 'selection',
        params: colors,
        property: 'setup',
        options: {
            greys: colors.greys,
            whiteBlack: colors.zeroWhiteElseBlack,
            rainbow: colors.rainbow,
            blues:colors.blues
        },
        onChange: function() {
            colors.setup();
            draw();
        }
    });

    for (let i = 0; i < colors.length; i++) {
        const colorController = gui.add({
            type: 'color',
            params: colors,
            property: i,
            onChange: draw
        });
        colorControllers.push(colorController);
    }
    colors.setup();


    all();

}

setup();