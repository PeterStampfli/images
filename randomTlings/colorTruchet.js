/* jshint esversion: 6 */

// colored random truchet tiles
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
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

const truchet = {};
truchet.nHorizontal = 12; // number of tiles in x-direction
truchet.nVertical = 12; // number of tiles in y-direction
truchet.color1 = '#ff0000'; // fill color
truchet.color2 = '#0000ff'; // the other fill color
truchet.lineColor = '#000000';
truchet.lineWidth = 3;
truchet.lines = true;
truchet.grid = true;
truchet.gridColor = '#aaaa00';
truchet.gridWidth = 1;
truchet.p = 0.5; // relative probability of tiles, o.5 gives classical truchet, 0 gives hor. lines
truchet.squares = 0; // probability for extra tile with squares

truchet.symmetry='d4';

gui.addParagraph("<strong>Truchet's</strong>");

gui.add({
    type: 'number',
    params: truchet,
    property: 'nHorizontal',
    min: 1,
    step: 1,
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(truchet.nHorizontal / truchet.nVertical);
        output.setCanvasDimensionsStepsize(truchet.nHorizontal, truchet.nVertical);
    }
});

gui.add({
    type: 'number',
    params: truchet,
    property: 'nVertical',
    min: 1,
    step: 1,
    onChange: function() {
        randomData();
        output.setCanvasWidthToHeight(truchet.nHorizontal / truchet.nVertical);
        output.setCanvasDimensionsStepsize(truchet.nHorizontal, truchet.nVertical);
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
    params: truchet,
    property: 'p',
    labelText: 'morphing',
    min: 0,
    max: 1,
    step: 0.01,
    onChange: function() {
        randomData();
        draw();
    }
}).addHelp('0.5 gives classical truchet. Other values change the probabilities for selecting tiles. 0 gives horizontal percolating strips. 1 gives isolated dots.');

gui.add({
    type: 'number',
    params: truchet,
    property: 'squares',
    min: 0,
    max: 1,
    step: 0.01,
    onChange: function() {
        randomData();
        draw();
    }
}).addHelp('0 gives classical truchet. Finite values give special tiles with straight lines.');

const colorController = {
    type: 'color',
    params: truchet,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: truchet,
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
    params: truchet,
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
    params: truchet,
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
    data.length = truchet.nHorizontal * truchet.nVertical;
    const length = data.length;
    for (var i = 0; i < length; i++) {
        if (Math.random() > truchet.squares) {
            // classical truchet tiles
            if (Math.random() > truchet.p) {
                data[i] = 1;
            } else {
                data[i] = 0;
            }
        } else {
            data[i] = 2; // squares
        }
    }
}

function bottomLeftArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.arc(0, 0, 50, 0, Math.PI / 2);
    canvasContext.stroke();
}

function bottomRightArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 50);
    canvasContext.arc(100, 0, 50, Math.PI / 2, Math.PI);
    canvasContext.stroke();
}

function topRightArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 100);
    canvasContext.arc(100, 100, 50, Math.PI, Math.PI * 1.5);
    canvasContext.stroke();
}

function topLeftArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.arc(0, 100, 50, Math.PI * 1.5, Math.PI * 2);
    canvasContext.stroke();
}

function cross() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.lineTo(50, 100);
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(100, 50);
    canvasContext.stroke();
}

function bottomLeftQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(50, 0);
    canvasContext.arc(0, 0, 50, 0, Math.PI / 2);
    canvasContext.lineTo(0, 0);
    canvasContext.fill();
}

function bottomRightQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.arc(100, 0, 50, Math.PI / 2, Math.PI);
    canvasContext.lineTo(100, 0);
    canvasContext.fill();
}

function topRightQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 100);
    canvasContext.lineTo(50, 100);
    canvasContext.arc(100, 100, 50, Math.PI, Math.PI * 1.5);
    canvasContext.lineTo(100, 100);
    canvasContext.fill();
}

function topLeftQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.arc(0, 100, 50, Math.PI * 1.5, Math.PI * 2);
    canvasContext.lineTo(0, 100);
    canvasContext.fill();
}

function downDiagonalBent() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.arc(0, 0, 50, 0, Math.PI / 2);
    canvasContext.lineTo(0, 100);
    canvasContext.lineTo(50, 100);
    canvasContext.arc(100, 100, 50, Math.PI, Math.PI * 1.5);
    canvasContext.lineTo(100, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function upDiagonalBent() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.arc(0, 100, 50, Math.PI * 1.5, Math.PI * 2);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.arc(100, 0, 50, Math.PI * 0.5, Math.PI);
    canvasContext.closePath();
    canvasContext.fill();
}

