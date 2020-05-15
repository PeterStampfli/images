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

gui.add({
    type: 'button',
    buttonText: 're-randomize',
    onClick: function() {
        randomData();
        draw();
    }
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
        data[i] =Math.floor((3*Math.random()));
    }
}


var tileHeight, tileWidth;
var index;
const rt32=Math.sqrt(3)/2;

function hexagon(){
    const s=tileWidth/Math.sqrt(3);

    function smallTopCircle(){
        canvasContext.beginPath();
        canvasContext.moveTo(tileWidth/4-rt32*p.lineWidth,0.5*tileHeight+0.5*p.lineWidth);
        canvasContext.arc(0,0.666*tileHeight,s/2-p.lineWidth/2,-1/6*Math.PI,-5*Math.PI/6,true);
        canvasContext.lineTo(-tileWidth/4-rt32*p.lineWidth,0.5*tileHeight-0.5*p.lineWidth);
        canvasContext.arc(0,0.666*tileHeight,s/2+p.lineWidth/2,-5/6*Math.PI,-Math.PI/6,false);
canvasContext.closePath();

        canvasContext.fill();
    }


    function smallBottomCircle(){
        canvasContext.beginPath();
        canvasContext.moveTo(tileWidth/4-rt32*p.lineWidth,-0.5*tileHeight-0.5*p.lineWidth);
        canvasContext.arc(0,-0.666*tileHeight,s/2-p.lineWidth/2,1/6*Math.PI,5*Math.PI/6,false);
        canvasContext.lineTo(-tileWidth/4-rt32*p.lineWidth,-0.5*tileHeight+0.5*p.lineWidth);
        canvasContext.arc(0,-0.666*tileHeight,s/2+p.lineWidth/2,5/6*Math.PI,Math.PI/6,true);
canvasContext.closePath();

        canvasContext.fill();
    }


function horizontalLine(){
    canvasContext.beginPath();
    canvasContext.moveTo(tileWidth/2,p.lineWidth/2);
    canvasContext.lineTo(tileWidth/2,-p.lineWidth/2);  
      canvasContext.lineTo(-tileWidth/2,-p.lineWidth/2);
    canvasContext.lineTo(-tileWidth/2,p.lineWidth/2);
    canvasContext.closePath();
    canvasContext.fill();
}



canvasContext.strokeStyle='black'
// the dots
    canvasContext.beginPath(tileWidth/2+p.lineWidth/2,0)
    canvasContext.arc(tileWidth/2,0,p.lineWidth/2,0,2*Math.PI);
    canvasContext.fill();
        canvasContext.beginPath(-tileWidth/2+p.lineWidth/2,0)
    canvasContext.arc(-tileWidth/2,0,p.lineWidth/2,0,2*Math.PI);
    canvasContext.fill();
    canvasContext.beginPath(tileWidth/4+p.lineWidth/2,tileHeight/2)
    canvasContext.arc(tileWidth/4,tileHeight/2,p.lineWidth/2,0,2*Math.PI);
    canvasContext.fill();
    canvasContext.beginPath(-tileWidth/4+p.lineWidth/2,tileHeight/2)
    canvasContext.arc(-tileWidth/4,tileHeight/2,p.lineWidth/2,0,2*Math.PI);
    canvasContext.fill(); 
       canvasContext.beginPath(tileWidth/4+p.lineWidth/2,-tileHeight/2)
    canvasContext.arc(tileWidth/4,-tileHeight/2,p.lineWidth/2,0,2*Math.PI);
    canvasContext.fill();
    canvasContext.beginPath(-tileWidth/4+p.lineWidth/2,-tileHeight/2)
    canvasContext.arc(-tileWidth/4,-tileHeight/2,p.lineWidth/2,0,2*Math.PI);
    canvasContext.fill();

    switch(data[index]){
        case 0:
    }
canvasContext.strokeStyle='yellow'

smallTopCircle();
smallBottomCircle();
horizontalLine();
    index+=1;
}


function draw() {
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
               hexagon();
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