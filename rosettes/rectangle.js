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
output.setInitialCoordinates(0, 0, 6);
output.addGrid();

// parameters for drawing
const rosette = {};
// colors
rosette.lineColor = '#000000';
rosette.lineWidth = 5;

rosette.n = 4;
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
    canvasContext.stroke();}

function A() {
    console.log('rr')
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[1], y[1]);
    output.canvasContext.lineTo(x[2], y[2]);
    output.canvasContext.lineTo(x[3], y[3]);
    output.canvasContext.lineTo(x[5], y[5]);
 output.canvasContext.closePath();
    canvasContext.fill();
  //  canvasContext.stroke();
}
function B() {
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[1], y[1]);
    output.canvasContext.lineTo(x[2], y[2]);
    output.canvasContext.lineTo(0, 2*y[0]-y[1]);
    output.canvasContext.lineTo(x[0], y[0]);
 output.canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();}
function C() {
    output.canvasContext.beginPath();
    output.canvasContext.moveTo(x[1], y[1]);
    output.canvasContext.lineTo(x[3], y[3]);
    output.canvasContext.lineTo(0, 2*y[3]-y[1]);
    output.canvasContext.lineTo(x[6], y[6]);
    output.canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
     canvasContext.fillStyle=rosette.tileColor;
   output.setLineWidth(rosette.lineWidth);
    canvasContext.strokeStyle = rosette.lineColor;
    const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;
    x.length = 5;
    y.length = 5;

    x[0]=4;
    y[0]=3;
   x[1]=-4;
    y[1]=3;
   x[2]=-4;
    y[2]=-3;
   x[3]=4;
    y[3]=-3;
   x[4]=4;
    y[4]=3;
// A rhomb
//    triangle(1, 4, 5);
A();
// B rhomb
 //   triangle(0,1, 2);
 //B();
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
    pattern = [0.1, 0.3];
        line(0,2);
        line(1,3);
        canvasContext.strokeStyle = "#0000ff";
    output.setLineWidth(rosette.lineWidth);
         canvasContext.setLineDash([]);

       canvasContext.beginPath();
        canvasContext.arc(0,0,5,0,2*Math.PI);
        canvasContext.stroke();

}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ffffff');