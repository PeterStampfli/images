/* jshint esversion: 6 */

import {
    CoordinateTransform,
    ParamGui,
    Pixels,
    guiUtils,
    output
} from "../libgui/modules.js";

export const morph = {};
const map = {};

morph.nPeriods = 4;

morph.draw = function(mix = 0.5) {
    if (mix > 1) {
        mix = 2 - mix;
    }
    output.pixels.update();

    const canvas = output.canvas;
    const height = canvas.height;
    const width = canvas.width;
    const scale = 2 * Math.PI * morph.nPeriods / width;
    const pi2 = Math.PI / 2;

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
    const color = {
        red: 0,
        green: 0,
        blue: 0,
        alpha: 255
    };
    const width2 = width / 2;
    const height2 = height / 2;
    const rt2 = Math.sqrt(0.5);

    let index = 0;
    var x, y;
    for (var j = 0; j < height; j++) {
        y = scale * (j - height2) - pi2;
        for (var i = 0; i < width; i++) {
            x = scale * (i - width2) - pi2;

            let wave1 = Math.cos(x) * Math.cos(y);
            let wave2 = Math.cos((x + y) * rt2) * Math.cos((x - y) * rt2);

            let wave = mix * wave2 + (1 - mix) * wave1;
            if (mode > 0) {
                if (mix * Math.abs(wave2) > (1 - mix) * Math.abs(wave1)) {
                    wave = wave2;
                } else {
                    wave = wave1;
                }
            }


            if (wave > 0) {
                output.pixels.array[index] = white;
            } else {
                output.pixels.array[index] = black;
            }


            index += 1;
        }
    }

    output.pixels.show();

};


const canvasSize = 512;
const mixStart = 0.0;
const fps = 10;
const mode = 1;
let frame = 0;
const filename = 'anim';
const recording = true;


// make frame number with fixed number of digits
function makeFrameNumber() {
    let result = frame.toString(10);
    while (result.length < output.frameNumberDigits) {
        result = '0' + result;
    }
    return result;
}

morph.animationStep = function() {
    const minimumFrameTime = 1000 / fps - 1000 / 60; // always defined, even without animation
    const startOfFrame = Date.now();
    morph.draw(morph.mix);
    var delta;
    if (morph.mix<0.05){
delta=morph.step/8;
    } else   if (morph.mix<0.1){
delta=morph.step/3;
    } else   if (morph.mix<0.2){
delta=morph.step/1.5;
    } else   if (morph.mix<0.8){
delta=morph.step;
    } else   if (morph.mix<0.9){
delta=morph.step/1.5;
    } else   if (morph.mix<0.95){
delta=morph.step/3;
    } else   if (morph.mix<1.05){
delta=morph.step/12
    } else   if (morph.mix<1.1){
delta=morph.step/3
    } else   if (morph.mix<1.2){
delta=morph.step/1.5
    } else   if (morph.mix<1.8){
delta=morph.step;
    } else   if (morph.mix<1.9){
delta=morph.step/1.5
    } else   if (morph.mix<1.95){
delta=morph.step/3
    } else {
        delta=morph.step/8;
    }
    morph.mix += delta;
    morph.mix=Math.round(morph.mix*1000)/1000;
    frame += 1;
    if (morph.mix <= morph.end + 0.00001) {
        if (recording) {
            guiUtils.saveCanvasAsFile(output.canvas, filename + makeFrameNumber(), 'jpg',
                function() {
                    const timeUsed = Date.now() - startOfFrame;
                    // prepare next frame
                    setTimeout(function() {
                        requestAnimationFrame(function() {
                            morph.animationStep();
                        });
                    }, minimumFrameTime - timeUsed);
                });


        } else {
            const timeUsed = Date.now() - startOfFrame;
            setTimeout(function() {
                requestAnimationFrame(function() {
                    morph.animationStep();
                });
            }, minimumFrameTime - timeUsed);
        }
    }
    else {
        console.log(morph.mix,morph.end,frame);
    }

};

morph.animate = function(step, end) {
    morph.step = step;
    morph.end = end;
    morph.animationStep();
};

morph.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'Kochflakes',
        closed: false
    });
    morph.gui = gui;
    // create an output canvas
    output.createCanvas(gui);
    output.setCanvasWidthToHeight();
    output.canvasWidthController.setValue(canvasSize);
    output.createPixels();
    output.drawCanvasChanged = morph.draw;
    output.startDrawing();

    morph.mix = mixStart;
    morph.draw(morph.mix);
    const step = 0.0125;
    morph.animate(step,2);
};