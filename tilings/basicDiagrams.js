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
let size = 500;
output.setInitialCoordinates(0, 0, size);

// size is actually line length of substitution pieces
size = 100;
output.addGrid();

// parameters for drawing
const tiling = {};
tiling.colors = true;
tiling.rhombColor = '#ff0000';
tiling.squareColor = '#00ff00';
tiling.triangleColor = '#ffff00';
tiling.lineColor = '#000000';
tiling.lineWidth = 2;
tiling.hyperBorderColor = '#000000';
tiling.hyperBorderWidth = 3;
tiling.hyperBorder = true;
tiling.initial = 'rhomb';

const colorController = {
    type: 'color',
    params: tiling,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: tiling,
    min: 0.1,
    onChange: function() {
        draw();
    }
};

gui.add({
    type: 'selection',
    params: tiling,
    property: 'initial',
    options: ['dodecagon', 'square', 'rhomb', 'triangle A', 'triangle B'],
    onChange: function() {
        draw();
    }
});

BooleanButton.greenRedBackground();
gui.add({
    type: 'boolean',
    params: tiling,
    property: 'colors',
    onChange: function() {
        draw();
    }
});

gui.add(colorController, {
    property: 'rhombColor'
});

gui.add(colorController, {
    property: 'squareColor'
});

gui.add(colorController, {
    property: 'triangleColor'
});


gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'lineColor'
});

const hyperBorderController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'hyperBorder',
    onChange: function() {
        draw();
    }
});

hyperBorderController.add(widthController, {
    property: 'hyperBorderWidth',
    labelText: 'width'
});

