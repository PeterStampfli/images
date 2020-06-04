/* jshint esversion: 6 */
import {
    guiUtils,
    ParamController,
    output
}
from "./modules.js";

/**
 * animate an object with reset, step and draw methods
 * including recording
 * @namespace animation
 */

export const animation = {};
animation.fps = 60;

var animationObject;
var running = false; // true while the animation runs (continuous stepping and drawing frames)
var timeoutID; // id for the timeout in the animation loop, for stopping it
var advancing = false; // true while advancing to given frame number
var drawing = false; // calling the animationObject.draw method after each animationObject.step, drawing frames

var frameNumberController; // shows the frame number and can be used to advance it
var startButton; // starts and stops the animation
var currentFrameNumber = 0;
var initialFrame = true; // means that we are at the initial frame, for drawing the first frame without doing a step before
var targetFrameNumber; // for running the animation until we get to this frame

var recorder = {};
//recorder.onOffSwitch;   // paramController, type 'booleanButton', switches recording on and off
recorder.recording = false; // saving an animation, draw each frame and save as image with current frame number
recorder.movieName = 'movie'; // name for 'downloading' the animation images
recorder.movieType = 'jpg'; // type for the animation images
recorder.numberOfDigits = 5; // number of digits for movie image file names, 24 per sec,1500 per min, 96000 per h

/**
 * set the animation object
 * @method animation.setObject
 * @param {object} theObject
 */
animation.setObject = function(theObject) {
    if (!guiUtils.isFunction(theObject.reset)) {
        console.error('animation.setObject: The object has not a RESET method');
    }
    if (!guiUtils.isFunction(theObject.step)) {
        console.error('animation.setObject: The object has not a STEP method');
    }
    if (!guiUtils.isFunction(theObject.draw)) {
        console.error('animation.setObject: The object has not a DRAW method');
    }
    if (!output.canvas) {
        console.error("animation.setObject: there is no output.canvas!");
    }
    animationObject = theObject;
};

/**
 * make the basic user interface (no extra stepping, no recording)
 * @method animation.createUI
 * @param {ParamGui} gui
 */
animation.createUI = function(gui) {
    const fpsController = gui.add({
        type: 'number',
        params: animation,
        property: 'fps',
        labelText: 'speed (fps)',
        step:0.1,
        max: 60,
        min: 0.2,
    });
    // shows the frame number while animation runs, or while waiting
    // can advance the frame number if animation is not running
    frameNumberController = fpsController.add({
        type: 'number',
        initialValue: 0,
        labelText: 'frame number',
        max: 99999,
        min: 0,
        step: 1,
        onChange: function(value) {
                frameNumberController.setMin(value);
            animation.advanceToTarget(value);
        }
    });
    // start the animation, disabled visually while doing it
    // disabled while advancing the frame number
    startButton = gui.add({
        type: 'button',
        buttonText: 'start',
        onClick: function() {
            if (running) {
                animation.stop();
                startButton.setButtonText('start');
            } else {
                startButton.setButtonText('stop');
                animation.start();
            }
        }
    });
    // stops the animation or advancing the frame number
    // always active, has no effect while waiting
    const stopButton = startButton.add({
        type: 'button',
        buttonText: 'stop',
        onClick: animation.stop
    });
    const stepButton = animation.addStepsButton(stopButton, 'step', 1);
    // stops the animation or advancing frame number, resets the animated object
    // always active, has no effect at initial frame
    const resetButton = stepButton.add({
        type: 'button',
        buttonText: 'reset',
        onClick: animation.reset
    });
};

/**
 * add a button, that makes a given number of steps
 * disactivated visually while animation runs
 * does nothing while advancing to targetFrameNumber
 * @method animation.addStepsButton
 * @param {ParamGui||ParamController} base
 * @param {string} text
 * @param {int} nSteps
 * @return buttonController
 */
animation.addStepsButton = function(base, text, nSteps) {
    const buttonController = base.add({
        type: 'button',
        buttonText: text,
        onClick: function() {
            if (running) {
                animation.stop();
            }
            animation.advanceToTarget(currentFrameNumber + nSteps);
        }
    });
    return buttonController;
};

/**
 * add recording ui
 * @method animation.addRecording
 * @param {ParamGui} gui
 */
