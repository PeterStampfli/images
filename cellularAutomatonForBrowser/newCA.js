/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

import {
    utils,
    colors
} from "./modules.js";

// export everything from here, eliminate modules.js
export const main = {};
export const runner = {};

// automaton does the interesting thing
// methods: setup, draw, reset, step

var configuration;
var initConfig = [1, 0, 0, 0, 0, 0, 0];
var weights = [1, 1, 1, 0, 0, 0, 0];

main.setup = function() {
    // gui and output canvas
    const gui = new ParamGui({
        name: 'cellular automaton',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;
    BooleanButton.greenRedBackground();
    // no background color, no transparency
    output.createCanvas(gui, false, false);
    output.saveType.setValue('jpg');
    // square image
    output.setCanvasWidthToHeight();
    // create output.pixels
    output.createPixels();
    output.drawCanvasChanged = utils.draw;
    colors.draw = utils.draw;
    // setup the runner and its interface
    runner.recording = false;
    gui.add({
        type: 'boolean',
        params: runner,
        property: 'recording'
    }).add({
        type: "button",
        buttonText: "save this frame",
        minLabelWidth: 20,
        onClick: function() {
            output.saveCanvasAsFile(output.saveName.getValue(), output.saveType.getValue());
        }
    });
    runner.stepNumberDigits = 5;
    runner.stepTime = 1;
    runner.step = 0;
    runner.stepMessage = gui.addParagraph('steps done: ' + 0);
    gui.add({
        type: 'number',
        params: runner,
        property: 'stepTime',
        labelText: 'time per step',
        min: 0,
        step: 0.1
    }).add({
        type: 'button',
        buttonText: 'reset',
        onClick: function() {
            runner.running = false;
            runner.reset();
        }
    }).add({
        type: 'button',
        buttonText: 'stop',
        onClick: function() {
            runner.running = false;
        }
    }).add({
        type: 'button',
        buttonText: 'step',
        onClick: function() {
            if (!runner.running) {
                runner.makeStep();
            } else {
                runner.running = false;
            }
        }
    }).add({
        type: 'button',
        buttonText: 'run',
        onClick: function() {
            if (!runner.running) {
                runner.running = true;
                runner.makeStep();
            }
        }
    });
    gui.add({
        type: 'selection',
        params: utils,
        property: 'image',
        options: {
            'nearest image': utils.nearestImage,
            'linear interpolation': utils.linearImage,
            'cubic interpolation': utils.cubicImage
        },
        onChange: function() {
            utils.draw();
        }
    });
    gui.add({
        type: 'selection',
        params: utils,
        property: 'transition',
        options: {
            irreversible: utils.irreversibleTransition,
            'reversible additive': utils.reversibleTransitionAdditive,
            'reversible subtractive': utils.reversibleTransitionSubtractive
        }
    }).add({
        type: 'selection',
        params: utils,
        property: 'transitionTable',
        labelText:'',
        options: {
            'saw tooth': utils.sawToothTable,
            'triangle': utils.triangleTable,
            'slow saw tooth': utils.slowToothTable
        }
    });
    /*
    gui.add({
        type: 'boolean',
        params: utils,
        property: 'average',
    }).add({
        type: 'number',
        params: utils,
        property: 'maxAverage',
        labelText: 'limit',
        min: 2,
        step: 1
    });
    */
    const sizeController = gui.add({
        type: 'number',
        params: utils,
        property: 'size',
        min: 9,
        step: 2,
        onChange: function() {
            if (utils.size > output.canvas.width) {
                if (output.canvas.width & 1) {
                    sizeController.setValueOnly(output.canvas.width);
                } else {
                    sizeController.setValueOnly(output.canvas.width - 1);
                }
            }
            runner.running = false;
            runner.reset();
        }
    });
    sizeController.add({
        type: 'number',
        params: utils,
        property: 'nStates',
        labelText: 'states',
        min: 2,
        step: 1,
        onChange: function() {
            runner.running = false;
            runner.reset();
        }
    }).add({
        type: 'selection',
        params: utils,
        property: 'lattice',
        options: {
            square: utils.squareLattice,
            hexagonal: utils.hexagonLattice
        },
        labelText:'',
        onChange: function() {
            runner.running = false;
            runner.reset();
        }
    });
    configuration = gui.addParagraph('configuration');
    gui.add({
        type: 'number',
        params: initConfig,
        property: 0,
        labelText: 'initial&emsp;&emsp; 0',
        step: 1,
    }).add({
        type: 'number',
        params: initConfig,
        property: 1,
        step: 1,
    }).add({
        type: 'number',
        params: initConfig,
        property: 2,
        step: 1,
    }).add({
        type: 'number',
        params: initConfig,
        property: 3,
        step: 1,
    });
    gui.add({
        type: 'number',
        params: initConfig,
        property: 4,
        labelText: '&emsp;&emsp;&emsp;&emsp; 4',
        step: 1,
    }).add({
        type: 'number',
        params: initConfig,
        property: 5,
        step: 1,
    }).add({
        type: 'number',
        params: initConfig,
        property: 6,
        step: 1,
    });
    gui.add({
        type: 'number',
        params: weights,
        property: 0,
        labelText: 'weights&emsp; 0',
        step: 1,
    }).add({
        type: 'number',
        params: weights,
        property: 1,
        step: 1,
    }).add({
        type: 'number',
        params: weights,
        property: 2,
        step: 1,
    }).add({
        type: 'number',
        params: weights,
        property: 3,
        step: 1,
    });
    gui.add({
        type: 'number',
        params: weights,
        property: 4,
        labelText: '&emsp;&emsp;&emsp;&emsp; 4',
        step: 1,
    }).add({
        type: 'number',
        params: weights,
        property: 5,
        step: 1,
    }).add({
        type: 'number',
        params: weights,
        property: 6,
        step: 1,
    });
        colors.makeGui(gui);
    runner.reset();
};

runner.reset = function() {
    runner.step = 0;
    utils.setSize();
    utils.trianglePeriod = 2 * utils.nStates - 2;
    colors.random(utils.colors);
    utils.lattice(utils.average);
    if (utils.lattice === utils.squareLattice) {
        configuration.innerHTML = '6 5 3 4 6<br>4 2 1 2 5<br>3 1 0 1 3<br>5 2 1 2 4<br>6 4 3 5 6';
    } else {
        configuration.innerHTML = '&ensp; 6 4 5<br>&nbsp;3 2 1 3<br>5 1 0 2 6<br>&nbsp;4 2 1 4<br>&ensp; 6 3 5';
    }
    utils.initialState(initConfig);
    utils.weights.length = 0;
    utils.weights.push(weights);
    utils.draw();
};

runner.makeStep = function() {
    // if image reaches border
    // restart for automatic runs (and continue running)
    // stop running for simple run
    if (utils.stop) {
        runner.running = false;
        return;
    }
    // do the step
    runner.stepStart = Date.now();
    runner.step += 1;
    runner.stepMessage.innerHTML = 'steps done: ' + runner.step;
    utils.step();
    utils.draw();
    // write image, if recording, and go to next step, if running
    if (runner.recording) {
        let name = runner.step.toString(10);
        while (name.length < runner.stepNumberDigits) {
            name = '0' + result;
        }
        name = output.saveName.getValue() + result;
        const type = output.saveType.getValue();
        guiUtils.saveCanvasAsFile(output.canvas, name, type,
            function() {
                runner.waitForNextStep();
            });
    } else {
        runner.waitForNextStep();
    }
};

// if running, wait and go to next step
runner.waitForNextStep = function() {
    if (runner.running) {
        const timeUsed = Date.now() - runner.stepStart;
        const remainingTime = Math.max(0, 1000 * runner.stepTime - timeUsed);
        setTimeout(function() {
            requestAnimationFrame(function() {
                if (runner.running) {
                    runner.makeStep();
                }
            });
        }, remainingTime);
    }
};