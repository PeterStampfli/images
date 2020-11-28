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

const p = {};
p.nHorizontal = 15; // number of tiles in x-direction
p.nVertical = 10; // number of tiles in y-direction
p.colorLine = '#ff0000';
p.lineWidth = 5;
p.dotRadius = 5;
p.colorBackground = '#0000ff';

p.prob = 0.6;

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

gui.add(widthController, {
    property: 'dotRadius'
});

gui.add({
    type: 'number',
    params: p,
    property: 'prob',
    onChange: function() {
        randomData();
        draw();
    },
    step: 0.01,
    min: 0,
    max: 1
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


const data1 = [];
const data2 = [];
const data3 = [];


function randomData() {
    data1.length = 2 * (p.nHorizontal + 1) * (p.nVertical + 1);
    data2.length = 2 * (p.nHorizontal + 1) * (p.nVertical + 1);
    data2.length = 2 * (p.nHorizontal + 1) * (p.nVertical + 1);
    const length = data1.length;
    for (var i = 0; i < length; i++) {
        data1[i] = (Math.random() < p.prob);
        data2[i] = (Math.random() < p.prob);
        data3[i] = (Math.random() < p.prob);
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
    const lrx = -rlx;
    const lry = rly;

    if (data1[index]) {
        canvasContext.beginPath();
        canvasContext.moveTo(rlx, rly);
        canvasContext.arc(tileWidth / 2, 0, tileWidth / 2 + p.lineWidth / 2, 2 * Math.PI / 3, Math.PI, false);
        canvasContext.arc(0, 0, p.lineWidth / 2, -Math.PI, 0, false);
        canvasContext.arc(tileWidth / 2, 0, tileWidth / 2 - p.lineWidth / 2, Math.PI, 2 * Math.PI / 3, true);
        canvasContext.arc(tileWidth / 4, tileHeight / 2, p.lineWidth / 2, -Math.PI / 3, 2 * Math.PI / 3);

        canvasContext.fill();
    }

    if (data2[index]) {
        canvasContext.beginPath();
        canvasContext.moveTo(lrx, lry);
        canvasContext.arc(-tileWidth / 2, 0, tileWidth / 2 + p.lineWidth / 2, Math.PI / 3, 0, true);
        canvasContext.arc(0, 0, p.lineWidth / 2, 0, Math.PI, true);
        canvasContext.arc(-tileWidth / 2, 0, tileWidth / 2 - p.lineWidth / 2, 0, Math.PI / 3, false);
        canvasContext.arc(-tileWidth / 4, tileHeight / 2, p.lineWidth / 2, -2 * Math.PI / 3, Math.PI / 3, true);
        canvasContext.fill();
    }

    if (data3[index]) {
        canvasContext.beginPath();
        canvasContext.moveTo(lrx, lry);
        canvasContext.arc(0, tileHeight, tileWidth / 2 - p.lineWidth / 2, -2 * Math.PI / 3, -Math.PI / 3, false);
        canvasContext.arc(tileWidth / 4, tileHeight / 2, p.lineWidth / 2, 2 * Math.PI / 3, -Math.PI / 3, true);
        canvasContext.arc(0, tileHeight, tileWidth / 2 + p.lineWidth / 2, -Math.PI / 3, -2 * Math.PI / 3, true);
        canvasContext.arc(-tileWidth / 4, tileHeight / 2, p.lineWidth / 2, -2 * Math.PI / 3, Math.PI / 3, true);
        canvasContext.fill();
    }

    index += 1;
}

function draw() {
    output.isDrawing = true;
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


                canvasContext.lineWidth = p.lineWidth;
                canvasContext.beginPath();
                canvasContext.moveTo(tileWidth / 2 + p.dotRadius, 0);
                canvasContext.arc(tileWidth / 2, 0, p.dotRadius, 0, Math.PI * 2);
                canvasContext.stroke();




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