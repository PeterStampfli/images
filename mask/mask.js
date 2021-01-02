/* jshint esversion: 6 */

import {
    map,
    ParamGui,
    output,
    BooleanButton,
    Pixels
}
from "../libgui/modules.js";

export const mask = {};

/**
 * setting up the output, gui and drawing
 * @method mask.setup
 */
mask.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'masking',
        closed: false
    });
    mask.gui = gui;
    mask.mask = './maske.jpg';
    mask.maskLoaded = false;

    // create an output canvas
    output.createCanvas(gui, true);
    output.createPixels();
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3); // maybe not required
    output.autoResizeController.setValueOnly(false);
    output.autoResizeController.setActive(false);
    output.autoResizeController.hide();
    output.autoScaleController.setValueOnly(true);
    // create choices for what to show
    map.draw = map.callDrawImageLowQuality;
    map.makeShowingGui(gui);
    // destroy irrelevant controllers and options
    map.trajectoryColorController.destroy();
    map.maxIterationsController.destroy();
    map.whatToShowController.destroy();
    map.linewidthController.destroy();
    map.trajectoryOnOffController.destroy();
    map.whatToShowController = map.gui.add({
        type: 'selection',
        params: map,
        property: 'draw',
        options: {
            'image - low quality': map.callDrawImageLowQuality,
            'image - high quality': map.callDrawImageHighQuality,
            'image - very high quality': map.callDrawImageVeryHighQuality
        },
        onChange: function() {
            map.drawImageChangedCheckMapUpdate();
        }
    });
    map.setOutputDraw(); // links the output drawing routines
    // the drawing routines

    /**
     * what to do when the map changes (canvas size chaanges when loading a new map)
     * @method map.drawMapChanged
     */
    map.drawMapChanged = function() {
        map.startDrawing();
        map.make();
        map.makeStructureColors();
        map.drawImageChanged();
    };

    mask.threshold = 128;
    mask.binary = true;
    mask.inversion = false;
    mask.channel = 1;

    BooleanButton.greenRedBackground();

    gui.add({
        type: 'boolean',
        params: mask,
        property: 'inversion',
        onChange: function() {
            drawAlpha();
        }
    });

    gui.add({
        type: 'boolean',
        params: mask,
        property: 'binary',
        onChange: function() {
            drawAlpha();
        }
    });

    gui.add({
        type: 'number',
        params: mask,
        property: 'threshold',
        min: 0,
        max: 255,
        step: 1,
        onChange: function() {
            drawAlpha();
        }
    });

    gui.add({
        type: 'selection',
        params: mask,
        property: 'channel',
        options: {
            red: 0,
            green: 1,
            blue: 2,
            alpha: 3
        },
        onChange: function() {
            drawAlpha();
        }
    });

    /**
     * what to do when only the image changes (quality, moving, zooming)
     * draw image and update transparency from the map
     * @method map.drawImageChanged
     */
    map.drawImageChanged = function() {
        if (!mask.maskLoaded) {
            // if the mask has not been loaded: load it and then finish with drawing image
            mask.loadMask();
        } else {
            map.draw();
            drawAlpha();
        }
    };

    function drawAlpha() {
        const outputPixelsComponents = output.pixels.pixelComponents;
        const maskPixelsComponents = mask.maskPixels.pixelComponents;
        const color = {};
        const length = outputPixelsComponents.length;
        const channel = mask.channel;
        const inversion = mask.inversion;
        const binary = mask.binary;
        const threshold = mask.threshold;
        for (let iPixel = 0; iPixel < length; iPixel += 4) {
            let alpha = maskPixelsComponents[iPixel + channel];
            if (inversion) {
                alpha = 255 - alpha;
            }
            if (binary) {
                alpha = (alpha > threshold) ? 255 : 0;
            }
            outputPixelsComponents[iPixel + 3] = alpha;
        }
        output.pixels.show();
    }

    // loading the currently choosen mask and make the image
    // an invisible canvas for the mask with pixels
    mask.maskCanvas = document.createElement('canvas');
    mask.gui.bodyDiv.appendChild(mask.maskCanvas);
    mask.maskCanvasContext = mask.maskCanvas.getContext('2d');
    mask.maskCanvas.style.display = 'none';
    mask.maskCanvas.style.zIndex = '11';
    mask.maskPixels = new Pixels(mask.maskCanvas);

    mask.loadMask = function() {
        mask.maskLoaded = true;
        let image = new Image();

        image.onload = function() {
            mask.maskCanvas.width = image.width;
            mask.maskCanvas.height = image.height;
            mask.maskCanvasContext.drawImage(image, 0, 0);
            mask.maskPixels.update();

            // the canvas size changes, thus the map changes too, and the pixels
            // set that we can draw things
            output.isDrawing = true;
            output.setCanvasDimensions(image.width, image.height);
        };

        image.src = mask.mask;
    };

    // choosing a mask
    mask.maskController = gui.add({
        type: 'image',
        params: mask,
        property: 'mask',
        options: {
            twelveSquare: './maske.jpg'
        },
        labelText: 'mask',
        onChange: function() {
            mask.loadMask();

        },
    });
    // change background and load mask, ..., and draw image
    output.backgroundColorController.setValue('#eeeeee');
};