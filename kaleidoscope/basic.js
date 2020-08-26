/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    circles,
    intersections,
} from './modules.js';

/**
 * basic things for screen output and mouse input
 * @namespace basic
 */
export const basic = {};

/**
 * setting up the output, gui and drawing
 * @method basic.setup
 */
basic.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'test',
        closed: false
    });
    basic.gui = gui;
    // create an output canvas
    const outputGui = gui.addFolder('output image');
    output.createCanvas(outputGui);
    output.canvas.style.backgroundColor = 'grey';
    output.createPixels();
    // coordinate transform for the output image
    outputGui.addParagraph('coordinate transform');
    output.addCoordinateTransform(outputGui, false);
    output.setInitialCoordinates(0, 0, 3);
    // setting up the mapping, and its default input image
    map.mapping = function(point) {
        circles.map(point);
    };
    map.setOutputDraw(); // links the ouput drawing routines
    const inputGui = gui.addFolder('input image');
    map.inputImage = '../libgui/testimage.jpg';
    map.setupInputImage(inputGui);
    // setting up the regions
    // only the beginning ?
    // something is not ok !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const regionGui = gui.addFolder('regions');
    map.regionControl(regionGui, 2);
    map.makeNewColorTable(regionGui, 2);
    // GUI's for circles and intersections: you can close them afterwards
    circles.makeGui(gui);
    intersections.makeGui(gui, {
        closed: false
    });
    map.drawImageChanged = function() {
        map.draw();
        circles.draw();
        intersections.draw();
    };
};

/**
 * recalculating the map, generating new pixel image and drawing
 * use if the map changed
 * @method basic.drawMapChanged
 */
basic.drawMapChanged = map.drawMapChanged;

/**
 * generating new pixel image and drawing
 * use if the map remains and only the image changes
 * @method basic.drawImageChanged
 */
basic.drawImageChanged = map.drawImageChanged;

/**
 * drawing
 * use if only the display of circles and intersection changes
 * @method basic.drawOnly
 */
basic.drawOnly = function() {
    output.pixels.show(); // no new map
    circles.draw();
    intersections.draw();
};