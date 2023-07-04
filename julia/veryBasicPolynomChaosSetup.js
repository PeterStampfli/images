/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    veryBasicPolynomChaos
} from "./veryBasicPolynomChaos.js";

import{
    chaosTrajectory
} from "./chaosTrajectory.js";

import {
    map,
    julia
} from "./mapImage.js";

import {
    juliaMap
} from "./juliaMap.js";

function setup() {
    // base gui
    const gui = new ParamGui({
        name: 'veryBasicPolynom',
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
    veryBasicPolynomChaos.setup(gui);
chaosTrajectory.setup(gui);
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
    map.iteration();
chaosTrajectory.initialize();
            chaosTrajectory.run();
    chaosTrajectory.draw();
    output.drawGrid();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    chaosTrajectory.draw();
    output.drawGrid();
};

setup();

julia.drawNewStructure();