/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton
}
from "../libgui/modules.js";

import {
    ammann
}
from "./ammann.js";

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
ammann.setup(gui);


function draw() {
    output.fillCanvas();
    ammann.start();
    ammann.lines.draw();
}
DrawingLines.draw=draw;
ammann.draw=draw;
output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ffffff');