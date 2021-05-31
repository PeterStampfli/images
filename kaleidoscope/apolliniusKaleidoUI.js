/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels,
    BooleanButton,
    Logger
} from "../libgui/modules.js";

import {
    geometry
} from "./apolliniusKaleidoGeometry.js";

export const controllers = {};


// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'spheres',
    closed: false
});
// create an output canvas, with coordinates and pixels
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
// options of what to show
map.makeShowingGui(gui, {
    closed: false
});

map.addDrawDivergence();
//map.lightController.destroy();
map.linewidthController.destroy();
map.trajectoryOnOffController.destroy();
map.trajectoryColorController.destroy();
// add drag and drop for the input image
map.imageController.addDragAndDropWindow();
// link the output drawing routines to the map routines
map.setOutputDraw();

/**
 * what to do when the map changes (parameters, canvas size too)
 * circles might change - we have to determine the regions
 * @method map.drawMapChanged
 */
map.drawMapChanged = function() {
    map.startDrawing();
    geometry.setup();
    map.make(); // uses map.mapping(point)
    map.drawImageChanged();
};

/**
 * what to do when only the image changes
 * @method map.drawImageChanged
 */
map.drawImageChanged = function() {
    map.makeStructureColors();
    map.draw(); // includes methods for drawing tiling or reflections
    output.drawGrid();
};



map.drawMapChanged();