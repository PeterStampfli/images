/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

import {
    utils,
    setups
} from "./modules.js";

// export everything from here, eliminate modules.js
export const main = {};
export const runner = {};

// automaton does the interesting thing
// methods: setup, draww, reset, step

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
    // setup the runner and its interface
    runner.recording = false;
    gui.add({
        type: 'boolean',
        params: runner,
        property: 'recording'
    });
    runner.stepNumberDigits = 5;
    runner.stepTime = 1;
    runner.step = 0;
    runner.autoRun = false;
    runner.stepMessage = gui.addParagraph('steps done: ' + 0);
    gui.add({
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
            runner.autoRun = false;
            runner.reset();
        }
    }).add({
        type: 'button',
        buttonText: 'stop',
        onClick: function() {
            runner.running = false;
            runner.autoRun = false;
        }
    }).add({
        type: 'button',
        buttonText: 'step',
        onClick: function() {
            runner.autoRun = false;
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
            runner.autoRun = false;
            if (!runner.running) {
                runner.running = true;
                runner.makeStep();
            }
        }
    }).add({
        type: 'button',
        buttonText: 'auto run',
        onClick: function() {
            runner.autoRun = true;
            if (!runner.running) {
                runner.running = true;
                runner.makeStep();
            }
        }
    });
    main.logger = main.gui.addLogger();
    runner.reset();
};

runner.reset = function() {
    runner.step = 0;
    setups.reset();
    utils.draw();
};

runner.makeStep = function() {
    // restart for automatic runs if image reaches border
    // (and continue running)
    if (utils.cellsFull) {
        console.log('cellsfull');
        if (runner.autoRun) {
            runner.reset();
        } else {
            runner.running = false;
        }
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