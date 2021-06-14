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
output.setInitialCoordinates(0, 0, 4);
output.addGrid();

// parameters for drawing
const rosette = {};
// colors
rosette.lineColor = '#000000';
rosette.lineWidth = 2;

rosette.n = 8;
rosette.itemax = 10;

rosette.r=1;

rosette.tileColor = '#000000';
rosette.tileWidth = 4;

const colorController = {
    type: 'color',
    params: rosette,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: rosette,
    min: 0.1,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 'lineColor',
    labelText: 'line'
});

gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'tileColor',
    labelText: 'tile'
});

gui.add(widthController, {
    property: 'tileWidth'
});

gui.add({
    type: 'number',
    params: rosette,
    property: 'n',
    step: 1,
    min: 3,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: rosette,
    property: 'r',
    onChange: function() {
        draw();
    }
});

function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(rosette.lineWidth);
    canvasContext.strokeStyle = rosette.lineColor;
     const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;

    for (let i = 0; i <= n; i++) {
      const  x = Math.cos(angle * i);
       const y = Math.sin(angle * i);
        output.makePath(0, 0, x, y);
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.arc(rosette.r*x,rosette.r*y,rosette.r,0,2*Math.PI);
        canvasContext.stroke();
    }
    
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');