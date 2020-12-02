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

animation.frameNumberDigits=5;
animation.frameNumber=0;

/**
* set the thing to animate
* @method animation.setThing
* @param {object} thing
*/
animation.setThing=function(thing){
	animation.thing=thing;
};

/**
* check if given thing is used
* @method animation.usesThing
* @param {object} thing
* @return boolean, true if thing used
*/
animation.usesThing=function(thing){
	return animation.thing===thing;
};

/*
* uses methods:
* thing.draw() - draws its image on the output canvas
* thing.advance() - advance the animation of the thing
* thing.isRunning() - return true if animation of thing runs, not finished or stopped
* thing.isRecording() - return true if animation should be saved
* thing.getFps() - returns the frame rate
*/

/*
* has methods:
* animation.reset() - begin a new animation, frame number === 0
* animation.run() - run the animation
*/

//============================================================

/**
 * make name for file with frame image, numbered, no file type
 * @method output.makeFrameFileName
 * @return String
 */
animation.makeFrameFileName = function() {
    let result = animation.frameNumber.toString(10);
    while (result.length < animation.frameNumberDigits) {
        result = '0' + result;
    }
    result = output.saveName.getValue() + result;
    return result;
};

/**
* reset the animation
* set frame number to zero, for recording
*/

/**
* make an animation, step/run animation
* use this method initially and as a callback of the timeout/animationframe combination
* check if animation still running (else do nothing)
* determine time
* draw the image on canvas
* advance thing
* if recording: save image, callback to timeout/animation that has this method as callback
* if not recording call timeout/animation
* time delay depend on fps and time used for frame
*/
