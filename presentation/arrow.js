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
output.setInitialCoordinates(0, 0, 210);
output.addGrid();

// parameters for drawing
const arrow = {};
// colors
arrow.color='#888888';
arrow.lineColor='#444444';
arrow.lineWidth=2;
// dimensions
arrow.width=30;
arrow.length=70;
arrow.tip=50;

const colorController = {
    type: 'color',
    params: arrow,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: arrow,
    min: 0.1,
    onChange: function() {
        draw();
    }
};

gui.add(colorController,{
    property:'color'
});

gui.add(colorController,{
    property:'lineColor',
    labelText:'line'
});

gui.add(widthController,{
    property:'lineWidth'
});

gui.add(widthController,{
    property:'width'
});

gui.add(widthController,{
    property:'length'
});

gui.add(widthController,{
    property:'tip'
});

function draw() {
    output.lineRound();
    output.fillCanvasBackgroundColor();
                    output.setLineWidth(arrow.lineWidth);
    output.correctYAxis();
    canvasContext.strokeStyle=arrow.lineColor;
    canvasContext.fillStyle=arrow.color;
    const width=arrow.width;
    const tip=arrow.tip;
    const length=arrow.length;
    output.makePath(0,-width/2,-length,-width/2,-length,width/2,0,width/2,0,tip,tip,0,0,-tip);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();