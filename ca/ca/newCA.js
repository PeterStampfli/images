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
var sizeController, imageController, latticeController, statesController;

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
    output.createCanvas(gui, true, true);
    output.backgroundColorController.setValueOnly('#000000');
    output.setBackground();
    output.saveType.setValue('jpg');
    // square image
    output.setCanvasWidthToHeight();
    // create output.pixels
    output.createPixels();
    output.drawCanvasChanged = utils.draw;
    output.drawImageChanged = utils.draw;
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
    runner.stepsDone = 0;
    runner.stepsToDo = 0;
    runner.stepsDoneController = gui.add({
        type: 'number',
        params: runner,
        property: 'stepsDone',
        labelText: 'steps',
    });
    runner.stepsDoneController.add({
        type: 'number',
        params: runner,
        property: 'stepTime',
        labelText: 'time per step',
        min: 0,
        step: 0.1
    });
    gui.add({
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
            runner.running = false;
            runner.makeStep();
        }
    }).add({
        type: 'button',
        buttonText: '10 steps',
        onClick: function() {
            runner.running = false;
            runner.stepsToDo = 10;
            runner.makeStep();
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
    imageController = gui.add({
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
        type: 'number',
        params: utils,
        property: 'reversible',
        step: 1
    }).add({
        type: 'selection',
        params: utils,
        property: 'transitionTable',
        labelText: '',
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
    sizeController = gui.add({
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
    statesController = sizeController.add({
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
    });
    latticeController = statesController.add({
        type: 'selection',
        params: utils,
        property: 'lattice',
        options: {
            square: utils.squareLattice,
            hexagonal: utils.hexagonLattice,
            'improved hexa': utils.improvedHexagonLattice
        },
        labelText: '',
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
    colors.random(utils.colors);
    runner.reset();
};

runner.reset = function() {

    imageController.setValueOnly('nearest image');
    sizeController.setValueOnly(9);
    latticeController.setValueOnly('improved hexa');


    runner.step = 0;
    runner.stepsDoneController.setValueOnly(0);
    utils.setSize();
    utils.trianglePeriod = 2 * utils.nStates - 2;
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
        runner.stepsToDo = 0;
        return;
    }
    // do the step
    runner.stepStart = Date.now();
    runner.step += 1;
    runner.stepsToDo -= 1;
    runner.stepsDoneController.setValueOnly(runner.step);
    utils.step();
    if (runner.stepsToDo <= 0) {
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
    if (runner.stepsToDo > 0) {
        requestAnimationFrame(function() {
            runner.makeStep();
        });
    }
};