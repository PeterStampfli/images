/* jshint esversion: 6 */

import {
    ParamGui,
    output
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
const size = 2;
output.setInitialCoordinates(0, 0, size);
output.addGrid();

// parameters for drawing
const truchet = {};
truchet.color1 = '#ff0000'; // fill color
truchet.color2 = '#0000ff'; // the other fill color
truchet.lineColor = '#000000';
truchet.lineWidth = 3;
truchet.lines = true;
truchet.motif = 'schematic';

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
    min: 0.1,
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
    type: 'selection',
    params: truchet,
    property: 'motif',
    options: ['schematic', 'lines', 'halves'],
    onChange: function() {
        draw();
    }
});


// the basic rhomb
const rt32 = 0.5 * Math.sqrt(3);

const rhombs = {};
rhombs.maxGen = 1;

gui.add({
    type: 'number',
    params: rhombs,
    property: 'maxGen',
    labelText: 'generations',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});

function drawBorder(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.beginPath();
    canvasContext.moveTo(rightX, rightY);
    canvasContext.lineTo(topX, topY);
    canvasContext.lineTo(leftX, leftY);
    canvasContext.lineTo(bottomX, bottomY);
    canvasContext.closePath();
    canvasContext.stroke();
}

function rightArrow(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    const centerX = 0.5 * (topX + bottomX);
    const centerY = 0.5 * (topY + bottomY);
    canvasContext.fillStyle = truchet.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(0.5 * (centerX + bottomX), 0.5 * (centerY + bottomY));
    canvasContext.lineTo(0.5 * (centerX + rightX), 0.5 * (centerY + rightY));
    canvasContext.lineTo(0.5 * (centerX + topX), 0.5 * (centerY + topY));
    canvasContext.closePath();
    canvasContext.fill();
}

function upArrow(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    const centerX = 0.5 * (topX + bottomX);
    const centerY = 0.5 * (topY + bottomY);
    canvasContext.fillStyle = truchet.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(0.5 * (centerX + rightX), 0.5 * (centerY + rightY));
    canvasContext.lineTo(0.5 * (centerX + topX), 0.5 * (centerY + topY));
    canvasContext.lineTo(0.5 * (centerX + leftX), 0.5 * (centerY + leftY));
    canvasContext.closePath();
    canvasContext.fill();
}

function drawVLines(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    const bottomRightX = 0.5 * (bottomX + rightX);
    const bottomRightY = 0.5 * (bottomY + rightY);
    const topRightX = 0.5 * (topX + rightX);
    const topRightY = 0.5 * (topY + rightY);
    const bottomLeftX = 0.5 * (bottomX + leftX);
    const bottomLeftY = 0.5 * (bottomY + leftY);
    const topLeftX = 0.5 * (topX + leftX);
    const topLeftY = 0.5 * (topY + leftY);
    canvasContext.beginPath();
    canvasContext.moveTo(bottomLeftX, bottomLeftY);
    canvasContext.lineTo(topLeftX, topLeftY);
    canvasContext.moveTo(bottomX, bottomY);
    canvasContext.lineTo(topX, topY);
    canvasContext.moveTo(bottomRightX, bottomRightY);
    canvasContext.lineTo(topRightX, topRightY);
    canvasContext.stroke();
}

function drawHLines(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    const bottomRightX = 0.5 * (bottomX + rightX);
    const bottomRightY = 0.5 * (bottomY + rightY);
    const topRightX = 0.5 * (topX + rightX);
    const topRightY = 0.5 * (topY + rightY);
    const bottomLeftX = 0.5 * (bottomX + leftX);
    const bottomLeftY = 0.5 * (bottomY + leftY);
    const topLeftX = 0.5 * (topX + leftX);
    const topLeftY = 0.5 * (topY + leftY);
    canvasContext.beginPath();
    canvasContext.moveTo(bottomLeftX, bottomLeftY);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.moveTo(rightX, rightY);
    canvasContext.lineTo(leftX, leftY);
    canvasContext.moveTo(topLeftX, topLeftY);
    canvasContext.lineTo(topRightX, topRightY);
    canvasContext.stroke();
}

