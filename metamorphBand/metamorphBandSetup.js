/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    map,
    julia
} from "../mappings/mapImage.js";

import {
    kaleidoscope
} from "../mappings/kaleidoscope.js";

import {
    bulatov
} from "../mappings/bulatov.js";

import {
    xDrift
} from "../mappings/xDrift.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'metamorph band',
        closed: false
    });

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 2);
    output.createPixels();
    kaleidoscope.setup(gui);
    bulatov.setup(gui);
    xDrift.setup(gui);
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
    bulatov.map();
    kaleidoscope.type();
    xDrift.make();
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