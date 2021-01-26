/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    output

} from "./modules.js";

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
 * updating pixels
 * drawing the image on pixels using the pixelPaint.color method (redefine)
 * put pixels on canvas
 * @method pixelPaint.draw
 */
pixelPaint.draw = function() {
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
            pixels.array[index] = pixelPaint.color(x, y);
            index += 1;
            x += scale;
        }
        y += scale;
    }
    output.pixels.show();
};

/**
 * update pixel and fill with color, does not show pixels
 * @method pixelPaint.fill
 * @param {integer} intColor - color as integer value, (use Pixels.integerOfColor)
 */
pixelPaint.fill = function(intColor) {
    output.isDrawing = true;
    output.pixels.update();
    output.pixels.array.fill(intColor);
};

/**
 * scan a trapeze and call a function for each pixel
 * parallels of trapeze are horizontal
 * action(x,y,index) does something, 
 * (x,y) are transformed image coordinates, 
 * index is index of pixel (or similar data)
 * trapeze coordinates are image coordinates
 * @method pixelPaint.scanTrapeze
 * @param {number} bottom
 * @param {number} bottomLeft
 * @param {number} bottomRight
 * @param {number} top
 * @param {number} topLeft
 * @param {number} topRight
 * @param {function} action
 */
pixelPaint.scanTrapeze = function(bottom, bottomLeft, bottomRight, top, topLeft, topRight, action) {
    // transform to canvas (pixel coordinates), and check if visible
    const coordinateTransform = output.coordinateTransform;
    const totalScale = coordinateTransform.totalScale;
    const shiftX = coordinateTransform.shiftX;
    const shiftY = coordinateTransform.shiftY;
    const width = output.canvas.width;
    bottom = coordinateTransform.inverseY(bottom);
    if (bottom > output.canvas.height) { // visible range goes from 0 ... canvas.height-1
        return;
    }
    top = coordinateTransform.inverseY(top);
    if (top + 1 < 0) {
        return;
    }
    const eps = 0.001;
    if (top - bottom < eps) {
        return;
    }
    bottomLeft = coordinateTransform.inverseX(bottomLeft);
    bottomRight = coordinateTransform.inverseX(bottomRight);
    topLeft = coordinateTransform.inverseX(topLeft);
    topRight = coordinateTransform.inverseX(topRight);
    const limitLeft = Math.min(topLeft, bottomLeft);
    if (limitLeft > width) {
        return;
    }
    const limitRight = Math.max(topRight, bottomRight);
    if (limitRight + 1 < 0) {
        return;
    }
    // determine slopes
    const mLeft = (topLeft - bottomLeft) / (top - bottom);
    const mRight = (topRight - bottomRight) / (top - bottom);
    // determine j-range
    const jLow = Math.max(Math.floor(bottom), 0);
    const jHigh = Math.min(Math.floor(top) + 1, output.canvas.height - 1);
    // do the lines
    let y = shiftY + totalScale * jLow;
    for (let j = jLow; j <= jHigh; j++) {
        // left and right limits
        let iLeft = Math.max(limitLeft, bottomLeft + mLeft * (j - bottom));
        let iRight = Math.min(limitRight, bottomRight + mRight * (j - bottom));
        if ((iLeft < width) && (iRight >= 0)) {
            iLeft = Math.max(0, Math.floor(iLeft));
            iRight = Math.min(width, Math.floor(iRight) + 1);
            let x = shiftX + totalScale * iLeft;
            let index = width * j + iLeft;
            for (let i = iLeft; i <= iRight; i++) {
                action(x, y, index);
                x += totalScale;
                index += 1;
            }
        }
        y += totalScale;
    }
};

/**
 * scan a triangle and call a function for each pixel
 * action(x,y,index) does something, 
 * (x,y) are transformed image coordinates, 
 * index is index of pixel (or similar data)
 * triangle coordinates are image coordinates
 * @method pixelPaint.scanTriangle
 * @param {number} aX
 * @param {number} aY
 * @param {number} bX
 * @param {number} bY
 * @param {number} cX
 * @param {number} cY
 * @param {function} action
 */
pixelPaint.scanTriangle = function(aX, aY, bX, bY, cX, cY, action) {
    // sorting a above b above c
    if (cY > bY) {
        let h = bY;
        bY = cY;
        cY = h;
        h = bX;
        bX = cX;
        cX = h;
    }
    if (bY > aY) {
        let h = bY;
        bY = aY;
        aY = h;
        h = bX;
        bX = aX;
        aX = h;
    }
    if (cY > bY) {
        let h = bY;
        bY = cY;
        cY = h;
        h = bX;
        bX = cX;
        cX = h;
    }
    console.log(aY, bY, cY);
    const eps = 0.001;
    if (aY - cY > eps) {
        // cut into two trapezes at height of point b
        let dX = cX + (aX - cX) * (bY - cY) / (aY - cY);
        // correct ordering
        if (bX > dX) {
            let h = bX;
            bX = dX;
            dX = h;
        }
        pixelPaint.scanTrapeze(cY, cX, cX, bY, bX, dX, action);
        pixelPaint.scanTrapeze(bY, bX, dX, aY, aX, aX, action);
    }
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
        name: guiName,
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