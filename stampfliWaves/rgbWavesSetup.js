/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    waves
} from "./rgbWaves.js";

import {
    map,
    julia
} from "../mappings/mapImage.js";

import {
    DrawingLines
} from "../mappings/drawingLines.js";

import {
    stampfli
}
from "./stampfli.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'rgbWaves 12-fold',
        closed: false
    });

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 200);
    output.createPixels();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    waves.setup(gui);
    stampfli.setup(gui);
    DrawingLines.setup(gui);

    // changing the grid
    // image pixels do not change, put on canvas, draw grid&points
    output.drawGridChanged = function() {
        julia.drawNoChange();
    };

    // moving/zooming canvas
    output.drawCanvasChanged = julia.drawNewStructure;
}

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    map.init();
    waves.map();
    stampfli.start();
    julia.drawNoChange();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    output.fillCanvas();
    if (waves.drawOn) {
        waves.draw();
    }
    stampfli.lines.draw();
    output.drawGrid();
};
output.drawImageChanged = julia.drawNoChange;

DrawingLines.draw = julia.drawNoChange;
stampfli.draw = julia.drawNewStructure;
setup();
julia.drawNewStructure();