/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    waves
} from "./waves.js";

import {
    map,
    julia
} from "../mappings/mapImage.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'waves',
        closed: false
    });

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 100);
    output.createPixels();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
   // juliaMap.setup(gui);
    waves.setup(gui);
    map.setupDrawing(gui);
    map.whatToShowController.hide();

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
    waves.drawImageHighQuality();
    output.drawGrid();
};

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    map.init();
    waves.type();
    waves.drawImageHighQuality();
    output.drawGrid();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    waves.drawImageHighQuality();
    output.drawGrid();
};

setup();
julia.drawNewStructure();
