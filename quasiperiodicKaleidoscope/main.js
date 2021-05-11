/* jshint esversion: 6 */

/*
the html page calls this module
it sets up everthing injecting code into the main object
and calls main.setup
*/

import {
    output,
    ParamGui,
    map,
    Pixels,
    ColorInput
} from "../libgui/modules.js";

import {
    tiles
}
from "./modules.js";

export const main = {};

main.mapValid = false; // new tiling, but no map

/**
 * setting up the tiling user interface
 * @method main.setupTilingUI
 */
main.setupTilingUI = function() {
    console.error('setupTilingUI undefined');
};

/**
 * making the tiling
 * @method main.makeTiling
 */
main.makeTiling = function() {
    console.error('main.makeTiling undefined');
};

/**
 * drawing the tiling
 * @method main.drawTiling
 */
main.drawTiling = function() {
    console.error('main.drawTiling undefined');
};

/**
 * setting up (the UI mainly)
 * @method main.setup
 */
main.setup = function() {
    const gui = new ParamGui({
        closed: false
    });
    main.gui = gui;
    const help = gui.addFolder('help', {
        closed: true
    });
    main.helpGui = help;
    help.addParagraph('You can <strong>zoom the image,</strong> with the mouse wheel if the mouse is on the image.');
    help.addParagraph('You can <strong>move the image</strong> with a mouse drag.');
    help.addParagraph('You can <strong>change numbers</strong> by choosing a digit with the mouse and turning the mouse wheel.');
    help.addParagraph('Alternatively, you can use the <strong>"image controls"</strong> part of the gui.');
    help.addParagraph('Click on the black triangles to open/close parts of the gui.');
    help.addParagraph('Send bug reports and other comments to: <strong>pestampf@gmail.com</strong>');
    // create an output canvas, with coordinates and pixels
    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    // coordinates: origin (0,0) at center of canvas
    //  x-axis ranging from -1.5 to 1.5
    // adjust/size initial tiles to fit
    output.setInitialCoordinates(0, 0, 3);
    output.createPixels();
    // add options for the output image
    output.addImageProcessing();
    output.addAntialiasing();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    // options of what to show
    // delete what is not needed
    // adding display options: see kaleidoscope.basic.js indras pearls
    map.makeShowingGui(gui);
    map.maxIterationsController.destroy();
    map.linewidthController.destroy();
    map.trajectoryOnOffController.destroy();
    map.trajectoryColorController.destroy();
    // add drag and drop for the input image
    map.imageController.addDragAndDropWindow();
    // add option to draw tiling on (default white) background
    output.backgroundColorController.setValueOnly('#ffffff');
    ColorInput.setObject(output.backgroundColor, output.backgroundColorString);
    output.backgroundColorInteger = Pixels.integerOfColor(output.backgroundColor);
    output.canvas.style.backgroundColor = output.backgroundColorString;
    map.callDrawTiling = function() {
        map.drawingImage = false;
        map.allImageControllersHide();
        output.clearCanvas();
        main.drawTiling();
    };
    map.whatToShowController.addOption("tiling", map.callDrawTiling);
    map.callDrawReflections = function() {
        map.drawingImage = false;
        map.allImageControllersHide();
        output.clearCanvas();
        tiles.evenReflections.draw();
        tiles.oddReflections.draw();
    };
    map.whatToShowController.addOption("reflections", map.callDrawReflections);
    // link the output drawing routines to the map routines
    map.setOutputDraw();
    // the UI for the tiling
    main.setupTilingUI();
};

// the drawing routines

/**
 * determine if tiling to draw
 * @method main.drawingTiling
 * @return boolean, true if drawing tiling with solid colors
 */
main.drawingTiling = function() {
    return map.whatToShowController.getValue() === map.callDrawTiling;
};

/**
 * determine if reflections to draw
 * @method main.drawingReflections
 * @return boolean, true if drawing reflections with solid colors
 */
main.drawingReflections = function() {
    return map.whatToShowController.getValue() === map.callDrawReflections;
};

/**
 * what to do when the map changes (parameters, canvas size too)
 * circles might change - we have to determine the regions
 * @method map.drawMapChanged
 */
map.drawMapChanged = function() {
    map.startDrawing();
    main.makeTiling();
    main.mapValid = false;
    map.drawImageChanged();
};

/**
 * what to do when only the image changes
 * @method map.drawImageChanged
 */
map.drawImageChanged = function() {
    if (!main.drawingTiling() && !main.drawingReflections() && !main.mapValid) {
        // make map only if required  > image changed
        main.mapValid = true;
        map.make();
        map.makeTransparent();
        map.activeRegions[0] = true;
        map.makeStructureColors();
        tiles.mapEvenReflections();
        tiles.mapOddReflections();
    }
    map.draw(); // includes methods for drawing tiling or reflections
    tiles.draw(); // drawing borders and so on
    output.drawGrid();
};

// standardized drawing routines

/**
 * recalculating the map, generating new pixel image and drawing
 * use if the map changed
 * @method main.drawMapChanged
 */
main.drawMapChanged = function() {
    map.drawMapChanged();
};

/**
 * generating new pixel image and drawing
 * use if the map remains and only the image changes
 * @method main.drawImageChanged
 */
main.drawImageChanged = function() {
    console.log('draw image changed');
    map.drawImageChanged();
};