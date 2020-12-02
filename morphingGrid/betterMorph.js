/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    output

} from "../libgui/modules.js";

export const morph = {};

morph.draw = function() {
    output.isDrawing = true;
    output.pixels.update();
    const pixels = output.pixels;
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
    const mapWidth = (output.canvas.width - 1) * pixels.antialiasSubpixels + pixels.antialiasSampling;
    const mapHeight = (output.canvas.height - 1) * pixels.antialiasSubpixels + pixels.antialiasSampling;
    let scale = output.coordinateTransform.totalScale / output.pixels.antialiasSubpixels;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    let y = shiftY;
    for (var j = 0; j < mapHeight; j++) {
        let x = shiftX;
        for (var i = 0; i < mapWidth; i++) {
            let wave = Math.cos(x) * Math.cos(y);
            if (wave > 0) {
                output.pixels.array[index] = white;
            } else {
                output.pixels.array[index] = black;
            }
            index += 1;
            x += scale;
        }
        y += scale;
    }
    output.pixels.show();
};

morph.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'morphing grid',
        closed: false
    });
    morph.gui = gui;
    // create an output canvas
    output.createCanvas(gui, false, false);
    output.setCanvasWidthToHeight();
    output.createPixels();
    output.addImageProcessing();
    output.addAntialiasing();
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(-3.5 * Math.PI, -3.5 * Math.PI, 8 * Math.PI);
    output.drawCanvasChanged = morph.draw;
    morph.draw();
};