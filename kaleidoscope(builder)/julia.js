/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    Point,
    points
} from "./points.js";

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
    // add options for the output image
    output.addImageProcessing();
    output.addAntialiasing();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCursorposition();

    points.setup(gui);


    // mouse controls
    // mouse move with ctrl shows objects that can be selected
    // does not need redrawing
    output.mouseCtrlMoveAction = function(event) {
        if (points.isSelected(event)) {
            output.canvas.style.cursor = "pointer";
        } else {
            output.canvas.style.cursor = "default";
        }
    };

    // smooth transition when ctrl key is pressed
    output.ctrlKeyDownAction = function(event) {
        output.mouseCtrlMoveAction(event);
    };

    // mouse down with ctrl selects intersection or circle
    // image pixels do not change, put on canvas, draw grid&points
    output.mouseCtrlDownAction = function(event) {
        if (points.isSelected(event)) {
            points.select(event);
        }
        julia.drawNoChange();
    };

    // changes also image
    // mouse drag with ctrl moves selected circle
    output.mouseCtrlDragAction = function(event) {
        points.drag(event);

        julia.drawNewStructure();
    };

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
// image may change (other quality, input image)
julia.drawNewImage = function() {
    output.fillCanvasBackgroundColor();
    output.drawGrid();
    points.draw();
};

// structure changes
// image may change (other quality, input image)
julia.drawNewStructure = function() {
    output.fillCanvasBackgroundColor();
    output.drawGrid();
    points.draw();
};

// structure and image does not change
// grid may change, selection of points may change
julia.drawNoChange = function() {
    output.fillCanvasBackgroundColor();
    output.drawGrid();
    points.draw();
};

setup();


const a = new Point(0, 0, Point.zero);
const b = new Point(0.5, 0.5, Point.singularity);
const c = new Point(0, 0.5, Point.neutral);

points.add(a);
points.add(b);
points.add(c);


julia.drawNewStructure();