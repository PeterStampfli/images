/* jshint esversion: 6 */

import {
    ParamGui,
    output
}
from "../libgui/modules.js";

/*
 * check if a polygon is inside the canvas, including margin around polygon
 * @method isInsideCanvas
 * @params {number ...} coordinates - x,y coordinate pairs for cornerss of the polygon
 * @return boolean, true if polygon plus margin touches canvas
 */
// relative margin, increase if there are holes
let polygonMargin = 1.1;

function isInsideCanvas(coordinates) {
    const length = arguments.length;
    let maxX = arguments[0];
    let minX = arguments[0];
    let maxY = arguments[1];
    let minY = arguments[1];
    for (let i = 2; i < length; i += 2) {
        maxX = Math.max(maxX, arguments[i]);
        minX = Math.min(minX, arguments[i]);
        maxY = Math.max(maxY, arguments[i + 1]);
        minY = Math.min(minX, arguments[i + 1]);
    }
    const margin = polygonMargin * Math.max(maxX - minX, maxY - minY);
    let inside = (maxX + margin > output.coordinateTransform.shiftX);
    inside = inside && (maxY + margin > output.coordinateTransform.shiftY);
    const right = output.coordinateTransform.shiftX + output.coordinateTransform.totalScale * output.canvas.width;
    inside = inside && (minX - margin < right);
    const top = output.coordinateTransform.shiftY + output.coordinateTransform.totalScale * output.canvas.height;
    inside = inside && (minY - margin < top);
    console.log('coords', arguments);
    console.log('minx,maxx,miny,maxy');
    console.log('left,right,bottom,top', output.coordinateTransform.shiftX, right, output.coordinateTransform.shiftY, top);
    console.log(inside);
    return inside;
}

// overprinting to avoid gaps
// center for overprinting
let overCenterX = 0;
let overCenterY = 0;
// overprinting factor is truchet.overprint

/**
 * set center for overprinting
 * @method setOverCenter
 * @param {number} x
 * @param {number} y
 */
function setOverCenter(x, y) {
    overCenterX = x;
    overCenterY = y;
}

/**
 * move path to stretched point 
 * @method overMoveTo
 * @param {number} x
 * @param {number} y
 */
function overMoveTo(x, y) {
    x = truchet.overprint * (x - overCenterX) + overCenterX;
    y = truchet.overprint * (y - overCenterY) + overCenterY;
    output.canvasContext.moveTo(x, y);
}

/**
 * make line to stretched point 
 * @method overLineTo
 * @param {number} x
 * @param {number} y
 */
function overLineTo(x, y) {
    x = truchet.overprint * (x - overCenterX) + overCenterX;
    y = truchet.overprint * (y - overCenterY) + overCenterY;
    output.canvasContext.lineTo(x, y);
}

/**
 * linear interpolation for numbers
 */


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
let size = 500;
output.setInitialCoordinates(0, 0, size);

// size is actually line length of substitution pieces
size = 100;
output.addGrid();

// parameters for drawing
const truchet = {};
truchet.rhomb = '#ff0000';
truchet.square = '#00ff00';
truchet.triangle = '#ffff00';
truchet.lineColor = '#000000';
truchet.lineWidth = 3;

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
    property: 'rhomb'
});

gui.add(colorController, {
    property: 'square'
});

gui.add(colorController, {
    property: 'triangle'
});


gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'lineColor'
});

const rt32 = 0.5 * Math.sqrt(3);

const basicX = [];
basicX.length = 15;

const basicY = [];
basicY.length = 15;

for (let i = 0; i < 15; i++) {
    basicX[i] = Math.cos(Math.PI * i / 6) * size;
    basicY[i] = Math.sin(Math.PI * i / 6) * size;
}

const secondX = [];
const secondY = [];
secondX.length = 14;
secondY.length = 14;

for (let i = 0; i < 14; i++) {
    secondX[i] = basicX[i] + basicX[i + 1];
    secondY[i] = basicY[i] + basicY[i + 1];
}

