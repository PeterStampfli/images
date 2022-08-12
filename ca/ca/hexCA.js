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
var prev = [1, 0, 0, 0, 0, 0, 0];
var initConfig = [1, 0, 0, 0, 0, 0, 0];
var weights = [1, 1, 0, 0, 0, 0, 0];
var more = [1, 1, 0, 0, 0, 0, 0];
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
    output.saveType.setValue('png');
    // square image
    output.setCanvasWidthToHeight();
    output.canvasWidthController.setValueOnly(3000);
    output.canvasHeightController.setValueOnly(3000);
    output.autoScaleController.setValue(true);
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
        buttonText: '100',
        onClick: function() {
            runner.running = false;
            runner.stepsToDo = 100;
            runner.makeStep();
        }
    }).add({
        type: 'button',
        buttonText: '300',
        onClick: function() {
            runner.running = false;
            runner.stepsToDo = 300;
            runner.makeStep();
        }
    });
    /*
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
    */
    utils.reversibleSum = true;
    gui.add({
        type: 'number',
        params: utils,
        property: 'reversible',
        step: 1
    }).add({
        type: 'boolean',
        params: utils,
        property: 'reversibleSum',
        labelText: 'use sum'
    });

    gui.add({
        type: 'selection',
        params: utils,
        property: 'transitionTable',
        labelText: '',
        options: {
            'saw tooth': utils.sawToothTable,
            'inverse saw tooth': utils.inverseSawToothTable,
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
            colors.nController.setValueOnly(utils.nStates);
            colors.setN(utils.colors);
            colors.makeTable();
            utils.draw();
            runner.reset();
        }
    });
    utils.copyCellsView = utils.copyCellsViewUltimateHexagon;
    latticeController = statesController.add({
        type: 'selection',
        params: utils,
        property: 'copyCellsView',
        options: {
            4: utils.copyCellsViewHexagon,
            6: utils.copyCellsViewImprovedHexagon,
            8: utils.copyCellsViewUltimateHexagon
        },
        labelText: 'super',
        onChange: function() {
            utils.draw();
        }
    });
    configuration = gui.addParagraph('configuration');
    gui.add({
        type: 'number',
        params: prev,
        property: 0,
        labelText: 'previ&emsp;&emsp; 0',
        step: 1,
        onChange: function() {
            runner.reset();
        }
    }).add({
        type: 'number',
        params: prev,
        property: 1,
        step: 1,
        onChange: function() {
            runner.reset();
        }
    }).add({
        type: 'number',
        params: prev,
        property: 2,
        step: 1,
        onChange: function() {
            runner.reset();
        }
    }).add({
        type: 'number',
        params: prev,
        property: 3,
        step: 1,
        onChange: function() {
            runner.reset();
        }
    });
    gui.add({
        type: 'number',
        params: initConfig,
        property: 0,
        labelText: 'initial&emsp;&emsp; 0',
        step: 1,
        onChange: function() {
            runner.reset();
        }
    }).add({
        type: 'number',
        params: initConfig,
        property: 1,
        step: 1,
        onChange: function() {
            runner.reset();
        }
    }).add({
        type: 'number',
        params: initConfig,
        property: 2,
        step: 1,
        onChange: function() {
            runner.reset();
        }
    }).add({
        type: 'number',
        params: initConfig,
        property: 3,
        step: 1,
        onChange: function() {
            runner.reset();
        }
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

    utils.useMore = false;
    utils.useMoreController = gui.add({
        type: 'boolean',
        params: utils,
        property: 'useMore',
        onChange: function() {
            utils.weights.length = 0;
            utils.weights.push(weights);
            if (utils.useMore) {
                utils.weights.push(more);
            }
        }
    });
    gui.add({
        type: 'number',
        params: more,
        property: 0,
        labelText: 'more&emsp;&emsp; 0',
        step: 1,
        onChange: function() {
            utils.useMoreController.setValueOnly(true);
            if (utils.weights.length === 1) {
                console.log('addmore');
                utils.weights.push(more);
            }
        }
    }).add({
        type: 'number',
        params: more,
        property: 1,
        step: 1,
    }).add({
        type: 'number',
        params: more,
        property: 2,
        step: 1,
    }).add({
        type: 'number',
        params: more,
        property: 3,
        step: 1,
    });
    colors.makeGui(gui);
    colors.random(utils.colors);
    sizeController.setValueOnly(401);
    runner.reset();
};

runner.reset = function() {
    utils.image = utils.nearestImage;
    //    imageController.setValueOnly('nearest image');
    runner.step = 0;
    runner.stepsDoneController.setValueOnly(0);
    utils.setSize();
    utils.trianglePeriod = 2 * utils.nStates - 2;
    utils.makeSum = utils.makeSumHexagon;
    configuration.innerHTML = '&ensp; 3 2 3<br>&nbsp;2 1 1 2<br>3 1 0 1 3<br>&nbsp;2 1 1 2<br>&ensp; 3 2 3';
    utils.initialStateHexagon(initConfig);
    utils.prevStateHexagon(prev);
    utils.weights.length = 0;
    utils.weights.push(weights);
    if (utils.useMore) {
        utils.weights.push(more);
    }
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