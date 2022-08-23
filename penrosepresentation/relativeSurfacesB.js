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
output.setInitialCoordinates(1.5, 0, 4);
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
    // initialize output canvas
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(whatever.lineWidth);
    canvasContext.strokeStyle = whatever.lineColor;
       const dash = whatever.lineWidth * output.coordinateTransform.totalScale;

    //  create structure
    const s=Math.sin(Math.PI/5);
    const c=Math.cos(Math.PI/5);
     canvasContext.setLineDash([0.5 * dash, 2 * dash]);
   canvasContext.beginPath();
    canvasContext.moveTo(c,s);
    canvasContext.lineTo(c,-s);
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.setLineDash([2 * dash, 2 * dash]);
    canvasContext.moveTo(0,0);
    canvasContext.lineTo(2*c,0);
    canvasContext.lineTo(2*c,s);
    canvasContext.lineTo(0,s);
    canvasContext.lineTo(0,0);
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.setLineDash([]);
    canvasContext.moveTo(0,0);
    canvasContext.lineTo(c,s);
    canvasContext.lineTo(2*c,0);
    canvasContext.lineTo(c,-s);
    canvasContext.lineTo(0,0);



    canvasContext.stroke();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');