function drawDodecagonRhombs() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(truchet.lineWidth);
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.fillStyle = truchet.rhomb;
    canvasContext.strokeStyle = truchet.lineColor;
    for (let i = 0; i < 12; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(basicX[i + 1], basicY[i + 1]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
    }
    canvasContext.fillStyle = truchet.triangle;
    for (let i = 0; i < 12; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(basicX[i + 1], basicY[i + 1]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(secondX[i + 1], secondY[i + 1]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
    }
}

function drawSquare() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(truchet.lineWidth);
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.rhomb;
    for (let i = 1; i < 12; i += 3) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(basicX[i + 1], basicY[i + 1]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
    }
    canvasContext.fillStyle = truchet.triangle;
    for (let i = 2; i < 12; i += 3) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(basicX[i], basicY[i]);
        canvasContext.lineTo(basicX[i + 2], basicY[i + 2]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.moveTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(secondX[i - 1], secondY[i - 1]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
        canvasContext.moveTo(basicX[i + 2], basicY[i + 2]);
        canvasContext.lineTo(secondX[i + 1], secondY[i + 1]);
        canvasContext.lineTo(secondX[i + 2], secondY[i + 2]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
    }
    canvasContext.fillStyle = truchet.square;
    for (let i = 2; i < 12; i += 3) {
        canvasContext.beginPath();
        canvasContext.moveTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(secondX[i + 1], secondY[i + 1]);
        canvasContext.lineTo(basicX[i + 2], basicY[i + 2]);
        canvasContext.closePath();
        canvasContext.fill();
        canvasContext.stroke();
    }
}

function drawRhomb() {
    const rt3 = Math.sqrt(3);
    const right = Math.sqrt(0.5) * size;
    const canvasContext = output.canvasContext;
    output.setLineWidth(truchet.lineWidth);
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.square;
    canvasContext.beginPath();
    canvasContext.moveTo(right, 0);
    canvasContext.lineTo(0, right);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(0, -right);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    const bottom = right / Math.tan(Math.PI / 12);
    const bottomRightX = right / (1 + rt3);
    const bottomRightY = bottom * rt3 / (1 + rt3);
    canvasContext.fillStyle = truchet.rhomb;
    canvasContext.beginPath();
    canvasContext.moveTo(0, -bottom);
    canvasContext.lineTo(bottomRightX, -bottomRightY);
    canvasContext.lineTo(0, -right);
    canvasContext.lineTo(-bottomRightX, -bottomRightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = truchet.rhomb;
    canvasContext.beginPath();
    canvasContext.moveTo(0, bottom);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.lineTo(0, right);
    canvasContext.lineTo(-bottomRightX, bottomRightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    const rightBottomX = right * (1 + rt32) / (1 + rt3);
    const rightBottomY = bottom * rt32 / (1 + rt3);
    const rightRightX = 2 * rightBottomX;
    const rightRightY = 2 * rightBottomY - right;
    canvasContext.fillStyle = truchet.triangle;
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(rightRightX, rightRightY);
    canvasContext.lineTo(right, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(rightRightX, rightRightY);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(rightRightX, -rightRightY);
    canvasContext.lineTo(right, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(rightRightX, -rightRightY);
    canvasContext.lineTo(bottomRightX, -bottomRightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(-rightRightX, rightRightY);
    canvasContext.lineTo(-right, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(-rightRightX, rightRightY);
    canvasContext.lineTo(-bottomRightX, bottomRightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(-rightRightX, -rightRightY);
    canvasContext.lineTo(-right, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(-rightRightX, -rightRightY);
    canvasContext.lineTo(-bottomRightX, -bottomRightY);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function drawTriangleA() {
    const rt3 = Math.sqrt(3);
    const right = (0.5 + rt32) * size;
    const top = (1.5 + rt32) * size;
    const canvasContext = output.canvasContext;
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.square;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, size);
    canvasContext.lineTo(rt32 * size, top - 0.5 * size);
    canvasContext.lineTo(0, right);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, size);
    canvasContext.lineTo(-rt32 * size, top - 0.5 * size);
    canvasContext.lineTo(0, right);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = truchet.triangle;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, top - size);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(rt32 * size, top - size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, top - size);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(-rt32 * size, top - size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(right, size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-right, size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}


function drawTriangleB() {
    const rt3 = Math.sqrt(3);
    const right = (0.5 + rt32) * size;
    const top = (1.5 + rt32) * size;
    const canvasContext = output.canvasContext;
    output.setLineWidth(truchet.lineWidth);
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.fillStyle = truchet.square;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = truchet.triangle;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(right, size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-right, size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, size);
    canvasContext.lineTo(size / 2, size * 1.5);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, size);
    canvasContext.lineTo(-size / 2, size * 1.5);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillStyle = truchet.rhomb;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(right, size);
    canvasContext.lineTo(size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(rt32 * size, top - size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-right, size);
    canvasContext.lineTo(-size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(-rt32 * size, top - size / 2);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
}

function draw() {
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    console.log('draw');
    output.fillCanvasBackgroundColor();
    output.correctYAxis();

    //drawDodecagonRhombs();
    //drawSquare();
    // drawRhomb();
    //  drawTriangleA();
    drawTriangleB();

    output.drawGrid();
}
output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ffffff');

draw();