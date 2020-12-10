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

animation.frameNumberDigits = 5;
animation.frameNumber = 0;
animation.thing = null;
animation.subframes = [];

/**
 * reset the animation
 * set frame number to one, for recording
 * set antialiasing, initialize subframes if required
 * NOTE: Changing thing.antialias has only effect after reset
 * @method animation.reset
 */
animation.reset = function() {
    animation.frameNumber = 1;
    if (guiUtils.isFunction(animation.thing.getAntialiasing)) {
        animation.antialiasing = animation.thing.getAntialiasing();
    } else {
        animation.antialiasing = 1;
    }
    animation.subframes.length = 0;
    console.log(animation.antialiasing);
};

/**
 * set the thing to animate
 * @method animation.setThing
 * @param {object} thing
 */
animation.setThing = function(thing) {
    if (animation.thing !== thing) {
        animation.thing = thing;
        animation.reset();
    }
};

/**
 * check if given thing is used
 * @method animation.usesThing
 * @param {object} thing
 * @return boolean, true if thing used
 */
animation.usesThing = function(thing) {
    return animation.thing === thing;
};

/*
 * uses methods:
 * thing.draw() - draws its image on the output canvas
 * thing.advance() - advance the animation of the thing
 * thing.isRunning() - return true if animation of thing runs, not finished or stopped
 * thing.isRecording() - return true if animation should be saved
 * thing.getFps() - returns the frame rate
 * thing.getAntialiasing() - returns number of antialiasing subframes, 1 means no antialiasing
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
 * wait to complete frame time and make next frame
 * @method animation.makeNextFrame
 */
animation.makeNextFrame = function() {
    const minimumFrameTime = 1000 / Math.max(animation.thing.getFps(), 1) - 1000 / 60;
    const timeUsed = Date.now() - animation.startOfFrame;
    const remainingTime = Math.max(0, minimumFrameTime - timeUsed);
    setTimeout(function() {
        requestAnimationFrame(function() {
            animation.run();
        });
    }, minimumFrameTime - timeUsed);
};

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
 * @method animation.run
 */
animation.run = function() {
    if (animation.thing.isRunning()) {
        animation.startOfFrame = Date.now();
        if (animation.antialiasing > 1) {
            const canvasContext = output.canvasContext;
            const width = output.canvas.width;
            const height = output.canvas.height;
            // after reset we have to create a new set of subframes
            if (animation.subframes.length === 0) {
                animation.subframes.length = 2 * animation.antialiasing;
                for (let i = 0; i < animation.antialiasing; i++) {
                    animation.thing.draw();
                    animation.thing.advance();
                    console.log(i + animation.antialiasing);
                    animation.subframes[i + animation.antialiasing] = canvasContext.getImageData(0, 0, width, height);
                }
            }
            // shift up subframes and get new ones
                 for (let i = 0; i < animation.antialiasing; i++) {
                    console.log(i,i + animation.antialiasing);
                    animation.subframes[i] = animation.subframes[i + animation.antialiasing] ;
                }
                 for (let i = 0; i < animation.antialiasing; i++) {
                    animation.thing.draw();
                    animation.thing.advance();
                    console.log(i + animation.antialiasing);
                    animation.subframes[i + animation.antialiasing] = canvasContext.getImageData(0, 0, width, height);
                }
   
            // make gaussion 1 4 4 1 averaging on the subframe data, put result on subframe0.data
            //        canvasContext.putImageData(animation.subframe0, 0, 0);

        } else {
            animation.thing.draw();
            animation.thing.advance();
        }
        if (animation.thing.isRecording()) {
            const name = animation.makeFrameFileName();
            animation.frameNumber += 1;
            const type = output.saveType.getValue();
            guiUtils.saveCanvasAsFile(output.canvas, name, type,
                function() {
                    animation.makeNextFrame();
                });

        } else {
            animation.frameNumber += 1;
            animation.makeNextFrame();
        }
    }
};