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
    cartioid
} from "../mappings/cartioid.js";

import {
    bulatov
} from "../mappings/bulatov.js";

import {
    circularDrift
} from "../mappings/circularDrift.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'metamorp cartioid',
        closed: false
    });

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 2);
    output.createPixels();
    kaleidoscope.setup(gui);
    cartioid.setup(gui);
    bulatov.setup(gui);
    bulatov.setupPeriods(gui);
    circularDrift.setup(gui);
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
    cartioid.map();
    bulatov.ringMap();
    kaleidoscope.type();
    circularDrift.make();
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