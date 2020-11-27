/* jshint esversion: 6 */

// colored random theo tiles
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

const theo = {};
theo.nHorizontal = 15; // number of tiles in x-direction
theo.nVertical = 10; // number of tiles in y-direction
theo.color1 = '#ff0000'; // fill color
theo.color2 = '#0000ff'; // the other fill color
theo.lineColor = '#000000';
theo.lineWidth = 3;
theo.lines = true;
theo.grid = true;
theo.gridColor = '#aaaa00';
theo.gridWidth = 1;
theo.p = 0.5; // relative probability of tiles, o.5 gives classical theo, 0 gives hor. lines
theo.squares = 0; // probability for extra tile with squares

gui.addParagraph("<strong>Theo's</strong>");

gui.add({
    type: 'number',
    params: theo,
    property: 'nHorizontal',
    min: 1,
    step: 1,
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(theo.nHorizontal / theo.nVertical);
        output.setCanvasDimensionsStepsize(theo.nHorizontal, theo.nVertical);
    }
});

gui.add({
    type: 'number',
    params: theo,
    property: 'nVertical',
    min: 1,
    step: 1,
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(theo.nHorizontal / theo.nVertical);
        output.setCanvasDimensionsStepsize(theo.nHorizontal, theo.nVertical);
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

gui.add({
    type: 'number',
    params: theo,
    property: 'p',
    labelText: 'morphing',
    min: 0,
    max: 1,
    step: 0.01,
    onChange: function() {
        randomData();
        draw();
    }
}).addHelp('0.5 gives classical theo. Other values change the probabilities for selecting tiles. 0 gives horizontal percolating strips. 1 gives isolated dots.');

gui.add({
    type: 'number',
    params: theo,
    property: 'squares',
    min: 0,
    max: 1,
    step: 0.01,
    onChange: function() {
        randomData();
        draw();
    }
}).addHelp('0 gives classical theo. Finite values give special tiles with straight lines.');

const colorController = {
    type: 'color',
    params: theo,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: theo,
    min: 1,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 'color1'
});

gui.add(colorController, {
    property: 'color2'
});


gui.add({
    type: 'boolean',
    params: theo,
    property: 'lines',
    onChange: function() {
        draw();
    }
});

gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'lineColor'
});

gui.add({
    type: 'boolean',
    params: theo,
    property: 'grid',
    onChange: function() {
        draw();
    }
});

gui.add(widthController, {
    property: 'gridWidth'
});

gui.add(colorController, {
    property: 'gridColor'
});

const data = [];

function randomData() {
    data.length = theo.nHorizontal * theo.nVertical;
    const length = data.length;
    for (var i = 0; i < length; i++) {
        if (Math.random() > theo.squares) {
            // classical theo tiles
            if (Math.random() > theo.p) {
                data[i] = 1;
            } else {
                data[i] = 0;
            }
        } else {
            data[i] = 2; // squares
        }
    }
}

// square tiles, x,y ranges 0...100
// lines and fills
const r=100*Math.sqrt(0.5);

function verticalLines() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.arc(-50, 50, r, -Math.PI/4, Math.PI / 4);
    canvasContext.moveTo(100, 100);
    canvasContext.arc(150, 50, r, 3*Math.PI/4, -3*Math.PI / 4);
    canvasContext.stroke();
}

function horizontalLines() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.arc(50, 150, r, -3*Math.PI/4, -Math.PI / 4);
    canvasContext.moveTo(100, 0);
    canvasContext.arc(50, -50, r, Math.PI/4, 3*Math.PI / 4);
    canvasContext.stroke();
}

function diagonalLines() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(100,0);
    canvasContext.moveTo(100, 100);
    canvasContext.lineTo(0,0);
    canvasContext.stroke();
}


