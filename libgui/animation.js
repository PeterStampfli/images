/* jshint esversion: 6 */
import {
    guiUtils,
    ParamController
}
from "./modules.js";

/**
 * animate an object with reset, step and draw methods
 * including recording
 * @namespace animation
 */

export const animation = {};
animation.fps = 60;

var gui, animationObject;
var running = false; // true while the animation runs (continuous stepping and drawing frames)
var timeoutID; // id for the timeout in the animation loop, for stopping it
var advancing = false; // true while advancing to given frame number
var drawing = false; // calling the animationObject.draw method after each animationObject.step, drawing frames
var recording = false; // saving an animation, draw each frame and save as image with current ferame number
var frameNumberController; // shows the frame number and can be used to advance it
var currentFrameNumber = 0;
var initialFrame = true; // for drawing the first frame without doing a step
var targetFrameNumber; // for running the animation until we get to this frame

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
        max: 60,
        step: 0.1,
        min: 0.1,
    });
    // shows the frame number while animation runs, or while waiting
    // can advance the frame number if animation is not running
    frameNumberController = fpsController.add({
        type: 'number',
        initialValue: 0,
        labelText: 'frame number',
        max: 100000,
        onChange: function(value) {
            animation.advanceToTarget(value);
        }
    });
    // start the animation, disabled visually while doing it
    // disabled while advancing the frame number
    const startButton = gui.add({
        type: 'button',
        buttonText: 'start',
        onClick: function() {
            if (running) {
                animation.stop();
            } else {
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
    // stops the animation or advancing frame number, resets the animated object
    // always active, has no effect at initial frame
    const resetButton = stopButton.add({
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

};

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
    frameNumberController.setValueOnly(currentFrameNumber);
    frameNumberController.setMin(currentFrameNumber);
    if (drawing) {
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
            advancingToTarget();
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
        const frameTime = 1000 / 60;
        const deltaTime = 1000 / animation.fps - frameTime;
        // do the current frame
        const startTime = Date.now();
        advance();
        const endTime = Date.now();
        // prepare next frame
        timeoutID = setTimeout(function() {
            requestAnimationFrame(run);
        }, deltaTime - (endTime - startTime) - frameTime);
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
    animation.stop();
    initialFrame = true;
    currentFrameNumber = 0;
    frameNumberController.setMin(0);
    frameNumberController.setValueOnly(0);
    animationObject.reset();
    animationObject.draw(); // only drawing, not recording
};