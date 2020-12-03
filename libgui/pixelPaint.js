/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    output

} from "../libgui/modules.js";

/**
 * making pixel based images in a simple way
 * @namespace pixelPaint
 */

export const pixelPaint = {};

const intColor = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 0,
    alpha: 255
});

/**
 * function that defines the color of a pixel, depending on position in transformed space
 * @method pixelPaint.color
 * @param {number} x
 * @param {number} y
 * @return integer, 32 bit, defining the color
 */
pixelPaint.color = function(x, y) {
    return intColor;
};

/**
* drawing the image on pixels using the pixelPaint.color method (redefine)
* @method pixelPaint.draw
*/
pixelPaint.draw=function(){
    output.isDrawing = true;
    output.pixels.update();
    const pixels = output.pixels;
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
                output.pixels.array[index] = pixelPaint.color(x,y);
            index += 1;
            x += scale;
        }
        y += scale;
    }
    output.pixels.show();
};

/**
 * setup, making the gui, canvas with pixel and transform
 * you still have to set the initial coordinates
 * set canvas ratio
 * set and call drawing routine
 * @method pixelPaint.setup
 * @param {String} guiName
 * @param {boolean} hasTransparency - optional, default=true
 */
pixelPaint.setup = function(guiName, hasTransparency = true) {
    const gui = new ParamGui({
        name: 'guiName',
        closed: false
    });
    pixelPaint.gui = gui;
    // create an output canvas
    output.createCanvas(gui, hasTransparency, hasTransparency);
    output.createPixels();
    output.addImageProcessing();
    output.addAntialiasing();
    output.addCoordinateTransform(false);
    // output.drawCanvasChanged = morph.draw;
};