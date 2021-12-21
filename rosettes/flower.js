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

// parameters for drawing
const rosette = {};
// colors
rosette.lineColor = '#000000ff';
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
    property: 'itemax',
    step: 1,
    min: 0,
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


// corners-coordinates
const px = [];
const py = [];

function addCorners() {
    const x = [];
    x.length = rosette.n + 1;
    px.push(x);
    const y = [];
    y.length = rosette.n + 1;
    py.push(y);
}



function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();

    px.length = 0;
    py.length = 0;
    const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;

    output.setLineWidth(rosette.tileWidth);
    canvasContext.strokeStyle = rosette.tileColor;
     for (let i = 0.5*(1-(n/2)&1); i <= n; i++) {
      const  x = Math.cos(angle * i);
       const y = Math.sin(angle * i);
        canvasContext.beginPath();
        canvasContext.arc(rosette.r*x,rosette.r*y,rosette.r,0,2*Math.PI);
        canvasContext.stroke();
    }

    output.setLineWidth(rosette.lineWidth);
    canvasContext.strokeStyle = rosette.lineColor;

    addCorners();
    let x = px[px.length - 1];
    let y = py[py.length - 1];
    x.fill(0);
    y.fill(0);

    addCorners();
    x = px[px.length - 1];
    y = py[py.length - 1];

    for (let i = 0; i <= n; i++) {
        x[i] = Math.cos(angle * i);
        y[i] = Math.sin(angle * i);
        output.makePath(0, 0, x[i], y[i]);
        canvasContext.stroke();
    }
    for (var ite = 0; ite < rosette.itemax; ite++) {
        addCorners();
        x = px[px.length - 1];
        y = py[py.length - 1];
        const xLast = px[px.length - 2];
        const yLast = py[py.length - 2];
        const xLast2 = px[px.length - 3];
        const yLast2 = py[py.length - 3];
        for (let i = 0; i < n; i++) {
            x[i] = xLast[i] + xLast[i + 1] - xLast2[i + 1];
            y[i] = yLast[i] + yLast[i + 1] - yLast2[i + 1];
        }
        if (x[0] * x[0] + y[0] * y[0] < 0.9 * (xLast[0] * xLast[0] + yLast[0] * yLast[0])) {
            break;
        }
        x[n] = x[0];
        y[n] = y[0];
        for (let i = 0; i < n; i++) {
            output.makePath(xLast[i], yLast[i], x[i], y[i], xLast[i + 1], yLast[i + 1]);
            canvasContext.stroke();
        }
    }
    }

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');