function drawHHalf(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(leftX, leftY);
    canvasContext.lineTo(topX, topY);
    canvasContext.lineTo(rightX, rightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function drawVHalf(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.color1;
    canvasContext.beginPath();
    canvasContext.moveTo(leftX, leftY);
    canvasContext.lineTo(topX, topY);
    canvasContext.lineTo(bottomX, bottomY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}


function drawVStripe(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.color1;
    const bottomRightX = 0.5 * (bottomX + rightX);
    const bottomRightY = 0.5 * (bottomY + rightY);
    const topRightX = 0.5 * (topX + rightX);
    const topRightY = 0.5 * (topY + rightY);
    const bottomLeftX = 0.5 * (bottomX + leftX);
    const bottomLeftY = 0.5 * (bottomY + leftY);
    const topLeftX = 0.5 * (topX + leftX);
    const topLeftY = 0.5 * (topY + leftY);
    canvasContext.beginPath();
    canvasContext.moveTo(bottomLeftX, bottomLeftY);
    canvasContext.lineTo(topLeftX, topLeftY);
    canvasContext.lineTo(topX, topY);
    canvasContext.lineTo(topRightX, topRightY);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.lineTo(bottomX, bottomY);
    canvasContext.fill();
    canvasContext.stroke();
}

function drawHStripe(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY) {
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.color1;
    const bottomRightX = 0.5 * (bottomX + rightX);
    const bottomRightY = 0.5 * (bottomY + rightY);
    const topRightX = 0.5 * (topX + rightX);
    const topRightY = 0.5 * (topY + rightY);
    const bottomLeftX = 0.5 * (bottomX + leftX);
    const bottomLeftY = 0.5 * (bottomY + leftY);
    const topLeftX = 0.5 * (topX + leftX);
    const topLeftY = 0.5 * (topY + leftY);
    canvasContext.beginPath();
    canvasContext.moveTo(bottomLeftX, bottomLeftY);
    canvasContext.lineTo(leftX,leftY);
    canvasContext.lineTo(topLeftX, topLeftY);
    canvasContext.lineTo(topRightX, topRightY);
    canvasContext.lineTo(rightX,rightY);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.fill();
    canvasContext.stroke();
}


function vRhomb(gen, bottomX, bottomY, topX, topY) {
    const centerX = 0.5 * (bottomX + topX);
    const centerY = 0.5 * (bottomY + topY);
    const upX = 0.6666 * (topX - centerX);
    const upY = 0.6666 * (topY - centerY);
    const rightX = centerX + rt32 * upY;
    const rightY = centerY - rt32 * upX;
    const leftX = centerX - rt32 * upY;
    const leftY = centerY + rt32 * upX;
    if (gen >= rhombs.maxGen) {
        switch (truchet.motif) {
            case 'schematic':
                drawBorder(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                upArrow(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                break;
            case 'lines':
                drawVLines(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                break;
            case 'halves':
                drawHHalf(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                break;
        }
        drawVStripe(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
    } else {
        gen += 1;
        vRhomb(gen, bottomX, bottomY, bottomX + upX, bottomY + upY);
        hRhomb(gen, bottomX + upX, bottomY + upY, leftX - upX, leftY - upY);
        hRhomb(gen, leftX, leftY, bottomX + upX, bottomY + upY);
        hRhomb(gen, bottomX + upX, bottomY + upY, rightX, rightY);
        vRhomb(gen, topX - upX, topY - upY, bottomX + upX, bottomY + upY);
        vRhomb(gen, topX - upX, topY - upY, rightX, rightY);
        vRhomb(gen, topX - upX, topY - upY, leftX, leftY);
        hRhomb(gen, topX - upX, topY - upY, rightX + upX, rightY + upY);
        vRhomb(gen, topX, topY, topX - upX, topY - upY);
    }
}

function hRhomb(gen, bottomX, bottomY, topX, topY) {
    const centerX = 0.5 * (bottomX + topX);
    const centerY = 0.5 * (bottomY + topY);
    const upX = 0.6666 * (topX - centerX);
    const upY = 0.6666 * (topY - centerY);
    const rightX = centerX + rt32 * upY;
    const rightY = centerY - rt32 * upX;
    const leftX = centerX - rt32 * upY;
    const leftY = centerY + rt32 * upX;
    if (gen >= rhombs.maxGen) {
        switch (truchet.motif) {
            case 'schematic':
                drawBorder(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                rightArrow(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                break;
            case 'lines':
                drawHLines(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                break;
            case 'halves':
                drawVHalf(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
                break;
        }
        drawHStripe(bottomX, bottomY, rightX, rightY, topX, topY, leftX, leftY);
    } else {
        gen += 1;
        vRhomb(gen, bottomX, bottomY, bottomX + upX, bottomY + upY);
        hRhomb(gen, bottomX + upX, bottomY + upY, leftX - upX, leftY - upY);
        vRhomb(gen, bottomX + upX, bottomY + upY, leftX, leftY);
        hRhomb(gen, bottomX + upX, bottomY + upY, rightX, rightY);
        hRhomb(gen, topX - upX, topY - upY, bottomX + upX, bottomY + upY);
        hRhomb(gen, rightX, rightY, topX - upX, topY - upY);
        vRhomb(gen, topX - upX, topY - upY, leftX, leftY);
        //  rhomb(gen, topX - upX, topY - upY, leftX + upX, leftY + upY);
        hRhomb(gen, topX - upX, topY - upY, rightX + upX, rightY + upY);
        vRhomb(gen, topX, topY, topX - upX, topY - upY);
    }
}


function draw() {
    console.log('draw');
    output.fillCanvasBackgroundColor();
    canvasContext.strokeStyle = 'white';
    canvasContext.fillStyle = 'white';

    canvasContext.lineCap = 'round';
    /*
    hRhomb(0, -0.5, -0.6, -0.5, 0.6);
    vRhomb(0, 0.5, -0.6, 0.5, 0.6);
    */
    hRhomb(0, -0.5, rt32, -0.5, -rt32);

    hRhomb(0, -0.5, -rt32, 1, 0);
    hRhomb(0, 1, 0, -0.5, rt32);


    output.drawGrid();
}



output.setDrawMethods(draw);
draw();