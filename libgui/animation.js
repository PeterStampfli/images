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
var drawing=false;   // calling the animationObject.draw method after each animationObject.step, drawing frames
var recording=false;  // saving an animation, draw each frame and save as image with current ferame number
var frameNumberController; // shows the frame number and can be used to advance it
var currentFrameNumber = 0;
var initialFrame = true; // for drawing the first frame without doing a step
var stepControllers=[];   // collects all ui elements that might interfere with running the animation
var timeoutID;   // id for the timeout in the animation loop, for stopping it

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
        onChange: function(value) {
            while (currentFrameNumber < value) {
                currentFrameNumber += 1;
                animationObject.step();
            }
            animationObject.draw();
        }
    });
    stepControllers.push(frameNumberController);
    const startButton = gui.add({
        type: 'button',
        buttonText: 'run',
        labelText: 'control',
        onClick: animation.start
    });
    const stopButton = startButton.add({
        type: 'button',
        buttonText: 'stop',
        onClick: animation.stop
    });
    const resetButton = stopButton.add({
        type: 'button',
        buttonText: 'reset',
        onClick: function() {
            running = false;
            initialFrame = true;
            frameNumberController.setMin(0);
            frameNumberController.setValueOnly(0);
            animationObject.reset();
            animationObject.draw();
        }
    });
    stepControllers.push(resetButton);
};

/**
* make a given number of steps
* without drawing, except for the last step
* including the possibility of recording
* @method animation.advanceNSteps
* @param {integer} nSteps
*/
animation.advanceNSteps=function(nSteps){
    if (nSteps>0){
        
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
            initialFrame = false;
            for (var i = 0; i < nSteps; i++) {
                animationObject.step();
            }
            animationObject.draw();
        }
    });
        stepControllers.push(buttonController);
    return buttonController;
};



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

/**
* start the animation
* disable interfering buttons
* set drawing=true because we want to see the animation
* @method animation.start
*/
animation.start=function(){
    stepControllers.forEach(controller=>controller.setActive(false));
running = true;
            drawing=true;
            animation.run();
};

/**
* advance the animation (doing a step)
* make step if not initial frame, draw frame if drawing
 * if recording write frame to file (framenumber)
 * @method animation.advance
 */
 animation.advance=function(){
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
        if (drawing){
        animationObject.draw();
    }
 }

/**
 * run the animations, that means
 note time
 * advance animation
 * calculate remaining time from fps
 * start time delay, request animation frame for next frame
 * @method animation.run
 */
animation.run = function() {
    if (running) {
        // all times in msec
        const frameTime = 1000 / 60;
        const deltaTime = 1000 / animation.fps - frameTime;
        // do the current frame
        const startTime = Date.now();
animation.advance();
        const endTime = Date.now();
        // prepare next frame
        timeoutID=setTimeout(function() {
            requestAnimationFrame(animation.run);
        }, deltaTime - (endTime - startTime) - frameTime);
    }
};

/**
* stop the animation
* enable all buttons
* set running to false, clear timeout
* @method animation.stop
*/
animation.stop=function(){
    stepControllers.forEach(controller=>controller.setActive(true));
running=false;
clearTimeout(timeoutID);
};