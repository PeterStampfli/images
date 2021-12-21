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
output.addGrid()

// parameters for drawing
const rosette = {};
// colors
rosette.lineColor = '#000000';
rosette.lineWidth = 2;

rosette.n = 12;
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

// different tilings
function twoSqrt3() {
    const angle = 2 * Math.PI / rosette.n;
    const i = 5;
    const x = px[i];
    const y = py[i];
    const side = Math.hypot(x[0], y[0]);
    output.makePath(0, 0, side, 0, side * (1 + Math.cos(angle)), side * Math.sin(angle), side * Math.cos(angle), side * Math.sin(angle), 0, 0);
    canvasContext.stroke();
    output.makePath(0, 0, side * Math.cos(angle), side * Math.sin(angle), side * Math.cos(3 * angle), side * Math.sin(3 * angle), 0, 0);
    canvasContext.stroke();
    output.makePath(0, 0, 0, side , -side , side , -side , 0, 0, 0);
    canvasContext.stroke();
}


// different tilings
function mirrors() {
    
        const angle = 2 * Math.PI / rosette.n;
    const i = 5;
    const x = px[i];
    const y = py[i];
    const side = Math.hypot(x[0], y[0]);
const rt3=Math.sqrt(3);
    output.makePath(-side/2,side/2,-side/2, 0);
    canvasContext.stroke();
    output.makePath(-side/2,side/2,-side/2, side);
    canvasContext.stroke();
    output.makePath(-side/2,side/2,0, side/2);
    canvasContext.stroke();
   output.makePath(-side/2,side/2,-side, side/2);
    canvasContext.stroke();
    // the triangle
 /*  output.makePath(side/2/rt3,side/2,0,0);
    canvasContext.stroke();
   output.makePath(side/2/rt3,side/2,0,side);
    canvasContext.stroke();
   output.makePath(side/2/rt3,side/2,side/2*rt3,side/2);
    canvasContext.stroke();
*/
   output.makePath(side/2/rt3,side/2,0,side/2);
    canvasContext.stroke();
   output.makePath(side/2/rt3,side/2,side/4*rt3,side/4);
    canvasContext.stroke();
   output.makePath(side/2/rt3,side/2,side/4*rt3,3*side/4);
    canvasContext.stroke();
    
    // the rhomb
    output.makePath(side,0, side * Math.cos(angle), side * Math.sin(angle));
    canvasContext.stroke();

        canvasContext.setLineDash([0,0]);
}

function oneSqrt3() {
    const angle = 2 * Math.PI / rosette.n;
    const i = 3;
    const x = px[i];
    const y = py[i];
    const side = Math.hypot(x[0], y[0]);
    output.makePath(0, 0, side, 0, side * (1 + Math.cos(angle)), side * Math.sin(angle), side * Math.cos(angle), side * Math.sin(angle), 0, 0);
    canvasContext.stroke();
    output.makePath(0, 0, side * Math.cos(angle), side * Math.sin(angle), side * Math.cos(3 * angle), side * Math.sin(3 * angle), 0, 0);
    canvasContext.stroke();
    output.makePath(0, 0, 0, side / 2, -side / 2, side / 2, -side / 2, 0, 0, 0);
    canvasContext.stroke();
}

function extra() {
    const angle = 2 * Math.PI / rosette.n;
    const i = 3;
    const x = px[i];
    const y = py[i];
    const side = Math.hypot(x[0], y[0]);
/*           output.canvasContext.strokeStyle="#cccccc";
    output.setLineWidth(0.4*rosette.tileWidth);
    output.makePath( -side/2 , 0 , -side/2 , -side);
    canvasContext.stroke();
        output.makePath( -side ,  -side/2 , 0,-side/2);
    canvasContext.stroke();
        output.makePath( side/2/Math.sqrt(3),-side/2,0,0);
    canvasContext.stroke();
            output.makePath(0,-side, side/2/Math.sqrt(3),-side/2,side*Math.sqrt(3)/2,-side/2);
    canvasContext.stroke();
 output.makePath(side, 0,  side * Math.cos(angle), -side * Math.sin(angle), 0, 0);
    canvasContext.stroke();
    */
       output.canvasContext.strokeStyle="#000000";
    output.setLineWidth(rosette.tileWidth);

    output.makePath(0, 0, side, 0, side * (1 + Math.cos(angle)), -side * Math.sin(angle), side * Math.cos(angle), -side * Math.sin(angle), 0, 0);
    canvasContext.stroke();
    output.makePath(0, 0, side * Math.cos(angle), -side * Math.sin(angle), side * Math.cos(3 * angle), -side * Math.sin(3 * angle), 0, 0);
    canvasContext.stroke();
    output.makePath(0, 0, 0, -side , -side , -side , -side , 0, 0, 0);
    canvasContext.stroke();
       const dash=rosette.tileWidth*output.coordinateTransform.totalScale;

    canvasContext.setLineDash([0.5*dash,2*dash]);
    output.setLineWidth(0.7*rosette.tileWidth);
    output.makePath( -side/2 , 0 , -side/2 , -side);
    canvasContext.stroke();
        output.makePath( -side ,  -side/2 , 0,-side/2);
    canvasContext.stroke();
        output.makePath( side/2/Math.sqrt(3),-side/2,0,0);
    canvasContext.stroke();
            output.makePath(0,-side, side/2/Math.sqrt(3),-side/2,side*Math.sqrt(3)/2,-side/2);
    canvasContext.stroke();
 output.makePath(side, 0,  side * Math.cos(angle), -side * Math.sin(angle), 0, 0);
    canvasContext.stroke();

}

function triangles() {
    for (let i = 0; i < 12; i++) {
        output.makePath(px[2][i], py[2][i], px[2][i + 1], py[2][i + 1]);
        canvasContext.stroke();
        output.makePath(px[3][i + 1], py[3][i + 1], px[5][i], py[5][i]);
        canvasContext.stroke();
    }
}

function squares() {
    const d = 2 + Math.sqrt(3);
    const angle = 2 * Math.PI / rosette.n;
    for (let i = 0; i <= rosette.n; i++) {
        const s = Math.cos(angle * i);
        const c = Math.sin(angle * i);
        output.makePath(d * c, d * s, c * (d + 1), s * (d + 1));
        canvasContext.stroke();
        output.makePath(d * c + s, d * s - c, c * (d + 1) + s, s * (d + 1) - c);
        canvasContext.stroke();
        output.makePath(d * c - s, d * s + c, c * (d + 1) - s, s * (d + 1) + c);
        canvasContext.stroke();
        output.makePath(c * (d + 1) + s, s * (d + 1) - c, c * (d + 1) - s, s * (d + 1) + c);
        canvasContext.stroke();
    }
}

function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(rosette.lineWidth);
    canvasContext.strokeStyle = rosette.lineColor;
    px.length = 0;
    py.length = 0;
    const angle = 2 * Math.PI / rosette.n;
    const n = rosette.n;

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
    triangles();
 //      squares();
    canvasContext.strokeStyle = "#cccccc";
    output.setLineWidth(0.4*rosette.tileWidth);
  //  mirrors();

    output.setLineWidth(rosette.tileWidth);
    canvasContext.strokeStyle = rosette.tileColor;
    twoSqrt3();
  //  oneSqrt3();
    extra();
const dash=rosette.tileWidth*output.coordinateTransform.totalScale;

    canvasContext.setLineDash([0.5*dash,2*dash]);
    output.setLineWidth(0.7*rosette.tileWidth);
    mirrors();
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');