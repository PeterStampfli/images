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
} from "./hyperKaleidoGeometry.js";

export const controllers={};

Logger.spacing = 2;

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
map.lightController.destroy();
map.linewidthController.destroy();
map.trajectoryOnOffController.destroy();
map.trajectoryColorController.destroy();
// add drag and drop for the input image
map.imageController.addDragAndDropWindow();
// link the output drawing routines to the map routines
map.setOutputDraw();

// for debugging
map.allImageControllersHide();

// the dihedrals
const dihedralControl={
	type:'number',
	params:geometry,
	    min: 2,
    step: 1,
    onChange: function() {
        map.drawMapChanged();
    }
}

gui.addParagraph('Dihedral groups with first three mirrors');
controllers.d12=gui.add(dihedralControl,{
	property:'d12',
	labelText:'order of 1-2'
});
controllers.d13=controllers.d12.add(dihedralControl,{
	property:'d13',
	labelText:'1-3'
});
controllers.d23=controllers.d13.add(dihedralControl,{
	property:'d23',
	labelText:'2-3'
});

//the drawing routines (changing the map object)
//===========================================

/**
 * show structure of the map: color depending on the structure index
 * using the map.colorTable
 * @method map.drawStructure
 */
const colorZero = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 180,
    alpha: 255
});
const colorOne = Pixels.integerOfColor({
    red: 180,
    green: 180,
    blue: 255,
    alpha: 255
});
map.drawStructure = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    const length = map.width * map.height;
    const pixelsArray = output.pixels.array;
    const sizeArray = map.sizeArray;
    const structureColors = map.structureColors;
    const iterationsArray = map.iterationsArray;
    for (var index = 0; index < length; index++) {
        if (sizeArray[index] >= 0) {
            if ((iterationsArray[index] & 1) === 0) {
                pixelsArray[index] = colorZero;
            } else {
                pixelsArray[index] = colorOne;
            }
        } else {
            pixelsArray[index] = 0; // transparent black
        }
    }
    output.pixels.show();
};

/**
 * what to do when only the image changes
 * @method map.drawImageChanged
 */
map.drawImageChanged = function() {
    map.draw();
    output.drawGrid();
};

/**
 * what to do when the map changes (parameters, canvas size too)
 * circles might change - we have to determine the regions
 * @method map.drawMapChanged
 */
map.drawMapChanged = function() {
    map.startDrawing();
    geometry.setup();


    map.make();
    map.drawImageChanged();
};

map.drawMapChanged = function() {
    console.log('draw');
};

map.drawMapChanged();
