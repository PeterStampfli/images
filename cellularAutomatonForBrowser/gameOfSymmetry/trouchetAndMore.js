/* jshint esversion: 6 */


import {
    ParamGui,
    output,
    animation
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
    closed: false
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');
canvas.style.backgroundColor = 'lightBlue';
output.setCanvasWidthToHeight(1);

const color1 = '#ff0000';
const color2 = '#0000ff';
const lineColor='black';
const gridColor='white';

const nTiles = 10;
const overprint = 1.1;

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


function upDiagonalStraight() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function downDiagonalStraight() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(100, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.closePath();
    canvasContext.fill();
}


function bottomLeftTriangle() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.closePath();
    canvasContext.fill();
}


function bottomRightTriangle() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function topRightTriangle() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.closePath();
    canvasContext.fill();
}

function topLeftTriangle() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.closePath();
    canvasContext.fill();
}

function basicTruchet() {
    if (data[index] === 0) {
        bottomRightArc();
        topLeftArc();
    } else {
        bottomLeftArc();
        topRightArc();
    }
}

// colorTruchet: always draw color1 first
// the number is for the color of the diagonal
function colorTruchetUp1(){
    canvasContext.fillStyle=color1;
upDiagonalBent();
canvasContext.fillStyle=color2;
topLeftQuarterDisc();
bottomRightQuarterDisc();

}

function colorTruchetDown1(){
    canvasContext.fillStyle=color1;
downDiagonalBent();
canvasContext.fillStyle=color2;
topRightQuarterDisc();
bottomLeftQuarterDisc();

}

function colorTruchetUp2(){
canvasContext.fillStyle=color1;
topLeftQuarterDisc();
bottomRightQuarterDisc();
    canvasContext.fillStyle=color2;
upDiagonalBent();
}

function colorTruchetDown2(){
canvasContext.fillStyle=color1;
topRightQuarterDisc();
bottomLeftQuarterDisc();
    canvasContext.fillStyle=color2;
downDiagonalBent();
}



function colorTruchet() {
    if (data[index] === 0) {
        if ((i+j)&1){
            colorTruchetUp1();
            } else {
colorTruchetUp2();
            }

            canvasContext.strokeStyle = lineColor;
        

        bottomRightArc();
        topLeftArc();
    } else {
               if ((i+j)&1){
            colorTruchetDown2();
            } else {
colorTruchetDown1();
            }
            canvasContext.strokeStyle = lineColor;
        bottomLeftArc();
        topRightArc();
    }
}


var i, j, index;

const data = [];
data.length = nTiles * nTiles;

const nStates = 2;

function randomData() {
    const length = data.length;
    for (var i = 0; i < length; i++) {
        data[i] = Math.floor(Math.random() * nStates);
    }
}


function percolationXData() {
    index = 0;
    const length = data.length;
    for (i = 0; i < nTiles; i++) {
        for (j = 0; j < nTiles; j++) {
            data[index] = i & 1;
            index += 1;

        }
    }
}


function grid() {
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.strokeStyle=gridColor;
    for (i = 1; i < nTiles; i++) {
        const x=i*canvas.width/nTiles;
        canvasContext.beginPath()
        canvasContext.moveTo(0,x);
        canvasContext.lineTo(canvas.width,x);
        canvasContext.moveTo(x,0);
        canvasContext.lineTo(x,canvas.width);
        canvasContext.stroke();
    }
}

randomData();
//percolationXData();
output.setCanvasDimensionsStepsize(nTiles);

// be aware that changing the canvas dimensions resets the context
function draw() {

    canvasContext.lineWidth = 2;

    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    // canvasContext.clearRect(0,0,canvas.width,canvas.height);
    index = 0;

    const tileSize = canvas.width / nTiles;
    for (i = 0; i < nTiles; i++) {
        for (j = 0; j < nTiles; j++) {
            canvasContext.setTransform(tileSize / 100, 0, 0, tileSize / 100, i * tileSize, j * tileSize);
            colorTruchet();
            index += 1;

        }
    }

//grid();

}

draw();
output.draw = draw;