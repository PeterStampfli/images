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

/**
 * reset the animation
 * set frame number to one, for recording
 * set antialiasing, initialize subframes if required
 * NOTE: Changing thing.antialias has only effect after reset
 * @method animation.reset
 */
animation.reset = function() {
    animation.frameNumber = 1;
    animation.antialiasing = !!animation.thing.antialiasing;
    console.log(animation.antialiasing);
    animation.subframe0 = null;
    animation.subframe1 = null;
    animation.subframe2 = null;
    animation.subframe3 = null;
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
        if (animation.antialiasing) {
            const canvasContext = output.canvasContext;
            const width = output.canvas.width;
            const height = output.canvas.height;
            // after reset we have to create a new set of subframes
            if (animation.subframe0 === null) {
                animation.thing.draw();
                animation.thing.advance();
                animation.subframe2 = canvasContext.getImageData(0, 0, width, height);
                animation.thing.draw();
                animation.thing.advance();
                animation.subframe3 = canvasContext.getImageData(0, 0, width, height);
            }
            // reusing 2 subframes and calculating new ones
            animation.subframe0 = animation.subframe2;
            animation.subframe1 = animation.subframe3;
            animation.thing.draw();
            animation.thing.advance();
            animation.subframe2 = canvasContext.getImageData(0, 0, width, height);
            animation.thing.draw();
            animation.thing.advance();
            animation.subframe3 = canvasContext.getImageData(0, 0, width, height);

            // make gaussion 1 4 4 1 averaging on the subframe data, put result on subframe0.data
            canvasContext.putImageData(animation.subframe0, 0, 0);

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