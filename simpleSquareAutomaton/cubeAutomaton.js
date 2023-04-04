/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    ColorInput,
    output
} from "../libgui/modules.js";

const automaton = {};

let canvasSize = 102;
// display size odd number smaller than canvas
let displaySize = 101;
// index to pixel with center of symmetry
let displayCenter = 50;
let automatonSize = 52;
let automatonSize2 = automatonSize * automatonSize;
let automatonSize3 = automatonSize * automatonSize * automatonSize;
let prevStates = new Uint8Array(1);
let states = new Uint8Array(1);
let nextStates = new Uint8Array(1);
automaton.nStates = 2;
const maxNStates = 5;
// least common multiplicator
// 3*4*5=60
const bigNumber = 60;

automaton.prevWeight = 0;
automaton.centerWeight = 1;
automaton.neighborWeight = 1;
automaton.neighbor2Weight = 0;
automaton.neighbor3Weight = 0;

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
};

colors.rainbow = function() {
    colorControllers[0].setValueOnly('#ffffff');
    colorControllers[1].setValueOnly('#000000');
    colorControllers[2].setValueOnly('#4444ff');
    colorControllers[3].setValueOnly('#ffff00');
    colorControllers[4].setValueOnly('#00eeee');
};

colors.blues = function() {
    colorControllers[0].setValueOnly('#ffffff');
    colorControllers[1].setValueOnly('#000000');
    colorControllers[2].setValueOnly('#aaf8ff');
    colorControllers[3].setValueOnly('#44bbff');
    colorControllers[4].setValueOnly('#6688bb');
};

colors.setup = colors.greys;

function create() {
    canvasSize = output.canvas.width;
    displaySize = (canvasSize % 2 === 0) ? canvasSize - 1 : canvasSize;
    // odd display size 2n+1
    // automaton size = (n+1) info +2 extra layers/borders
    automatonSize = Math.floor(displaySize / 2) + 2;
    automatonSize2 = automatonSize * automatonSize;
    automatonSize3 = automatonSize * automatonSize * automatonSize;
    prevStates = new Uint8Array(automatonSize3);
    states = new Uint8Array(automatonSize3);
    nextStates = new Uint8Array(automatonSize3);
}

function reset() {
    automaton.time = 0;
    automaton.timer.setValueOnly(0);
    prevStates.fill(0);
    states.fill(0);
    nextStates.fill(0);
    // initial non-zero cell at (1,1,1)
    states[1 + automatonSize + automatonSize2] = 1;
}




function makeNewStates() {
    const prevWeight = automaton.prevWeight;
    const centerWeight = automaton.centerWeight;
    const neighborWeight = automaton.neighborWeight;
    const neighbor2Weight = automaton.neighbor2Weight;
    const neighbor3Weight = automaton.neighbor3Weight;
    const limit = Math.min(automaton.time + 2, automatonSize - 1);
    for (let k = 1; k < limit; k++) {
        for (let j = 1; j <= k; j++) {
            let index = k * automatonSize2 + j * automatonSize + 1;
            let nextState = states[index];
            let state = states[index - 1];
            let sum1 = states[index - 1 + automatonSize] + states[index - 1 - automatonSize] + states[index - 1 + automatonSize2] + states[index - 1 - automatonSize2];
            let nextSum1 = states[index + automatonSize] + states[index - automatonSize] + states[index + automatonSize2] + states[index - automatonSize2];
            let sum2 = states[index - 1 + automatonSize + automatonSize2] + states[index - 1 + automatonSize - automatonSize2] + states[index - 1 - automatonSize + automatonSize2] + states[index - 1 - automatonSize - automatonSize2];
            let nextSum2 = states[index + automatonSize + automatonSize2] + states[index + automatonSize - automatonSize2] + states[index - automatonSize + automatonSize2] + states[index - automatonSize - automatonSize2];
            for (let i = 1; i < j; i++) {
                const indexP = index + 1;
                let lastState = state;
                state = nextState;
                nextState = states[indexP];
                let lastSum1 = sum1;
                sum1 = nextSum1;
                nextSum1 = states[indexP + automatonSize] + states[indexP - automatonSize] + states[indexP + automatonSize2] + states[indexP - automatonSize2];
                let lastSum2 = sum2;
                sum2 = nextSum2;
                nextSum2 = states[indexP + automatonSize + automatonSize2] + states[indexP + automatonSize - automatonSize2] + states[indexP - automatonSize + automatonSize2] + states[indexP - automatonSize - automatonSize2];

                let sum = prevWeight * prevStates[index] + centerWeight * state;


                states[index] = sum % bigNumber;
                index += 1;
            }
        }
    }
}

