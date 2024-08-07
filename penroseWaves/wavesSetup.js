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

import {
    DrawingLines
} from "../mappings/drawingLines.js";

import {
    penrose
}
from "./penrose.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'waves 5-fold',
        closed: false
    });

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 100);
    output.createPixels();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    waves.setup(gui);
    penrose.setup(gui);
    DrawingLines.setup(gui);

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
    julia.drawNoChange();
};

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    map.init();
    waves.type();
    penrose.start();
    julia.drawNoChange();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    output.fillCanvas();
    if (waves.drawOn) {
        waves.drawImageHighQuality();
    }
    penrose.lines.draw();
    output.drawGrid();
};

DrawingLines.draw=julia.drawNoChange;
penrose.draw=julia.drawNewStructure;

setup();
julia.drawNewStructure();