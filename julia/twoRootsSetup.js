/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    twoRoots
} from "./twoRoots.js";

import {
    map,
    julia
} from "./mapImage.js";

import {
    juliaMap
} from "./juliaMap.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'two roots',
        closed: false
    });
    julia.gui = gui;

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 2);
    output.createPixels();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    juliaMap.setup(gui);
    kaleidoscope.setup(gui);
    twoRoots.setup(gui);
    map.setupDrawing(gui);

    // changing the grid
    // image pixels do not change, put on canvas, draw grid&points
    output.drawGridChanged = function() {
        julia.drawNoChange();
    };

    // moving/zooming canvas
    output.drawCanvasChanged = julia.drawNewStructure;
}

// structure does not change
// (input) image may change (other quality, input image)
julia.drawNewImage = function() {
    map.draw();
    output.drawGrid();
};

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    map.init();
    map.iteration();
    kaleidoscope.type();
    map.draw();
    output.drawGrid();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    map.draw();
    output.drawGrid();
};

setup();

julia.drawNewStructure();