// making symmetric copy (i,j,k) to all permutations
// filling the whole octant
// also useful for display
function copySectorToOctant() {
    const limit = Math.min(automaton.time + 2, automatonSize - 1);
    for (let k = 1; k < limit; k++) {
        for (let j = 1; j <= k; j++) {
            for (let i = 1; i < j; i++) {
                const value = nextStates[i + j * automatonSize + k * automatonSize2];
                states[i + j * automatonSize + k * automatonSize2] = value;
                states[i + k * automatonSize + j * automatonSize2] = value;
                states[j + i * automatonSize + k * automatonSize2] = value;
                states[j + k * automatonSize + i * automatonSize2] = value;
                states[k + i * automatonSize + j * automatonSize2] = value;
                states[k + j * automatonSize + i * automatonSize2] = value;
            }
        }
    }
}

// copying the cells at the axis planes
// at time t cells up to index 1+t are different from zero
function centerCopy() {
    const limit = Math.min(automaton.time + 2, automatonSize);
    var index;
    // optimize this?
    // copy in z-direction, (i,j,0)=(i,j,2)
    let offset = 2 * automatonSize2;
    for (let j = 1; j < limit; j++) {
        index = j * automatonSize + 1;
        for (let i = 1; i < limit; i++) {
            states[index] = states[index + offset];
            index += 1;
        }
    }
    // copy in x-direction, (0,j,k)=(2,j,k)
    offset = 2;
    for (let j = 0; j < limit; j++) {
        index = j * automatonSize;
        for (let k = 0; k < limit; k++) {
            states[index] = states[index + offset];
            index += automatonSize2;
        }
    }
    // copy in y-direction, (i,0,k)=(i,2,k)
    offset = 2 * automatonSize;
    for (let i = 0; i < limit; i++) {
        index = i;
        for (let k = 0; k < limit; k++) {
            states[index] = states[index + offset];
            index += automatonSize2;
        }
    }
}

function advance() {
    automaton.time += 1;
    automaton.timer.setValueOnly(automaton.time);
    // first generation: now automaton.time==1
    // before: active cells up to index==automaton.time
    // accounting for dublicate at index 0
    // after: advanced by one, index=automaton.time+1<automaton.time+2
    // note last dead layer, thus index<automatonSize-1
    makeNewStates();
    copySectorToOctant();
    centerCopy();
}

function draw() {
    output.isDrawing = true;
    output.pixels.update();
    const pixelsArray = output.pixels.array;

    // size of display is 2n+1, center lies at index n
    // find center=n
    const center = Math.floor(displaySize / 2);
    const centerPixel = center + center * canvasSize;
    // automatonSize=center+2
    // index 0 is dublicate info, center lies at 1, last is zero
    const centerP = center + 1;
    const nStates = automaton.nStates;
    for (let jAuto = 1; jAuto <= centerP; jAuto++) {
        let autoIndex = jAuto * automatonSize + 1;
        const displayRowLowCenter = centerPixel - (jAuto - 1) * canvasSize;
        const displayRowHighCenter = centerPixel + (jAuto - 1) * canvasSize;
        for (let iAuto = 1; iAuto <= centerP; iAuto++) {
            const iDisplay = iAuto - 1;
            const color = intColors[states[index] % nStates];
            pixelsArray[displayRowLowCenter - iDisplay] = color;
            pixelsArray[displayRowLowCenter + iDisplay] = color;
            pixelsArray[displayRowHighCenter - iDisplay] = color;
            pixelsArray[displayRowHighCenter + iDisplay] = color;


            autoIndex += 1;
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
    output.setCanvasWidthToHeight(1);
    output.createPixels();
    output.drawCanvasChanged = function() {
        create();
        reset();
        draw();
    };

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

    gui.add({
        type: 'selection',
        params: colors,
        property: 'setup',
        options: {
            greys: colors.greys,
            whiteBlack: colors.zeroWhiteElseBlack,
            rainbow: colors.rainbow,
            blues: colors.blues
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
    create();
    reset();
    draw();
}

setup();