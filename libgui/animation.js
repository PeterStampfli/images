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
var running = false; // control the animation (continuous stepping and drawing frames)
var drawing = false; // calling the animationObject.draw method after each animationObject.step, drawing frames
var recording = false; // saving an animation, draw each frame and save as image with current ferame number
var frameNumberController; // shows the frame number and can be used to advance it
var startButton, stopButton, resetButton;
var currentFrameNumber = 0;
var initialFrame = true; // for drawing the first frame without doing a step
var stepControllers = []; // collects all ui elements that might interfere with running the animation
var timeoutID; // id for the timeout in the animation loop, for stopping it

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
 * make the user interface and save the gui reference for more
 * @method animation.createUI
 * @param {ParamGui} theGui
 */
animation.createUI = function(theGui) {
    gui = theGui;
    const fpsController = gui.add({
        type: 'number',
        params: animation,
        property: 'fps',
        labelText: 'speed (fps)',
        max: 60,
        step: 0.1,
        min: 0.1,
    });
    frameNumberController = fpsController.add({
        type: 'number',
        initialValue: 0,
        labelText: 'frame number',
        max: 100000,
        onChange: function(value) {
            animation.advanceNSteps(value - currentFrameNumber);
        }
    });
    stepControllers.push(frameNumberController);
    startButton = gui.add({
        type: 'button',
        buttonText: 'start',
        labelText: 'control',
        onClick: animation.start
    });
    stopButton = startButton.add({
        type: 'button',
        buttonText: 'stop',
        onClick: animation.stop
    });
    stopButton.setActive(false);
    resetButton = stopButton.add({
        type: 'button',
        buttonText: 'reset',
        onClick: function() {
            resetButton.setActive(false);
        running = false;
            initialFrame = true;
            currentFrameNumber=0;
            frameNumberController.setMin(0);
            frameNumberController.setValueOnly(0);
            animationObject.reset();
            animationObject.draw(); // only drawing, not recording
        }
    });
        resetButton.setActive(false);

    stepControllers.push(resetButton);
};

/**
 * make a given number of steps
 * without drawing, except for the last step
 * including the possibility of recording
 * @method animation.advanceNSteps
 * @param {integer} nSteps
 */
animation.advanceNSteps = function(nSteps) {

    if (nSteps > 0) {
        drawing = false; // drawing only if recording
        if (initialFrame) {
            advance(); // to make sure we record initial frame
        }
        for (var i = 0; i < nSteps - 1; i++) {
            advance();
        }
        drawing = true;
        advance();
    }
};


/**
 * add a button, that makes a given number of steps
 * @method animation.makeStepsButton
 * @param {ParamGui||ParamController} base
 * @param {string} text
 * @param {int} nSteps
 * @return buttonController
 */
animation.makeStepsButton = function(base, text, nSteps) {
    const buttonController = base.add({
        type: 'button',
        buttonText: text,
        onClick: function() {
            animation.advanceNSteps(nSteps);
        }
    });
    stepControllers.push(buttonController);
    return buttonController;
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

// control variables running, drawing, recording

// basic routines
// start, advance (step with drawing/recording), run, stop (control buttons)


// window.requestAnimationFrame(callback);
// time: date=new Date(), time=date.now() in msec
// timeoutId=setTimeout(function, milliseconds)
// clearTimeout(timeoutID)

/**
 * reset routine:
 * sets current frame to zero, initial frame to true
 * calls reset of the animationObject
 * for reset button and calls from the outside
 * the animated object has to check if a reset is really needed
 * @method animation.reset
 */


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
 * start the animation
 * disable interfering buttons
 * set drawing=true because we want to see the animation
 * @method animation.start
 */
animation.start = function() {
    if (!running) {
        startButton.setActive(false);
        stopButton.setActive(true);
        stepControllers.forEach(controller => controller.setActive(false));
        running = true;
        drawing = true;
        run();
    }
};



/**
 * stop the animation
 * enable all buttons
 * set running to false, clear timeout
 * @method animation.stop
 */
animation.stop = function() {
    if (running) {
        stopButton.setActive(false);
        startButton.setActive(true);
        stepControllers.forEach(controller => controller.setActive(true));
        running = false;
        clearTimeout(timeoutID);
    }
};