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

output.createCanvas(gui, {
    name: 'canvas control',
    //  closed: false
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

canvas.style.backgroundColor = '#888888';

const p = {};
p.nHorizontal = 15; // number of tiles in x-direction
p.nVertical = 10; // number of tiles in y-direction


p.colorGrid = '#000000';
p.gridLineWidth = 5;

p.grid = false;

const colors = [];
colors.push('#ff0000');
colors.push('#00ff00');
colors.push('#0000ff');


p.colorGrid = '#000000';
p.gridLineWidth = 5;

p.grid = false;


gui.addParagraph("<strong>Tiling control</strong>");


const widthController = {
    type: 'number',
    params: p,
    min: 1,
    step: 1,
    onChange: function() {
        draw();
    }
};

gui.add({
    type: 'number',
    params: p,
    property: 'nHorizontal',
    min: 1,
    step: 1,
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
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(p.nHorizontal / p.nVertical * 2 / Math.sqrt(3));
        output.setCanvasDimensionsStepsize(p.nHorizontal, 1);
    }
});

gui.add({
    type: 'button',
    buttonText: 're-random',
    onClick: function() {
        randomData();
        draw();
    }
});


const colorController = {
    type: 'color',
    params: colors,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 0
});

gui.add(colorController, {
    property: 1
});

gui.add(colorController, {
    property: 2
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
    params: p,
    property: 'colorGrid'
});

gui.add(widthController, {
    property: 'gridLineWidth'
});

const data = [];


function randomData() {
    data.length = 2 * (p.nHorizontal + 1) * (p.nVertical + 1);
    const length = data.length;
    for (var i = 0; i < length; i++) {
        data[i] = Math.floor(3 * Math.random());
    }
}



var tileHeight, tileWidth;
var index;
var i, j;


function triangleUp() {
    canvasContext.fillStyle = colors[i % 3];
    canvasContext.strokeStyle = colors[i % 3];
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    if (data[index] === 0) {
        canvasContext.lineTo(-tileWidth / 4, tileHeight / 2);
    }
    canvasContext.lineTo(tileWidth / 4, tileHeight / 2);
    canvasContext.lineTo(tileWidth / 2, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.fillStyle = colors[(i + 1) % 3];
    canvasContext.strokeStyle = colors[(i + 1) % 3];
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    if (data[index] === 1) {
        canvasContext.lineTo(tileWidth / 4, tileHeight / 2);
    }
    canvasContext.lineTo(-tileWidth / 4, tileHeight / 2);
    canvasContext.lineTo(-tileWidth / 2, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.fillStyle = colors[(i + 2) % 3];
    canvasContext.strokeStyle = colors[(i + 2) % 3];
    canvasContext.beginPath();
    canvasContext.moveTo(0, tileHeight);
    canvasContext.lineTo(-tileWidth / 4, tileHeight / 2);
    if (data[index] === 2) {
        canvasContext.lineTo(0, 0);
    }
    canvasContext.lineTo(tileWidth / 4, tileHeight / 2);
    canvasContext.closePath();
    canvasContext.fill();
    index += 1;
}

function draw() {
    output.isDrawing = true;
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    tileHeight = canvas.height / p.nVertical;
    tileWidth = canvas.width / p.nHorizontal;

    console.log(tileWidth, tileHeight);
    console.log(Math.sqrt(3) * tileWidth / 2, tileHeight);
    canvasContext.strokeStyle = p.colorLine;
    canvasContext.fillStyle = p.colorLine;



    index = 0;
    for (j = 0; j <= p.nVertical; j++) {
        const y = j * tileHeight;


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
output.draw = draw;

draw();