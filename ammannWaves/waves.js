/* jshint esversion:6 */

// quasiperiodic wave packets

import {
    output
} from "../libgui/modules.js";

import {
    map,
    julia
} from "../mappings/mapImage.js";

export const waves = {};
waves.rescale = false;
waves.symmetry = 8;
waves.offset = 0;
waves.asymOffset = 0;
waves.scale = 0.414;
waves.colorMod = 0.2;
waves.drawOn=true;
let colorModArray = new Float32Array(1);

// the different wave packages

waves.nothing = function() {};

waves.scalingSum = function() {
    const symmetry = waves.symmetry;
    const scale = waves.scale;
    const sines = [];
    const cosines = [];
    var dAngle, offset, nDirections;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    if (colorModArray.length !== yArray.length) {
        colorModArray = new Float32Array(yArray.length);
    }
    // setting up the directions
    if ((symmetry & 1) !== 0) {
        offset = Math.PI / 2 * (waves.offset + 1);
        nDirections = symmetry
    } else {
        offset = Math.PI / 2 * waves.offset;
        nDirections = symmetry / 2;
    }
    sines.length = nDirections;
    cosines.length = nDirections;
    dAngle = 2 * Math.PI / symmetry;
    for (let n = 0; n < nDirections; n++) {
        sines[n] = Math.sin(n * dAngle);
        cosines[n] = Math.cos(n * dAngle);
    }
    // make values and determine range
    for (let index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        let xNew = Math.cos(x + offset);
        for (let n = 1; n < nDirections; n++) {
            xNew += Math.cos(x * cosines[n] + y * sines[n] + offset);
        }
        x *= scale;
        y *= scale;
        let yNew = Math.cos(x + offset);
        for (let n = 1; n < nDirections; n++) {
            yNew += Math.cos(x * cosines[n] + y * sines[n] + offset);
        }
        x *= scale;
        y *= scale;
        let s = Math.cos(x + offset);
        for (let n = 1; n < nDirections; n++) {
            s += Math.cos(x * cosines[n] + y * sines[n] + offset);
        }
        xArray[index] = xNew;
        yArray[index] = yNew;
        colorModArray[index] = s;
    }
};

waves.scalingProd = function() {
    const symmetry = waves.symmetry;
    const scale = waves.scale;
    const sines = [];
    const cosines = [];
    var dAngle, offset, nDirections;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
   if (colorModArray.length !== yArray.length) {
        colorModArray = new Float32Array(yArray.length);
    }
    // setting up the directions
    if ((symmetry & 1) !== 0) {
        offset = Math.PI / 2 * (waves.offset + 1);
        nDirections = symmetry
    } else {
        offset = Math.PI / 2 * waves.offset;
        nDirections = symmetry / 2;
    }
    sines.length = nDirections;
    cosines.length = nDirections;
    dAngle = 2 * Math.PI / symmetry;
    for (let n = 0; n < nDirections; n++) {
        sines[n] = Math.sin(n * dAngle);
        cosines[n] = Math.cos(n * dAngle);
    }
    // make values and determine range
    for (let index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        let xNew = Math.cos(x + offset);
        for (let n = 1; n < nDirections; n++) {
            xNew *= Math.cos(x * cosines[n] + y * sines[n] + offset);
        }
        x *= scale;
        y *= scale;
        let yNew = Math.cos(x + offset);
        for (let n = 1; n < nDirections; n++) {
            yNew *= Math.cos(x * cosines[n] + y * sines[n] + offset);
        }
        x *= scale;
        y *= scale;
        let s = Math.cos(x + offset);
        for (let n = 1; n < nDirections; n++) {
            s *= Math.cos(x * cosines[n] + y * sines[n] + offset);
        }
        xArray[index] = xNew;
        yArray[index] = yNew;
        colorModArray[index] = s;
    }
};

waves.drawImageHighQuality = function() {
    const colorMod = waves.colorMod;
    map.drawingInputImage = true;
    map.inputImageControllersShow(); // make sure we have an input image, if not: load and use it in a callback
    if (!map.inputImageLoaded) {
        map.inputImageLoaded = true;
        map.loadInputImage();
    } else {
        map.sizeArrayUpdate();
        const totalScale = map.inputTransform.totalScale;
        map.setupMapImageTransform();
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        const inputImageControlCanvasScale = map.inputImageControlCanvasScale;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        const color = {
            red: 0,
            green: 128,
            blue: 0,
            alpha: 255
        };
        const point = {};
        for (var index = 0; index < length; index++) {
            point.x = xArray[index];
            point.y = yArray[index];
            map.inputTransform.transform(point);
            let size = totalScale * map.sizeArray[index];
            map.inputPixels.getHighQualityColor(color, point.x, point.y, size);
            const colorModFactor = colorMod * colorModArray[index];
            if (colorModFactor > 0) {
                const x = Math.min(1, colorModFactor);
                const xc = 1 - x;
                color.red = Math.round(xc * color.red + 255 * x);
           //     color.blue = Math.round(xc * color.blue + 255 * x);
                color.green = Math.round(xc * color.green + 255 * x);
            } else {
                const x = Math.max(0, 1 + colorModFactor);
                color.red = Math.round(x * color.red);
           //     color.blue = Math.round(x * color.blue);
                color.green = Math.round(x * color.green);
            }
            output.pixels.setColorAtIndex(color, index);
            map.controlPixels.setOpaque(inputImageControlCanvasScale * point.x, inputImageControlCanvasScale * point.y);
        }
        map.controlPixels.show();
        output.pixels.show();
    }
};

waves.type = waves.scalingSum;

waves.setup = function(gui) {
     gui.addParagraph('<strong>waves</strong>');
  
    gui.add({
        type: 'selection',
        params: waves,
        property: 'type',
        options: {
            'scaling sum': waves.scalingSum,
            'scaling prod': waves.scalingProd,
            'nothing': waves.nothing
        },
        onChange: function() {
            map.inputTransformValid = !waves.rescale;
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: waves,
        property: 'offset',
        onChange: function() {
            map.inputTransformValid = !waves.rescale;
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'boolean',
        params: waves,
        property: 'drawOn',
        labelText:'draw waves',
        onChange: function() {
            map.inputTransformValid = !waves.rescale;
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: waves,
        property: 'colorMod',
        onChange: function() {
            map.inputTransformValid = !waves.rescale;
            julia.drawNewStructure();
        }
    });

};