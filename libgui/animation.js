/* jshint esversion: 6 */
import {
    guiUtils,
    ParamController,
    output
}
from "./modules.js";

/**
 * animation
 * including recording
 * @namespace animation
 */

export const animation = {};

// controllers
//=========================
// defined outside, depending on the thing to animate
// boolean, switch recording on and of
animation.recordingController = null;
// boolean, run or suspend animation
animation.runningController = null;
// limiting the animation speed
animation.fpsController = null;

/**
* set the controllers
* @method animation.setControllers
* @param {controller} runningController
* @param {controller} recordingController
* @param {controller} fpsController
*/
animation.setControllers=function(runningController,recordingController,fpsController){
animation.runningController=runningController;
animation.recordingController=recordingController;
animation.fpsController=fpsController;
};

/**
* check if animation uses given runningController
* and thus does the related animation
* @method animation.usingRunningController
* @param {controller} runningController
* @return boolean, true if the runningController is used as such
*/
animation.usingRunningController=function(runningController){
 return animation.runningController=runningController;
};

// variables
//==========================
// number of digits for frame numbers
animation.frameNumberDigits = 5;
// the current frame number
animation.frameNumber = 0;

// functions
//===================
// define outside, depening on thing to animate
// make an image of the thing on the output canvas
animation.draw=function(){};
// advance the parameters of the thing
animation.advance=function(){};
// return true if animation is finished
animation.isFinished = function() {
    return true;
};
// make a step number message
animation.makeMessage=function(){};

/**
* set the functions
* @method animation.setFunctions
* @param {function} draw
* @param {function} advance
* @param {function} isFinished
* @param {function} makeMessage
*/
animation.setFunctions=function(step,advance,isFinished,makeMessage){
animation.draw=draw;
animation.advance=advance;
animation.isFinished=isFinished;
animation.makeMessage=makeMessage;
};

//============================================================

/**
 * make name for file with frame image, numbered, no file type
 * @method output.makeFrameFileName
 * @return String
 */
animation.makeFrameFileName = function() {
    let result = output.animationStep.toString(10);
    while (result.length < output.frameNumberDigits) {
        result = '0' + result;
    }
    result = output.saveName.getValue() + result;
    return result;
};

/**
* make an animation step
* use this method initially and as a callback of the timeout/animationframe combination
* check if animation still running (else do nothing)
* draw the image on canvas

*/
