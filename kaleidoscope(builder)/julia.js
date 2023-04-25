/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    Point,
    points
} from "./points.js";

import {
    map
} from "./juliaMap.js";

export const julia = {};

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'julia+',
        closed: false
    });
    julia.gui = gui;

    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3);
    output.createPixels();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();
    map.setup(gui);

    points.setup(gui);

    map.setupDrawing(gui);

    // re-drawing

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
    points.draw();
};

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    points.zerosAndSingularities();
    map.init();
map.juliaSet();
    map.draw();
    output.drawGrid();
    points.draw();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    map.draw();
    output.drawGrid();
    points.draw();
};

setup();

points.add(new Point(0, 0, Point.zero));


julia.drawNewStructure();