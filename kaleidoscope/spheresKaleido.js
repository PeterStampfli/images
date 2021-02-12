/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    geometry
} from "./spheresMap.js";

// basic things for screen output and mouse input
// setting up the gui, messages
//==============================================================

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

// the basic triangle
const basisController = gui.add({
    type: 'selection',
    params: geometry,
    property: 'basicTriangle',
    labelText: 'basis',
    options: ['3 planes', 'tetrahedron', 'octahedron', 'ikosahedron'],
    onChange: function() {
        console.log(geometry.basicTriangle);
        map.drawMapChanged();
    }
});
basisController.add({
    type: 'button',
    buttonText: 'rotate',
    onClick: function() {
        geometry.rotation = (geometry.rotation + 1) % 3;
        console.log(geometry.rotation);
        map.drawMapChanged();
    }
});
geometry.message12 = gui.addParagraph('message');
geometry.message13 = gui.addParagraph('message');
geometry.message23 = gui.addParagraph('message');
geometry.message123 = gui.addParagraph('message');

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

map.drawMapChanged();