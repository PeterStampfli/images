/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    output,
    animation,
    BooleanButton

} from "../libgui/modules.js";

export const morph = {};

// drawing the image: constants
const white = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});
const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});
const rt2 = Math.sqrt(0.5);

//drawing the image: doing it
// mix goes from 0 to 1
// time goes from 0 to 2, typically
// mix=(1-Math.cos(time*Math.PI))/2
let mix = 0.5;
let time = 2.5; // time > 2 animation finished

pixelPaint.color = function(x, y) {
    let wave1 = Math.cos(x) * Math.cos(y);
    let wave2 = Math.cos((x + y) * rt2) * Math.cos((x - y) * rt2);
    let wave = mix * wave2 + (1 - mix) * wave1;
    if (wave > 0) {
        return white;
    } else {
        return black;
    }
};

// animation functions
morph.startTime = 0;
morph.endTime = 2; // animation finished for larger time values
morph.recording = false;
morph.animationRunning = false;
morph.animationNSteps = 100;
morph.dTime = (morph.endTime - morph.startTime) / morph.animationNSteps;
morph.animationFps = 10;


animation.usesThing(morph);

morph.getFps = function() {
    return morph.animationFps;
};

morph.isRecording = function() {
    return morph.recording;
};

morph.isRunning = function() {
    return morph.animationRunning;
};

morph.draw = function() {
    mix = (1 - Math.cos(time * Math.PI)) / 2;
    pixelPaint.draw();
};

morph.advance = function() {
    morph.animationStepMessage.innerText = 'steps done: ' + animation.frameNumber;
    morph.time += morph.dTime;
    if (morph.time > morph.endTime) {
        morph.isRunning = false;
    }
};

morph.setup = function() {
    pixelPaint.setup('morphing', false);
    const gui = pixelPaint.gui;
    output.setCanvasWidthToHeight();
    output.setInitialCoordinates(-1.5 * Math.PI, -1.5 * Math.PI, 8 * Math.PI);
    output.drawCanvasChanged = pixelPaint.draw;
    morph.draw();
    pixelPaint.gui.addParagraph("animation:");
    morph.animationResetButton = gui.add({
        type: 'button',
        buttonText: 'reset',
        onClick: function() {
            morph.animationRunning = false;
            animation.reset();
            morph.time = 0;
            morph.animationStepMessage.innerText = 'steps done: ' + 0;
        }
    });

    // run animation: initialize params
    morph.animationRunningButton = morph.animationResetButton.add({
        type: 'button',
        buttonText: 'run',
        onClick: function() {
            if (morph.animationRunning) {
                // animation is running, thus stop it
                // now pressing button again would start it
                morph.animationRunningButton.setButtonText('run');
                morph.animationRunning = false;
            } else {
                // animation not running, start it
                // pressing button again would now stop it
                morph.animationRunningButton.setButtonText('stop');
                morph.animationRunning = true;
                if (morph.time > morph.endTime) {
                    animation.reset();
                    morph.time = 0;
                    morph.animationStepMessage.innerText = 'steps done: ' + 0;
                }
                morph.dTime = (morph.endTime - morph.startTime) / morph.animationNSteps;
                console.log('dTime', morph.dTime);
                //animation.run();
            }
        }
    });

    BooleanButton.greenRedBackground();
    morph.animationRecordingButton = gui.add({
        type: 'boolean',
        labelText: 'recording',
        params: output,
        property: 'animationRecording'
    });
    morph.animationNStepsController = gui.add({
        type: 'number',
        params: morph,
        property: 'animationNSteps',
        labelText: 'total steps',
        min: 1,
        step: 1
    });
    morph.animationFpsController = morph.animationNStepsController.add({
        type: 'number',
        params: output,
        property: 'animationFps',
        labelText: 'fps',
        min: 1
    });
    morph.animationStepMessage = gui.addParagraph('steps done: ' + 0);


    console.log(morph.getFps());
    console.log(morph.isRecording());
};