animation.addRecording = function(gui) {
    gui.updateDesign({
        textInputWidth: 150
    });
    recorder.onOffSwitch = gui.add({
        type: 'boolean',
        params: recorder,
        property: 'recording'
    });
    const saveName = gui.add({
        type: "text",
        params: recorder,
        property: 'movieName',
        labelText: "save as"
    });
    const saveType = saveName.add({
        type: 'selection',
        params: recorder,
        property: 'movieType',
        options: ['png', 'jpg'],
        initialValue: 'jpg',
        labelText: '.',
        minLabelWidth: 5,
    });
};

// recording
//=========================================

/*
 * make file name, depending on current frame number and movieName
 */
function makeFilename() {
    let result = currentFrameNumber.toString(10);
    while (result.length < recorder.numberOfDigits) {
        result = '0' + result;
    }
    result = recorder.movieName + result;
    return result;
}

// animation
//==========================================

/*
 * advance the animation (doing a step)
 * make step if not initial frame, draw frame if drawing
 * if recording write frame to file (framenumber)
 */
function advance() {
    if (initialFrame) {
        initialFrame = false; // draw once the original configuration (frame 0)
        currentFrameNumber = 0;
        animationObject.reset();
    } else {
        currentFrameNumber += 1;
        animationObject.step();
    }
    if (currentFrameNumber>frameNumberController.getValue()){
        // advance only
    frameNumberController.setValueOnly(currentFrameNumber);
    frameNumberController.setMin(currentFrameNumber);
}
    if (drawing || recorder.recording) {
        animationObject.draw();
    }
}

/*
 * control advancing to target
 * without drawing, except for the last step
 * including the possibility of recording
 */
function advancingToTarget() {
    if (advancing) {
        if (currentFrameNumber < targetFrameNumber) {
            drawing = (currentFrameNumber === targetFrameNumber - 1);
            advance();
            if (recorder.recording) {
                const filename = makeFilename();
                guiUtils.saveCanvasAsFile(output.canvas, filename, recorder.movieType, advancingToTarget);
            } else {
                advancingToTarget();
            }
        } else {
            advancing = false;
        }
    }
}

/**
 * advance to targetFrameNumber
 * initialization
 * does nothing if animation or advancing is still running
 * @method animation.advanceToTarget
 * @param {int} target
 */
animation.advanceToTarget = function(target) {
    if (!running && !advancing) {
        targetFrameNumber = target;
        advancing = true;
        advancingToTarget();
    }
};

/*
 * run the animations, that means
 note time
 * advance animation
 * calculate remaining time from fps
 * start time delay, request animation frame for next frame
 */
function run() {
    if (running) {
        // all times in msec
        // minimum time per frame for not exceeding the given fps speed
        // fps=60 means maximum speed
        const minimumFrameTime = 1000 / animation.fps - 1000 / 60;
        // do the current frame
        const startOfFrame = Date.now();
        advance();
        if (recorder.recording) {
            const filename = makeFilename();
            guiUtils.saveCanvasAsFile(output.canvas, filename, recorder.movieType,
                function() {
                    const timeUsed = Date.now() - startOfFrame;
                    // prepare next frame
                    timeoutID = setTimeout(function() {
                        requestAnimationFrame(run);
                    }, minimumFrameTime - timeUsed);
                });
        } else {
            const timeUsed = Date.now() - startOfFrame;
            // prepare next frame
            timeoutID = setTimeout(function() {
                requestAnimationFrame(run);
            }, minimumFrameTime - timeUsed);
        }
    }
}

/**
 * start the animation, interrupts advancing to target
 * set drawing=true because we want to see the animation
 * @method animation.start
 */
animation.start = function() {
    if (!running) {
        advancing = false;
        running = true;
        drawing = true;
        run();
    }
};

/**
 * stop the animation or advancing
 * enable all buttons
 * set running to false, clear timeout
 * @method animation.stop
 */
animation.stop = function() {
    if (running) {
        running = false;
        clearTimeout(timeoutID);
    }
    advancing = false;
};

/**
 * reset routine:
 * sets current frame to zero, initial frame to true
 * calls reset of the animationObject
 * for reset button and calls from the outside
 * the animated object has to check if a reset is really needed
 * @method animation.reset
 */
animation.reset = function() {
    recorder.onOffSwitch.setValueOnly(false);
    animation.stop();
    initialFrame = true;
    currentFrameNumber = 0;
    startButton.setButtonText('start');
    frameNumberController.setMin(0);
    frameNumberController.setValueOnly(0);
    animationObject.reset();
    animationObject.draw(); // only drawing, not recording
};