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
    gui.add({
        type: 'number',
        max: 60,
        params: animation,
        property: 'fps'
    });
};

// window.requestAnimationFrame(callback);
// time: date=new Date(), time=date.now() in msec
// setTimeout(function, milliseconds)

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
            for (var i = 0; i < nSteps; i++) {
                obj.step();
            }
            obj.draw();
        }
    });
    if (base instanceof ParamController){
        buttonController.setMinLabelWidth(0);
    }
    return buttonController;
};