function upDiagonalSquares() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(50, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function downDiagonalSquares() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(100, 0);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(50, 100);
    canvasContext.closePath();
    canvasContext.fill();
}

// putting pieces together to make tiles

// colorTruchet: always draw color1 first
// the number is for the color of the diagonal
function colorTruchetUp1() {
    canvasContext.fillStyle = truchet.color1;
    upDiagonalBent();
    canvasContext.fillStyle = truchet.color2;
    topLeftQuarterDisc();
    bottomRightQuarterDisc();
}

function colorTruchetDown1() {
    canvasContext.fillStyle = truchet.color1;
    downDiagonalBent();
    canvasContext.fillStyle = truchet.color2;
    topRightQuarterDisc();
    bottomLeftQuarterDisc();
}

function colorTruchetUp2() {
    canvasContext.fillStyle = truchet.color1;
    topLeftQuarterDisc();
    bottomRightQuarterDisc();
    canvasContext.fillStyle = truchet.color2;
    upDiagonalBent();
}

function colorTruchetDown2() {
    canvasContext.fillStyle = truchet.color1;
    topRightQuarterDisc();
    bottomLeftQuarterDisc();
    canvasContext.fillStyle = truchet.color2;
    downDiagonalBent();
}


function colorTruchet(i, j, index) {
    let s = i & 1;
    let invers=0;
    switch (truchet.symmetry){
        case 'd4':
        if (i>truchet.nHorizontal-1-i){
           i=truchet.nHorizontal-1-i;
           invers=1-invers;
        }

        if (j>truchet.nVertical-1-j){
           j=truchet.nVertical-1-j;
           invers=1-invers;
        }
        if (i>j){
            const h=i;
            i=j;
            j=h;
        }
        break;
    }
    index=i+j*truchet.nHorizontal;
    let dataIndex=data[index];
    if ((invers===1)&&(dataIndex<2)){
        dataIndex=1-dataIndex;
    }
    if (truchet.p > 0.5) {
        s = (i + j) & 1;
    }
    s=0;
    if (dataIndex < 2) {
        if (dataIndex === s) {
            if (((i + j) & 1)===invers) {
                colorTruchetUp1();
            } else {
                colorTruchetUp2();
            }
            canvasContext.strokeStyle = truchet.lineColor;
            if (truchet.lines) {
                bottomRightArc();
                topLeftArc();
            }
        } else {
            if (((i + j) & 1)===invers) {
                colorTruchetDown2();
            } else {
                colorTruchetDown1();
            }
            canvasContext.strokeStyle = truchet.lineColor;
            if (truchet.lines) {
                bottomLeftArc();
                topRightArc();
            }
        }
    } else {
        if (((i + j) & 1)===invers){
            canvasContext.fillStyle = truchet.color1;
            upDiagonalSquares();
            canvasContext.fillStyle = truchet.color2;
            downDiagonalSquares();
        } else {
            canvasContext.fillStyle = truchet.color2;
            upDiagonalSquares();
            canvasContext.fillStyle = truchet.color1;
            downDiagonalSquares();
        }
        canvasContext.strokeStyle = truchet.lineColor;
        if (truchet.lines) {
            cross();
        }
    }
}

function grid() {
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.strokeStyle = truchet.gridColor;
    canvasContext.lineWidth = truchet.gridWidth;
    for (var i = 1; i < truchet.nHorizontal; i++) {
        const x = i * canvas.width / truchet.nHorizontal;
        canvasContext.beginPath();
        canvasContext.moveTo(x, 0);
        canvasContext.lineTo(x, canvas.height);
        canvasContext.stroke();
    }
    for (i = 1; i < truchet.nVertical; i++) {
        const x = i * canvas.width / truchet.nHorizontal;
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
    canvasContext.lineWidth = truchet.lineWidth;
    const tileSize = canvas.width / truchet.nHorizontal;
    for (i = 0; i < truchet.nHorizontal; i++) {
        for (j = 0; j < truchet.nVertical; j++) {
            canvasContext.setTransform(tileSize / 100, 0, 0, tileSize / 100, i * tileSize, j * tileSize);
            colorTruchet(i, j, index);
            index += 1;
        }
    }
    if (truchet.grid) {
        grid();
    }
}

randomData();
output.setCanvasWidthToHeight(truchet.nHorizontal / truchet.nVertical);

output.setCanvasDimensionsStepsize(truchet.nHorizontal, truchet.nVertical);
output.drawCanvasChanged = draw;
draw();