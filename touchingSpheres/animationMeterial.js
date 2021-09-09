/* jshint esversion: 6 */


import {
    output,
} from "../libgui/modules.js";

//            output.saveCanvasAsFile(output.saveName.getValue(), output.saveType.getValue());
const animation={};


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
 * wait to complete frame time and make next frame using animation.run
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
 * reset the animation
 * set frame number to one, for recording
 * set antialiasing, delete subframes (reset when chnging antialias)
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
};

/**
 * start animation only if 'pipeline' not already running
 * use if different animations are possible
 * @method animation.start
 */
animation.start = function() {
    if (!animation.isRunning) {
        animation.isRunning = true;
        animation.run();
    }
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
            // antialiasing: copy subframes from the canvas
            // and sample
            // put sampled data back to canvas
            const canvasContext = output.canvasContext;
            const width = output.canvas.width;
            const height = output.canvas.height;
            // after reset we have to create a new set of subframes
            console.log(animation.subframes.length);
            if (animation.subframes.length === 0) {
                animation.subframes.length = 2 * animation.antialiasing;
                for (let i = 0; i < animation.antialiasing; i++) {
                    animation.thing.draw();
                    animation.thing.advance();
                    animation.subframes[i + animation.antialiasing] = canvasContext.getImageData(0, 0, width, height);
                }
            }
            // shift up subframes and get new ones
            for (let i = 0; i < animation.antialiasing; i++) {
                animation.subframes[i] = animation.subframes[i + animation.antialiasing];
            }
            for (let i = 0; i < animation.antialiasing; i++) {
                animation.thing.draw();
                animation.thing.advance();
                animation.subframes[i + animation.antialiasing] = canvasContext.getImageData(0, 0, width, height);
            }
            // make gaussion averaging on the subframe data, put result on subframe0.data
            animation.sampling();
            canvasContext.putImageData(animation.subframes[0], 0, 0);

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
    } else {
        animation.isRunning = false;
    }
};


/**
 * a function that saves the canvas to file, suitable for animations
 * @method output.saveCanvasAsFile
 * @param {string} filename - without extension
 * @param {string} type - default'png', else use 'jpg' or 'png'
 * @param {function} callback - optional
 */
output.saveCanvasAsFile = function(filename, type = 'png', callback = function() {}) {
    if (output.canvas) {
        guiUtils.saveCanvasAsFile(output.canvas, filename, type, callback);
    } else {
        console.error("output.saveCanvasAsFile: there is no canvas!");
    }
};

 //   output.canvas = document.createElement("canvas");
  //  output.canvasContext = output.canvas.getContext("2d");
  //void ctx.drawImage(image, dx, dy, dWidth, dHeight);

  //    output.div.appendChild(output.canvas);
//        document.body.appendChild(theCanvas);
