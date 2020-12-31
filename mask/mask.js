/* jshint esversion: 6 */

import {
    map,
    ParamGui,
    output,
    BooleanButton
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

    // create an output canvas
    output.createCanvas(gui, true);
    output.createPixels();
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3); // maybe not required

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




};