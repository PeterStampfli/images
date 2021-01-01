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


    function alphaFromColorRed(color){
    	if (color.red>mask.threshold){
    		return 255;
    	} else {
    	return 0;
    }
    }

mask.threshold=128;
mask.alphaFromColor=alphaFromColorRed;

gui.add({
type:'selection',
params:mask,
property:'alphaFromColor',
labelText:'alpha',
options:{red: alphaFromColorRed},
onChange: function(){
	map.drawImageChanged()
}
});

gui.add({
	type:'number',
	params:mask,
	property:'threshold',
	min:0,
	max:255,
	step:1,
onChange: function(){
	map.drawImageChanged()
}})

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
            const outputPixelsComponents = output.pixels.pixelComponents;
            const maskPixels = mask.maskPixels;
            const color = {};
            const length = outputPixelsComponents.length / 4;
            let iAlpha = -1;
            for (let iPixel = 0; iPixel < length; iPixel++) {
                iAlpha += 4;
                maskPixels.getColorAtIndex(color,iPixel);
const alpha=mask.alphaFromColor(color);
                outputPixelsComponents[iAlpha]=alpha;
            }
            output.pixels.show();
        }
    };

    // loading the currently choosen mask and make the image
    // an invisible canvas for the mask with pixels
    mask.maskCanvas = document.createElement('canvas');
    mask.gui.bodyDiv.appendChild(mask.maskCanvas);
    mask.maskCanvasContext = mask.maskCanvas.getContext('2d');
    mask.maskCanvas.style.display='none';
    mask.maskCanvas.style.zIndex = '11';
    mask.maskPixels = new Pixels(mask.maskCanvas);
    console.log(mask.maskPixels);

    mask.loadMask = function() {
        mask.maskLoaded = true;
        console.log('load mask');
        let image = new Image();

        image.onload = function() {
            console.log('mask loaded', mask.mask);
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