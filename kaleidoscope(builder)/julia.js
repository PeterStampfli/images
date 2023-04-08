/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

export const julia = {};

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'julia+',
        closed: false
    });
    julia.gui = gui;

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3);
    output.createPixels();
    // add options for the output image
    output.addImageProcessing();
    output.addAntialiasing();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
}




output.drawGridChanged = function() {

        output.fillCanvasBackgroundColor();

    output.drawGrid();
};




setup();