/* jshint esversion: 6 */

import {
    CoordinateTransform,
    ParamGui,
    Pixels,
    guiUtils,
    output
} from "../libgui/modules.js";

export const morph = {};

morph.nPeriods = 4;

morph.x=0.5;

// drawing
morph.draw = function() {
    output.pixels.update();
    const canvas = output.canvas;
    const height = canvas.height;
    const width = canvas.width;
    const scale = 2 * Math.PI * morph.nPeriods / width;
    const pi2 = Math.PI / 2;
    const mix=1-Math.cos(morph.x*pi2);
    console.log(mix,morph.pi);
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

// setup parameters
const canvasSize=512;

morph.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'morphing grid',
        closed: false
    });
    morph.gui = gui;
    // create an output canvas
    output.createCanvas(gui,false,false);
 //   output.setCanvasWidthToHeight();
    output.canvasWidthController.setValue(canvasSize);
    output.createPixels();
    output.addAntialiasing();
    output.drawCanvasChanged = morph.draw;
    output.startDrawing();
    morph.draw();
};