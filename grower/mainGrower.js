/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton,
    guiUtils
} from "../libgui/modules.js";

// export everything from here, eliminate modules.js
export const main = {};
export const runner = {};

runner.stepTime = 0.1;
runner.stepsMax = 100;

// automaton does the interesting thing
// methods: setup, draww, reset, step

import {
    automaton
} from "./automatonGrower.js";

main.setup = function() {
    // gui and output canvas
    const gui = new ParamGui({
        name: 'grower',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;
    BooleanButton.greenRedBackground();
    // no background color, no transparency
    output.oddCanvasSize = true;
    output.createCanvas(gui, false, false);
    output.div.style.backgroundColor = '#444444';
    // output.div.style.backgroundColor = '#88ff00';
    output.extendCanvasController.setValue(true);
    output.saveType.setValue('jpg');
    // square image
    output.setCanvasWidthToHeight();
    // create output.pixels
    output.createPixels();
    output.drawCanvasChanged = runner.reset;
    // setup the runner and its interface
    runner.recording = false;
    gui.add({
        type: 'boolean',
        params: runner,
        property: 'recording'
    });
    runner.stepNumberDigits = 5;
    runner.step = 0;
    runner.autoRun = false;
    runner.stepMessage = gui.addParagraph('steps done: ' + 0);
    gui.add({
        type: 'number',
        params: runner,
        property: 'stepTime',
        labelText: 'time per step',
        min: 0
    }).add({
        type: 'number',
        params: runner,
        property: 'stepsMax',
        labelText: 'last Step autorun',
        min: 5,
        step: 1
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
    automaton.setup();
    runner.reset();
};

runner.reset = function() {
    runner.step = 0;
    runner.stepMessage.innerHTML = 'steps done: ' + runner.step;
    automaton.reset();
    automaton.draw();
};

runner.makeStep = function() {
    // restart for automatic runs if maximum number of steps reached
    // (and continue running)
    if (runner.autoRun && (runner.step > runner.stepsMax)) {
        runner.reset();
    }
    // do the step
    runner.stepStart = Date.now();
    runner.step += 1;
    runner.stepMessage.innerHTML = 'steps done: ' + runner.step;
    automaton.step();
    automaton.draw();
    // write image, if recording, and go to next step, if running
    if (runner.recording) {
        let name = runner.step.toString(10);
        while (name.length < runner.stepNumberDigits) {
            name = '0' + name;
        }
        name = output.saveName.getValue() + name;
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