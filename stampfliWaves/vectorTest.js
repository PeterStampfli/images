/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton
}
from "../libgui/modules.js";

import {
    stampfli
}
from "./stampfli.js";

import {
    DrawingLines
}
from "../mappings/drawingLines.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.correctYAxis();
output.lineRound();

output.addCoordinateTransform();
output.addCursorposition();
output.setInitialCoordinates(0, 0, 6);
output.addGrid();

DrawingLines.setup(gui);
stampfli.setup(gui);

function draw() {
    output.fillCanvas();
    stampfli.start();
    stampfli.lines.draw();
}

DrawingLines.draw=draw;
stampfli.draw=draw;

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ffffff');