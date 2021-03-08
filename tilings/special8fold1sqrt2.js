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

output.createCanvas(gui);
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
output.addCursorposition();
output.setInitialCoordinates(0, 0, 210);
output.addGrid();

// parameters for drawing
const tiling = {};
// colors
tiling.rhombRColor = '#ff0000';
tiling.rhombLColor = '#ff9900';
tiling.triangleRColor = '#0000ff';
tiling.triangleLColor = '#00ffff';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;
tiling.border = true;
tiling.subSquare = true;
tiling.hyperBorderColor = '#000000';
tiling.hyperBorderWidth = 3;
tiling.hyperBorder = false;
tiling.decoration = 'solid color';
tiling.gridWidth = 3;
tiling.gridColor = '#ff8800';

tiling.maxGen = 1;
tiling.initial = 'rhombR';

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

gui.addParagraph('<strong>appearance of tiles</strong>');


gui.add({
    type: 'selection',
    params: tiling,
    property: 'decoration',
    options: ['none', 'solid color', 'grid'],
    onChange: function() {
        if (tiling.decoration === 'grid') {
            gridWidthController.show();
            gridColorController.show();
        } else {
            gridWidthController.hide();
            gridColorController.hide();
        }
        if (tiling.decoration === 'solid color') {
            rhombRColorController.show();
            rhombLColorController.show();
            triangleRColorController.show();
            triangleLColorController.show();
        } else {
            rhombRColorController.hide();
            rhombLColorController.hide();
            triangleRColorController.hide();
            triangleLColorController.hide();
        }
        draw();
    }
});

const gridColorController = gui.add(colorController, {
    property: 'gridColor',
    labelText: 'grid'
});

const gridWidthController = gui.add(widthController, {
    property: 'gridWidth',
    labelText: 'width of grid'
});
gridWidthController.hide();
gridColorController.hide();

const rhombRColorController = gui.add(colorController, {
    property: 'rhombRColor',
    labelText: 'rhombR'
});

const rhombLColorController = gui.add(colorController, {
    property: 'rhombLColor',
    labelText: 'rhombR'
});

const triangleRColorController = gui.add(colorController, {
    property: 'triangleRColor',
    labelText: 'triangleR'
});

const triangleLColorController = gui.add(colorController, {
    property: 'triangleLColor',
    labelText: 'triangleL'
});

BooleanButton.greenRedBackground();
const borderController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'border',
    onChange: function() {
        draw();
    }
});

borderController.add(widthController, {
    property: 'borderWidth',
    labelText: 'width'
});

gui.add(colorController, {
    property: 'borderColor',
    labelText: 'color'
});

const subTriangleController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'subSquare',
    onChange: function() {
        draw();
    }
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

gui.addParagraph('<strong>tiling</strong>');

gui.add({
    type: 'selection',
    params: tiling,
    property: 'initial',
    options: ['rhombR', 'rhombL', 'triangleR', 'triangleL'],
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: tiling,
    property: 'maxGen',
    labelText: 'iterations',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});

// tiles of the tiling
//--------------------
const rt2 = Math.sqrt(2);
const ratio = 1 + rt2;

// the triangle is a quarter of a square
function triangleR(gen, aX, aY, bX, bY) {
    const rightX = (bX - aX) / ratio;
    const rightY = (bY - aY) / ratio;
    const upX = -rightY;
    const upY = rightX;
    const cX = 0.5 * (aX + bX + ratio * upX);
    const cY = 0.5 * (aY + bY + ratio * upY);
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bX, bY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                    if (tiling.subSquare) {
                        output.makePath(aX, aY, cX, cY, bX, bY);
                        canvasContext.stroke();
                    }
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.triangleRColor;
                        output.makePath(aX, aY, bX, bY, cX, cY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        output.makePath(0.5 * (aX + bX), 0.5 * (aY + bY), cX, cY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;


            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bX, bY, cX, cY, aX, aY);
                canvasContext.stroke();
            }

        }
    }
}

// the triangle is a quarter of a square
function triangleL(gen, aX, aY, bX, bY) {

}

// the two rhombs
function rhombR(gen, aX, aY, bX, bY) {
    const cX = 0.5 * (aX + bX);
    const cY = 0.5 * (aY + bY);
    const tan225 = Math.tan(Math.PI / 8);
    // half of the short diagonal
    const diagY = tan225 * (cX - aX);
    const diagX = -tan225 * (cY - aY);
    const topX = cX + diagX;
    const topY = cY + diagY;
    const bottomX = cX - diagX;
    const bottomY = cY - diagY;
}

function rhombL(gen, aX, aY, bX, bY) {

}


// make that all sides have the same length, initially, for good substitution rule figures
function tile() {
    let s = 100;
    if (tiling.maxGen === 0) {
        s /= 1 + Math.sqrt(2);
    }
    const x = s * (0.5 + Math.sqrt(2));
    const y = s * 0.5 * (1 + 1 / Math.sqrt(2));
    switch (tiling.initial) {
        case 'rhombR':
            rhombR(0, -x, -y, x, y);
            break;
        case 'rhombL':
            rhombL(0, -x, -y, x, y);
            break;
        case 'triangleR':
            s *= 1 + Math.sqrt(2);
            triangleR(0, -s / 2, -s / 4, s / 2, -s / 4);
            break;
        case 'triangleL':
            s *= 1 + Math.sqrt(2);
            triangleL(0, -s / 2, -s / 4, s / 2, -s / 4);
            break;
    }
}

function draw() {
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.correctYAxis();
    // either draw borders or some tile-design
    tiling.drawBorders = false;
    if (tiling.decoration !== 'none') {
        tile();
    }
    if (tiling.hyperBorder || tiling.border) {
        tiling.drawBorders = true;
        tile();
    }
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();