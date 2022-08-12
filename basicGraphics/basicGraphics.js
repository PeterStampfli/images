/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
output.addCursorposition();
output.setInitialCoordinates(0, 0, 10);
output.addGrid();

// parameters for drawing
const whatever = {};
// colors
whatever.lineColor = '#000000';
whatever.lineWidth = 2;

gui.add({
    type: 'color',
    params: whatever,
    property: 'lineColor',
    labelText: 'line',
    onChange: function() {
        draw();
    }
});

gui.add({ 
    type: 'number',
    params: whatever,
    property: 'lineWidth',
    min: 0.1,
    onChange: function() {
        draw();
    }
});

// for simple things
// draw routine creates structure too

function draw() {
    console.log("creating and drawing");
    // initialize output canvas
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(whatever.lineWidth);
    canvasContext.strokeStyle = whatever.lineColor;

    //  create structure
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');