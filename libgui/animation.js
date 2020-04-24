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

var gui, obj;
var running=false;
var frameNumberController;
var initialFrame=true;            // for drawing the first frame without doing a step

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
    obj = theObject;
};

/**
 * make the user interface and save the gui reference for more
 * @method animation.createUI
 * @param {ParamGui} theGui
 */
animation.createUI = function(theGui) {
    gui = theGui;
    const fpsController=gui.add({
        type: 'number',
        params: animation,
        property: 'fps',
        labelText:'speed (fps)',
        max: 60,
        step: 0.1,
        min:0.1,
    });
    frameNumberController=fpsController.add({
        type:'number',
        initialValue:0,
        labelText:'frame number'
    });
const startButton=gui.add({
    type:'button',
    buttonText:'run',
    labelText:'control',
    onClick: function(){
        running=true;
        animation.run();
    }
});
    const stopButton=startButton.add({
    type:'button',
    buttonText:'stop',
    onClick: function(){
        running=false;
    }
});
        const resetButton=stopButton.add({
    type:'button',
    buttonText:'reset',
    onClick: function(){
        running=false;
        initialFrame=true;
        frameNumberController.setMin(0);
        frameNumberController.setValueOnly(0);
        obj.reset();
        obj.draw();
    }
});

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
            initialFrame=false;
            for (var i = 0; i < nSteps; i++) {
                obj.step();
            }
            obj.draw();
        }
    });
    if (base instanceof ParamController) {
        buttonController.setMinLabelWidth(0); // multiple buttons on a line: small distance
    }
    return buttonController;
};

/**
 * run the animations, that means
 * note time, make step, draw frame
 * if recording write frame to file (framenumber, check if end reached)
 * calculate remaining time from fps
 * start time delay, request animation frame for next frame
 * @method animation.run
 */
animation.run = function() {
    if (running){
    // all times in msec
    const frameTime = 1000 / 60;
    const deltaTime = 1000 / animation.fps - frameTime;
    // do the current frame
    const startTime = Date.now();
    let frameNumber=frameNumberController.getValue();
  if (initialFrame){
    initialFrame=false;     // draw once the original configuration (frame 0)
  } 
  else {
    frameNumber+=1;
    frameNumberController.setValueOnly(frameNumber);
    frameNumberController.setMin(frameNumber);
     obj.step();   
  } 
      obj.draw();
    const endTime = Date.now();
    // prepare next frame
    setTimeout(function() {
        requestAnimationFrame(animation.run);
    }, deltaTime - (endTime - startTime) - frameTime);
}
};







// window.requestAnimationFrame(callback);
// time: date=new Date(), time=date.now() in msec
// setTimeout(function, milliseconds)