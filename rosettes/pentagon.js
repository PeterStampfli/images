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
output.setInitialCoordinates(0, 1.2, 4);
output.addGrid();

// parameters for drawing
const rosette = {};
// colors
rosette.lineColor = '#000000';
rosette.lineWidth = 5;

rosette.n = 5;
rosette.itemax = 10;

rosette.tileColor = '#aaaaaa';
rosette.tileWidth = 7;

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

const x = [];
const y = [];
let pattern = [];

function line(i, j) {
    output.canvasContext.beginPath();
    output.canvasContext.setLineDash(pattern);
    output.canvasContext.moveTo(x[i], y[i]);
    output.canvasContext.lineTo(x[j], y[j]);
    canvasContext.stroke();
}

function triangle(i, j, k) {
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[i], y[i]);
    output.canvasContext.lineTo(x[j], y[j]);
    output.canvasContext.lineTo(x[k], y[k]);
    canvasContext.fill();
}

function quad(i, j, k, m) {
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[i], y[i]);
    output.canvasContext.lineTo(x[j], y[j]);
    output.canvasContext.lineTo(x[k], y[k]);
    output.canvasContext.lineTo(x[m], y[m]);
    output.canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function B() {
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[4], y[4]);
    output.canvasContext.lineTo(x[0], y[0]);
    output.canvasContext.lineTo(x[1], y[1]);
    output.canvasContext.lineTo(x[4] + x[1] - x[0], y[4] + y[1] - y[0]);
    output.canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function APentagon() {
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[0], y[0]);
    output.canvasContext.lineTo(x[2], y[2]);
    output.canvasContext.lineTo(x[2]+x[3]-x[0],y[2]+y[3]-y[0]);
    output.canvasContext.lineTo(x[3], y[3]);
    output.canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}


function A() {
    const t = 1/1.618;
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[0]*t, y[0]*t);
    output.canvasContext.lineTo(x[2]*t, y[2]*t);
    output.canvasContext.lineTo((x[2]+x[3]-x[0])*t,(y[2]+y[3]-y[0])*t);
    output.canvasContext.lineTo(x[3]*t, y[3]*t);
    output.canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(rosette.lineWidth);
    canvasContext.strokeStyle = rosette.lineColor;
    const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;
    x.length = 4 * n + 1;
    y.length = 4 * n + 1;

    for (let i = 0; i <= 4 * n; i++) {
        x[i] = Math.cos(angle * (i) + Math.PI / 2);
        y[i] = Math.sin(angle * (i) + Math.PI / 2);
    }
    canvasContext.fillStyle = rosette.tileColor;
    output.setLineWidth(rosette.lineWidth);
    canvasContext.setLineDash([]);

    // thick rhomb
    //B();
    // thin rhomb, match to pentagon
     APentagon();
  //  A();
    // C rhomb
    //C();
    //   triangle(6,1, 3);
    // first quad
    // quad(3,4,5,6);
    // second
    //quad(3,4,5,0);

    //third
    // quad(2,4,5,0);

    output.setLineWidth(rosette.tileWidth);
    canvasContext.strokeStyle = rosette.lineqColor;

    const dash = rosette.tileWidth * output.coordinateTransform.totalScale;

    // canvasContext.setLineDash([0.5 * dash, 2 * dash]);
    pattern = [];

    for (let i = 0; i < n; i++) {
        line(i, i + 1);
    }
    output.setLineWidth(rosette.lineWidth);
    pattern = [0.01, 0.06];
    for (let i = 0; i < n; i++) {
        line(i, i + 2);
    }
    pattern = [0.1, 0.06];
    for (let i = 0; i < n; i++) {
        //    line(i, i + 3);
    }
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ffffff');