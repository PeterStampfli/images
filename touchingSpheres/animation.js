/* jshint esversion: 6 */


import {
    output,
    guiUtils
} from "../libgui/modules.js";

import {
    mapping
} from './mapping.js';

export const animation = {};

animation.frameNumber = 1;
animation.frameNumberDigits = 4;
animation.frameTime = 100; // in msecs
animation.smoothing = 2;
animation.isRecording = false;
animation.isRunning = false;
animation.startFrameNumber = 1;
animation.canvas = document.createElement("canvas");
document.body.appendChild(animation.canvas);
animation.canvas.style.display = 'none';
animation.canvasContext = animation.canvas.getContext("2d");

function record(callback = function() {}) {
    animation.canvasContext.drawImage(output.canvas, 0, 0, animation.canvas.width, animation.canvas.height);
    let filename = animation.frameNumber.toString(10);
    while (filename.length < animation.frameNumberDigits) {
        filename = '0' + filename;
    }
    filename = output.saveName.getValue() + filename;
    const type = output.saveType.getValue();
    console.log(filename, type);
    guiUtils.saveCanvasAsFile(animation.canvas, filename, type, callback);
    animation.frameNumber += 1;
    callback();
}

// drawFrame is a function that draws the frame with current parameters
// advances parameters, and sets animation.isRunning=false at last frame

function dummy() {
    animation.isRunning = false;
}

// step: draw the frame, record if recording
// in both cases: goes to next frame

function step() {
    console.log('step');
    if (animation.isRunning) {
        animation.startOfFrame = Date.now();
        animation.drawFrame();
        if (animation.isRecording) {
            record(nextFrame);
        } else {
            nextFrame();
        }
    }
}

// next frame: setup time delay and animation frame request

function nextFrame() {
    console.log('nextframe');
    if (animation.isRunning) {
        const timeUsed = Date.now() - animation.startOfFrame;
        setTimeout(function() {
            requestAnimationFrame(step);
        }, Math.max(0, animation.frameTime - timeUsed));
    }
}

animation.start = function(drawFrame = dummy) {
    animation.canvas.width = output.canvas.width / animation.smoothing;
    animation.canvas.height = output.canvas.height / animation.smoothing;
    animation.frameNumber = animation.startFrameNumber;
    animation.drawFrame = drawFrame;
    animation.isRunning = true;
    step();
};

var counter = 10;

animation.imageSphereGenerations = function() {
    let generation=mapping.drawGenController.getValue();
    console.log(generation);
    if (counter < 0) {
        animation.isRunning = false;
    } else {
        counter -= 1;
    }
    console.log(animation.isRunning, counter);
// mapping.minGeneration
// mapping.drawGenController
};