gui.add(colorController, {
    property: 'hyperBorderColor',
    labelText: 'color'
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
    output.setLineWidth(tiling.lineWidth);
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.fillStyle = tiling.rhombColor;
    canvasContext.strokeStyle = tiling.lineColor;
    for (let i = 0; i < 12; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(basicX[i + 1], basicY[i + 1]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
    }
    canvasContext.fillStyle = tiling.triangleColor;
    for (let i = 0; i < 12; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(basicX[i + 1], basicY[i + 1]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(secondX[i + 1], secondY[i + 1]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
    }
}

function drawSquare() {
    const canvasContext = output.canvasContext;
    output.setLineWidth(tiling.lineWidth);
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.strokeStyle = tiling.lineColor;
    canvasContext.fillStyle = tiling.rhombColor;
    for (let i = 1; i < 12; i += 3) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(basicX[i + 1], basicY[i + 1]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
    }
    canvasContext.fillStyle = tiling.triangleColor;
    for (let i = 2; i < 12; i += 3) {
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(basicX[i], basicY[i]);
        canvasContext.lineTo(basicX[i + 2], basicY[i + 2]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
        canvasContext.moveTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(secondX[i - 1], secondY[i - 1]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
        canvasContext.moveTo(basicX[i + 2], basicY[i + 2]);
        canvasContext.lineTo(secondX[i + 1], secondY[i + 1]);
        canvasContext.lineTo(secondX[i + 2], secondY[i + 2]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
    }
    canvasContext.fillStyle = tiling.squareColor;
    for (let i = 2; i < 12; i += 3) {
        canvasContext.beginPath();
        canvasContext.moveTo(basicX[i], basicY[i]);
        canvasContext.lineTo(secondX[i], secondY[i]);
        canvasContext.lineTo(secondX[i + 1], secondY[i + 1]);
        canvasContext.lineTo(basicX[i + 2], basicY[i + 2]);
        canvasContext.closePath();
        if (tiling.colors) {
            canvasContext.fill();
        }
        canvasContext.stroke();
    }
    if (tiling.hyperBorder) {
        const d = secondX[1];
        canvasContext.strokeStyle = tiling.hyperBorderColor;
        output.setLineWidth(tiling.hyperBorderWidth);
        output.makePath(d, d, -d, d, -d, -d, d, -d);
        canvasContext.closePath();
        canvasContext.stroke();
    }
}

function drawRhomb() {
    const rt3 = Math.sqrt(3);
    const right = Math.sqrt(0.5) * size;
    const canvasContext = output.canvasContext;
    output.setLineWidth(tiling.lineWidth);
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.strokeStyle = tiling.lineColor;
    canvasContext.fillStyle = tiling.squareColor;
    canvasContext.beginPath();
    canvasContext.moveTo(right, 0);
    canvasContext.lineTo(0, right);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(0, -right);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    const bottom = right / Math.tan(Math.PI / 12);
    const bottomRightX = right / (1 + rt3);
    const bottomRightY = bottom * rt3 / (1 + rt3);
    canvasContext.fillStyle = tiling.rhombColor;
    canvasContext.beginPath();
    canvasContext.moveTo(0, -bottom);
    canvasContext.lineTo(bottomRightX, -bottomRightY);
    canvasContext.lineTo(0, -right);
    canvasContext.lineTo(-bottomRightX, -bottomRightY);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.fillStyle = tiling.rhombColor;
    canvasContext.beginPath();
    canvasContext.moveTo(0, bottom);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.lineTo(0, right);
    canvasContext.lineTo(-bottomRightX, bottomRightY);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    const rightBottomX = right * (1 + rt32) / (1 + rt3);
    const rightBottomY = bottom * rt32 / (1 + rt3);
    const rightRightX = 2 * rightBottomX;
    const rightRightY = 2 * rightBottomY - right;
    canvasContext.fillStyle = tiling.triangleColor;
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(rightRightX, rightRightY);
    canvasContext.lineTo(right, 0);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(rightRightX, rightRightY);
    canvasContext.lineTo(bottomRightX, bottomRightY);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(rightRightX, -rightRightY);
    canvasContext.lineTo(right, 0);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(rightRightX, -rightRightY);
    canvasContext.lineTo(bottomRightX, -bottomRightY);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(-rightRightX, rightRightY);
    canvasContext.lineTo(-right, 0);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, right);
    canvasContext.lineTo(-rightRightX, rightRightY);
    canvasContext.lineTo(-bottomRightX, bottomRightY);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(-rightRightX, -rightRightY);
    canvasContext.lineTo(-right, 0);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, -right);
    canvasContext.lineTo(-rightRightX, -rightRightY);
    canvasContext.lineTo(-bottomRightX, -bottomRightY);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    if (tiling.hyperBorder) {
        canvasContext.strokeStyle = tiling.hyperBorderColor;
        output.setLineWidth(tiling.hyperBorderWidth);
        output.makePath(0, bottom, right, 0, 0, -bottom, -right, 0);
        canvasContext.closePath();
        canvasContext.stroke();
    }
}

function drawTriangleA() {
    const rt3 = Math.sqrt(3);
    const right = (0.5 + rt32) * size;
    const top = (1.5 + rt32) * size;
    const canvasContext = output.canvasContext;
    output.setLineWidth(tiling.lineWidth);
    canvasContext.strokeStyle = tiling.lineColor;
    canvasContext.fillStyle = tiling.squareColor;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, size);
    canvasContext.lineTo(rt32 * size, top - 0.5 * size);
    canvasContext.lineTo(0, right);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, size);
    canvasContext.lineTo(-rt32 * size, top - 0.5 * size);
    canvasContext.lineTo(0, right);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.fillStyle = tiling.triangleColor;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, top - size);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(rt32 * size, top - size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(0, top - size);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(-rt32 * size, top - size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(right, size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-right, size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    if (tiling.hyperBorder) {
        canvasContext.strokeStyle = tiling.hyperBorderColor;
        output.setLineWidth(tiling.hyperBorderWidth);
        output.makePath(0, top, right, 0, -right, 0);
        canvasContext.closePath();
        canvasContext.stroke();
    }
}


function drawTriangleB() {
    const rt3 = Math.sqrt(3);
    const right = (0.5 + rt32) * size;
    const top = (1.5 + rt32) * size;
    const canvasContext = output.canvasContext;
    output.setLineWidth(tiling.lineWidth);
    canvasContext.strokeStyle = tiling.lineColor;
    canvasContext.fillStyle = tiling.squareColor;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.fillStyle = tiling.triangleColor;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(-size / 2, size / 2);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(size / 2, -size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, 0);
    canvasContext.lineTo(right, size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-size / 2, -size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, 0);
    canvasContext.lineTo(-right, size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(right, size);
    canvasContext.lineTo(size / 2, size * 1.5);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-right, size);
    canvasContext.lineTo(-size / 2, size * 1.5);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.fillStyle = tiling.rhombColor;
    canvasContext.beginPath();
    canvasContext.moveTo(size / 2, size / 2);
    canvasContext.lineTo(size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(right, size);
    canvasContext.lineTo(size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(rt32 * size, top - size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-size / 2, size / 2);
    canvasContext.lineTo(-size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(0, top - size);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(-right, size);
    canvasContext.lineTo(-size / 2, size * 1.5);
    canvasContext.lineTo(0, top);
    canvasContext.lineTo(-rt32 * size, top - size / 2);
    canvasContext.closePath();
    if (tiling.colors) {
        canvasContext.fill();
    }
    canvasContext.stroke();
    if (tiling.hyperBorder) {
        canvasContext.strokeStyle = tiling.hyperBorderColor;
        output.setLineWidth(tiling.hyperBorderWidth);
        output.makePath(0, top, right, 0, -right, 0);
        canvasContext.closePath();
        canvasContext.stroke();
    }
}

function draw() {
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    console.log('draw');
    output.fillCanvasBackgroundColor();
    output.correctYAxis();
    switch (tiling.initial) {
        case 'dodecagon':
            drawDodecagonRhombs();
            break;
        case 'square':
            drawSquare();
            break;
        case 'rhomb':
            drawRhomb();
            break;
        case 'triangle A':
            drawTriangleA();
            break;
        case 'triangle B':
            drawTriangleB();
            break;
    }


    output.drawGrid();
}
output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ffffff');

draw();