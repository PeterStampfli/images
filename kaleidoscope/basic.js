/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    circles,
    intersections,
    presets
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
    // the presets: make gui and load
    presets.makeGui(gui, {
        closed: false
    });
    // GUI's for circles and intersections: you can close them afterwards
    circles.makeGui(gui, {
        closed: false
    });
    intersections.makeGui(gui, {
        closed: false
    });
    map.drawImageChanged = function() {
        map.draw();
        circles.draw();
        intersections.draw();
    };
    // mouse controls
    // mouse move with ctrl shows objects that can be selected
    output.mouseCtrlMoveAction = function(event) {
        if (intersections.isSelected(event)) {
            output.canvas.style.cursor = "pointer";
        } else if (circles.isSelected(event)) {
            output.canvas.style.cursor = "pointer";
        } else {
            output.canvas.style.cursor = "default";
        }
        output.pixels.show();
        circles.draw();
        intersections.draw();
    };
    // smooth transition when ctrl key is pressed
    output.ctrlKeyDownAction = function(event) {
        output.mouseCtrlMoveAction(event);
    };
    // mouse down with ctrl selects intersection or circle
    output.mouseCtrlDownAction = function(event) {
        if (intersections.select(event) || circles.select(event)) {
            output.pixels.show();
            circles.draw();
            intersections.draw();
        }
    };
    // mouse drag with ctrl moves selected circle
    output.mouseCtrlDragAction = function(event) {
        circles.dragAction(event);
        map.drawMapChanged();
    };

    // mouse wheel with ctrl changes radius of slected circle
    // with ctrl+shift changes order of selected intersection
    output.mouseCtrlWheelAction = function(event) {
        if (event.shiftPressed) {
            intersections.wheelAction(event);
        } else {
            circles.wheelAction(event);
        }
        map.drawMapChanged();
    };
};

// standardized drawing routines

/**
 * recalculating the map, generating new pixel image and drawing
 * taking care for case that all circles are inverting inside out
 * use if the map changed
 * @method basic.drawMapChanged
 */
basic.drawMapChanged = function() {
	    circles.finalInversion=circles.allInsideOut();
    console.log(circles.finalInversion);
    map.drawMapChanged();
};

/**
 * generating new pixel image and drawing
 * use if the map remains and only the image changes
 * @method basic.drawImageChanged
 */
basic.drawImageChanged = function() {
    map.drawImageChanged();
};

/**
 * drawing
 * use if only the display of circles and intersection changes
 * @method basic.drawCirclesIntersections
 */
basic.drawCirclesIntersections = function() {
    output.pixels.show(); // no new map
    circles.draw();
    intersections.draw();
};

/**
 * get json string for the kaleidoscope (saving as preset)
 * @method basic.getJSON
 * @return String, defines the kaleidoscope
 */
basic.getJSON = function() {
    const kaleidoscope = {
        intersections: intersections.get(),
        circles: circles.get()
    };
    return JSON.stringify(kaleidoscope);
};

/**
 * set the kaleidoscope using JSON string
 * @method basic.setJSON
 * @param {String} kaleidoscopeJSON
 */
basic.setJSON = function(kaleidoscopeJSON) {
    const kaleidoscope = JSON.parse(kaleidoscopeJSON);
    // first create the circles
    circles.set(kaleidoscope.circles);
    // then we can create the ingtersections
    intersections.set(kaleidoscope.intersections);
};