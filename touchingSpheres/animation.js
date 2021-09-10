/* jshint esversion: 6 */


import {
    output,
    guiUtils
} from "../libgui/modules.js";

import {
    mapping
} from './mapping.js';

import {
    display
} from './ui.js';

import {
    basics
} from './basics.js';

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
    animation.canvasContext.fillStyle = output.backgroundColorString;
    animation.canvasContext.fillRect(0, 0, animation.canvas.width, animation.canvas.height);
    animation.canvasContext.drawImage(output.canvas, 0, 0, animation.canvas.width, animation.canvas.height);
    const type = output.saveType.getValue();
    let filename = animation.frameNumber.toString(10);
    while (filename.length < animation.frameNumberDigits) {
        filename = '0' + filename;
    }
    filename = output.saveName.getValue() + filename;
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
    if (animation.isRunning) {
        animation.startOfFrame = Date.now();
        animation.stepsToDo -= 1;
        animation.isRunning = (animation.stepsToDo > 0);
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

animation.imageSphereGenerations = function() {
    let generation = mapping.drawGenController.getValue();
    display.draw();
    generation += 1;
    mapping.drawGenController.setValueOnly(generation);
};

animation.viewInterpolationSteps = 50;

animation.viewInterpolation = function() {
    display.transformSort();
    display.draw();
    mapping.viewInterpolationController.setValueOnly(basics.viewInterpolation + 1 / (animation.viewInterpolationSteps - 1));
};

animation.tiltSteps = 50;
animation.tiltEnd=180;

animation.tilt = function() {
    basics.tiltController.setValueOnly(basics.tiltAngle + animation.deltaTilt);
    display.transformSort();
    display.draw();
};

animation.rotationSteps = 50;
animation.rotationEnd=180;

animation.rotation = function() {
    basics.rotationController.setValueOnly(basics.rotationAngle + animation.deltaRotation);
    display.transformSort();
    display.draw();
};