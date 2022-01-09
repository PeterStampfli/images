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
const rosette = {};
// colors
rosette.lineColor = '#000000';
rosette.lineWidth = 2;

rosette.n = 7;
rosette.itemax = 10;

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


    const x = [];
    const y = [];
    let pattern=[];


function line(i,j){
        output.canvasContext.beginPath();
            output.canvasContext.setLineDash(pattern);

   output.canvasContext.moveTo(x[i],y[i]);


        output.canvasContext.lineTo(x[j],y[j]);
    canvasContext.stroke();
}

function triangle(i,j,k){
    output.canvasContext.beginPath();

   output.canvasContext.moveTo(x[i],y[i]);


        output.canvasContext.lineTo(x[j],y[j]);
        output.canvasContext.lineTo(x[k],y[k]);
    canvasContext.fill();
}

function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(rosette.lineWidth);
    canvasContext.strokeStyle = rosette.lineColor;
    const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;
    x.length=4*n+1;
    y.length=4*n+1;

    for (let i = 0; i <= 4*n; i++) {
        x[i] = Math.cos(angle * (i+0.75));
        y[i] = Math.sin(angle * (i+0.75));
    }
canvasContext.fillStyle=rosette.tileColor ;

    triangle(1,2,5);

    output.setLineWidth(rosette.tileWidth);
    canvasContext.strokeStyle = rosette.lineColor;
   
    const dash = rosette.tileWidth * output.coordinateTransform.totalScale;

   // canvasContext.setLineDash([0.5 * dash, 2 * dash]);
   pattern=[];

   for (let i = 0; i < n; i++) {
        line(i,i+1);
    }
    output.setLineWidth(rosette.lineWidth);
    pattern=[0.02, 0.04];


   for (let i = 0; i < n; i++) {
        line(i,i+2);
    }
       pattern=[0.1, 0.07];


   for (let i = 0; i < n; i++) {
        line(i,i+3);
    }

}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');