// colorTheo: always draw color1 first
// the number is for the color of the diagonal
function verticalColor() {
    canvasContext.fillStyle = theo.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.arc(-50, 50, r, -Math.PI/4, Math.PI / 4);
    canvasContext.lineTo(0,0);
    canvasContext.moveTo(100, 100);
    canvasContext.arc(150, 50, r, 3*Math.PI/4, -3*Math.PI / 4);
    canvasContext.lineTo(100,100);
    canvasContext.fill();
    canvasContext.fillStyle = theo.color2;
       canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.arc(-50, 50, r, -Math.PI/4, Math.PI / 4);
    canvasContext.lineTo(100,100);
    canvasContext.arc(150, 50, r, 3*Math.PI/4, -3*Math.PI / 4);
    canvasContext.lineTo(0,0);
    canvasContext.fill();
}


function horizontalColor() {
    canvasContext.fillStyle = theo.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.arc(50, 150, r, -3*Math.PI/4, -Math.PI / 4);
    canvasContext.lineTo(100, 0);
    canvasContext.arc(50, -50, r, Math.PI/4, 3*Math.PI / 4);
    canvasContext.lineTo(0, 100);
    canvasContext.fill();
        canvasContext.fillStyle = theo.color2;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.arc(50, 150, r, -3*Math.PI/4, -Math.PI / 4);
    canvasContext.lineTo(0, 100);
     canvasContext.moveTo(100, 0);
   canvasContext.arc(50, -50, r, Math.PI/4, 3*Math.PI / 4);
    canvasContext.lineTo(100, 0);
    canvasContext.fill();
}



function diagonalColor() {
    canvasContext.fillStyle = theo.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(50,50);
    canvasContext.lineTo(0,0);
    canvasContext.lineTo(0,100);
    canvasContext.moveTo(100, 100);
    canvasContext.lineTo(50,50);
    canvasContext.lineTo(100,0);
    canvasContext.lineTo(100,100);
        canvasContext.lineTo(0,0);
    canvasContext.fill();
        canvasContext.fillStyle = theo.color2;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(50,50);
    canvasContext.lineTo(100,100);
    canvasContext.lineTo(0,100);
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(50,50);
    canvasContext.lineTo(100,0);
    canvasContext.lineTo(0,0);
        canvasContext.lineTo(0,0);
    canvasContext.fill();
}

function colorTheo(i, j, index) {
    if (data[index] < 2) {
        if (data[index] === 0) {
            // vertical
            verticalColor();
            canvasContext.strokeStyle = theo.lineColor;
            if (theo.lines) {
               verticalLines();
            }
        } else {
horizontalColor();
            canvasContext.strokeStyle = theo.lineColor;
            if (theo.lines) {
                horizontalLines();
            }
        }
    } else {
diagonalColor();
        canvasContext.strokeStyle = theo.lineColor;
        if (theo.lines) {
            diagonalLines();
        }
    }
}

function grid() {
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.strokeStyle = theo.gridColor;
    canvasContext.lineWidth = theo.gridWidth;
    for (var i = 1; i < theo.nHorizontal; i++) {
        const x = i * canvas.width / theo.nHorizontal;
        canvasContext.beginPath();
        canvasContext.moveTo(x, 0);
        canvasContext.lineTo(x, canvas.height);
        canvasContext.stroke();
    }
    for (i = 1; i < theo.nVertical; i++) {
        const x = i * canvas.width / theo.nHorizontal;
        canvasContext.beginPath();
        canvasContext.moveTo(0, x);
        canvasContext.lineTo(canvas.width, x);
        canvasContext.stroke();
    }
}

function draw() {
    output.isDrawing=true;
    var i, j, index;
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    index = 0;
    canvasContext.lineWidth = theo.lineWidth;
    const tileSize = canvas.width / theo.nHorizontal;
    for (i = 0; i < theo.nHorizontal; i++) {
        for (j = 0; j < theo.nVertical; j++) {
            canvasContext.setTransform(tileSize / 100, 0, 0, tileSize / 100, i * tileSize, j * tileSize);
            colorTheo(i, j, index);
            index += 1;
        }
    }
    if (theo.grid) {
        grid();
    }
}

randomData();
output.setCanvasWidthToHeight(theo.nHorizontal / theo.nVertical);

output.setCanvasDimensionsStepsize(theo.nHorizontal, theo.nVertical);

output.drawCanvasChanged = function(){
    draw();
};



draw();