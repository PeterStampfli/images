/* jshint esversion: 6 */

// random tiles on triangle lattice
//==================================================

// note that this is quick and dirty, not well documented, sorry
// IMPORTANT: uses the paramGui library (https://github.com/PeterStampfli/paramGui) for creating the canvas and the gui:
// importing it

import {
    ParamGui,
    output
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

gui.addParagraph('You can use this gui for your own projects. It is at: <strong>https://github.com/PeterStampfli/paramGui</strong>');

output.drawCanvasChanged=function(){};
output.createCanvas(gui, {
    name: 'canvas control',
    //  closed: false
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

const p = {};
p.nHorizontal = 15; // number of tiles in x-direction
p.nVertical = 10; // number of tiles in y-direction
p.colorLine = '#ff0000';
p.lineWidth = 5;
p.colorBackground = '#0000ff';

p.colorGrid = '#000000';
p.gridLineWidth = 5;

p.grid = false;

gui.addParagraph("<strong>Tiling control</strong>");

const widthController = {
    type: 'number',
    params: p,
    min: 1,
    onChange: function() {
        draw();
    }
};

gui.add({
    type: 'number',
    params: p,
    property: 'nHorizontal',
    min: 1,
    step:1,
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(p.nHorizontal / p.nVertical * 2 / Math.sqrt(3));
        output.setCanvasDimensionsStepsize(p.nHorizontal, 1);
    }
});

gui.add({
    type: 'number',
    params: p,
    property: 'nVertical',
    min: 1,
    step:1,
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(p.nHorizontal / p.nVertical * 2 / Math.sqrt(3));
        output.setCanvasDimensionsStepsize(p.nHorizontal, 1);
    }
});

gui.add({
    type: 'button',
    buttonText: 're-randomize',
    onClick: function() {
        randomData();
        draw();
    }
});

const colorController = {
    type: 'color',
    params: p,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 'colorBackground'
});

gui.add(colorController, {
    property: 'colorLine'
});


gui.add(widthController, {
    property: 'lineWidth'
});

gui.add({
    type: 'boolean',
    params: p,
    property: 'grid',
    onChange: function() {
        draw();
    }
});

gui.add(colorController, {
    property: 'colorGrid'
});

gui.add(widthController, {
    property: 'gridLineWidth'
});

const data=[];

function randomData() {
    data.length = 2 * (p.nHorizontal + 1) * (p.nVertical + 1);
    const length = data.length;
    for (var i = 0; i < length; i++) {
        data[i] =Math.floor((6*Math.random()));
    }
}

var tileHeight, tileWidth;
var index;

function triangleUp() {
    const rrx = tileWidth / 4 + p.lineWidth / 4;
    const rry = tileHeight / 2 - p.lineWidth / 4 * Math.sqrt(3);
    const rlx = tileWidth / 4 - p.lineWidth / 4;
    const rly = tileHeight / 2 + p.lineWidth / 4 * Math.sqrt(3);
    const llx = -rrx;
    const lly = rry;
    const lrx = -rlx
    const lry = rly;
    canvasContext.fillStyle=p.colorLine;
    canvasContext.lineWidth=1;
    canvasContext.fillStyle=p.colorLine;

if(data[index]===0||data[index]===4||data[index]===5){
    canvasContext.beginPath();
    canvasContext.moveTo(p.lineWidth/2,0);
    canvasContext.lineTo(rrx,rry);
    canvasContext.lineTo(rlx,rly);
    canvasContext.lineTo(-p.lineWidth/2,0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

if(data[index]===1||data[index]===3||data[index]===5){
    canvasContext.beginPath();
    canvasContext.moveTo(p.lineWidth/2,0);
    canvasContext.lineTo(lrx,lry);
    canvasContext.lineTo(llx,lly);
    canvasContext.lineTo(-p.lineWidth/2,0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

if(data[index]===2||data[index]===3||data[index]===4){
    canvasContext.beginPath();
    canvasContext.moveTo(llx,lly);
    canvasContext.lineTo(rrx,rry);
    canvasContext.lineTo(rlx,rly);
    canvasContext.lineTo(lrx,lry);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

    index += 1;
}

function draw() {
    output.isDrawing=true;
    var i, j;
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.fillStyle = p.colorBackground;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.lineWidth = p.lineWidth;
    canvasContext.lineCap = 'round';
    tileHeight = canvas.height / p.nVertical;
    tileWidth = canvas.width / p.nHorizontal;
    canvasContext.strokeStyle = p.colorLine;
    canvasContext.fillStyle = p.colorLine;
    index = 0;
    for (j = 0; j <= p.nVertical; j++) {
        const y = j * tileHeight;
        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        for (i = -1; i <= 2 * p.nHorizontal; i++) {
            if ((i + j) & 1) {
                const x = i * tileWidth / 2;
                canvasContext.setTransform(1, 0, 0, 1, x, y);
                triangleUp();
                canvasContext.setTransform(1, 0, 0, -1, x, y);
                triangleUp();
            }
        }
    }

    // the grid
    if (p.grid) {
        canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext.strokeStyle = p.colorGrid;
        canvasContext.lineWidth = p.gridLineWidth;
        for (i = -p.nHorizontal; i <= 2 * p.nHorizontal; i++) {
            const x = i * canvas.width / p.nHorizontal;
            canvasContext.beginPath();
            canvasContext.moveTo(x, 0);
            canvasContext.lineTo(x + canvas.width * p.nVertical / p.nHorizontal / 2, canvas.height);
            canvasContext.moveTo(x, 0);
            canvasContext.lineTo(x - canvas.width * p.nVertical / p.nHorizontal / 2, canvas.height);
            canvasContext.stroke();
        }
        for (i = 0; i <= p.nVertical; i++) {
            const x = i * canvas.height / p.nVertical;
            canvasContext.beginPath();
            canvasContext.moveTo(0, x);
            canvasContext.lineTo(canvas.width, x);
            canvasContext.stroke();
        }
    }
}

randomData();

output.setCanvasWidthToHeight(p.nHorizontal / p.nVertical * 2 / Math.sqrt(3));
output.setCanvasDimensionsStepsize(p.nHorizontal, p.nVertical);
output.drawCanvasChanged = draw;

draw();