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
const irt2 = 1 / rt2;
const ratio = 1 + rt2;
const tan225 = Math.tan(Math.PI / 8);

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
            const cbX = bX + irt2 * (upX - rightX);
            const cbY = bY + irt2 * (upY - rightY);
            triangleL(gen, cbX - rightX, cbY - rightY, cbX, cbY);
            triangleL(gen, bX, bY, cbX, cbY);
            triangleL(gen, cbX, cbY, aX + rightX, aY + rightY);
            rhombR(gen, aX, aY, cbX, cbY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bX, bY, cX, cY, aX, aY);
                canvasContext.stroke();
            }
        }
    }
}

function triangleL(gen, aX, aY, bX, bY) {
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
                    canvasContext.stroke();
                    if (tiling.subSquare) {
                        output.makePath(aX, aY, cX, cY, bX, bY);
                        canvasContext.stroke();
                    }
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.triangleLColor;
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
            const caX = aX + irt2 * (upX + rightX);
            const caY = aY + irt2 * (upY + rightY);
            triangleR(gen, caX, caY, caX + rightX, caY + rightY);
            triangleR(gen, caX, caY, aX, aY);
            triangleR(gen, bX - rightX, bY - rightY, caX, caY);
            rhombL(gen, bX, bY, caX, caY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bX, bY, cX, cY, aX, aY);
                canvasContext.stroke();
            }
        }
    }
}

// the two rhombs
function rhombR(gen, aX, aY, bX, bY) {
    const cX = 0.5 * (aX + bX);
    const cY = 0.5 * (aY + bY);
    // half of the short diagonal
    let diagX = cX - aX;
    let diagY = cY - aY;
    diagX = -tan225 * (cY - aY);
    diagY = tan225 * (cX - aX);
    const topX = cX + diagX;
    const topY = cY + diagY;
    const bottomX = cX - diagX;
    const bottomY = cY - diagY;
    if (output.isInCanvas(aX, aY, bottomX, bottomY, bX, bY, topX, topY)) {
        // 1/(1+rt2)=0.414213562
        const rightX = 0.414213562 * (bottomX - aX);
        const rightY = 0.414213562 * (bottomY - aY);
        const upX = -rightY;
        const upY = rightX;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bottomX, bottomY, bX, bY, topX, topY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.rhombRColor;
                        output.makePath(aX, aY, bottomX, bottomY, bX, bY, topX, topY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        const r = 0.5 * (1 + rt2);
                        let h = tan225 * r;
                        //  h=0;
                        //   const h=0;
                        const abX = aX + r * rightX + h * upX;
                        const abY = aY + r * rightY + h * upY;
                        const baX = bX - r * rightX - h * upX;
                        const baY = bY - r * rightY - h * upY;
                        output.makePath(abX, abY, baX, baY);
                        canvasContext.stroke();
                        output.makePath(0.5 * (aX + topX), 0.5 * (aY + topY), abX, abY, 0.5 * (aX + bottomX), 0.5 * (aY + bottomY));
                        canvasContext.stroke();
                        output.makePath(0.5 * (bX + topX), 0.5 * (bY + topY), baX, baY, 0.5 * (bX + bottomX), 0.5 * (bY + bottomY));
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const aBottomX = aX + rightX;
            const aBottomY = aY + rightY;
            const bottomAX = topX - upX;
            const bottomAY = topY - upY;
            triangleR(gen, aX, aY, aBottomX, aBottomY);
            triangleL(gen, aBottomX, aBottomY, aBottomX + upX, aBottomY + upY);
            rhombR(gen, topX, topY, aBottomX, aBottomY);
            triangleL(gen, bottomAX, bottomAY, aBottomX, aBottomY);
            triangleR(gen, bottomX, bottomY, bottomAX, bottomAY);
            rhombL(gen, topX, topY, bottomX, bottomY);
            const topBX = bottomX + upX;
            const topBY = bottomY + upY;
            const bTopX = bX - rightX;
            const bTopY = bY - rightY;
            triangleR(gen, topX, topY, topBX, topBY);
            rhombR(gen, bottomX, bottomY, bTopX, bTopY);
            triangleL(gen, topBX, topBY, bTopX, bTopY);
            triangleL(gen, bTopX, bTopY, bTopX - upX, bTopY - upY);
            triangleR(gen, bX, bY, bTopX, bTopY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bottomX, bottomY, bX, bY, topX, topY, aX, aY);
                canvasContext.stroke();
            }

        }
    }
}

function rhombL(gen, aX, aY, bX, bY) {
    const cX = 0.5 * (aX + bX);
    const cY = 0.5 * (aY + bY);
    // half of the short diagonal
    let diagX = cX - aX;
    let diagY = cY - aY;
    diagX = -tan225 * (cY - aY);
    diagY = tan225 * (cX - aX);
    const topX = cX + diagX;
    const topY = cY + diagY;
    const bottomX = cX - diagX;
    const bottomY = cY - diagY;
    if (output.isInCanvas(aX, aY, bottomX, bottomY, bX, bY, topX, topY)) {
        // 1/(1+rt2)=0.414213562
        const rightX = 0.414213562 * (bottomX - aX);
        const rightY = 0.414213562 * (bottomY - aY);
        const upX = -rightY;
        const upY = rightX;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bottomX, bottomY, bX, bY, topX, topY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.rhombLColor;
                        output.makePath(aX, aY, bottomX, bottomY, bX, bY, topX, topY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        const r = 0.5 * (1 + rt2);
                        let h = tan225 * r;
                        //  h=0;
                        //   const h=0;
                        const abX = aX + r * rightX + h * upX;
                        const abY = aY + r * rightY + h * upY;
                        const baX = bX - r * rightX - h * upX;
                        const baY = bY - r * rightY - h * upY;
                        output.makePath(abX, abY, baX, baY);
                        canvasContext.stroke();
                        output.makePath(0.5 * (aX + topX), 0.5 * (aY + topY), abX, abY, 0.5 * (aX + bottomX), 0.5 * (aY + bottomY));
                        canvasContext.stroke();
                        output.makePath(0.5 * (bX + topX), 0.5 * (bY + topY), baX, baY, 0.5 * (bX + bottomX), 0.5 * (bY + bottomY));
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const bottomAX = topX - upX;
            const bottomAY = topY - upY;
            const aBottomX = bottomAX - rightX;
            const aBottomY = bottomAY - rightY;
            triangleL(gen, aBottomX, aBottomY, aX, aY);
            triangleR(gen, bottomX - rightX, bottomY - rightY, aBottomX, aBottomY);
            rhombL(gen, bottomX, bottomY, aBottomX, aBottomY);
            triangleR(gen, aBottomX, aBottomY, bottomAX, bottomAY);
            triangleL(gen,bottomAX, bottomAY,topX,topY);
            rhombR(gen,topX,topY,bottomX,bottomY);


            const topBX = bottomX + upX;
            const topBY = bottomY + upY;
            const bTopX = topBX + rightX;
            const bTopY = topBY + rightY;

            rhombL(gen,topX,topY,bTopX,bTopY);
            triangleL(gen,topBX,topBY,bottomX,bottomY);
            triangleR(gen,bTopX,bTopY,topBX,topBY);
            triangleR(gen,topX+rightX,topY+rightY,bTopX,bTopY);
            triangleL(gen,bTopX,bTopY,bX,bY);

            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bottomX, bottomY, bX, bY, topX, topY, aX, aY);
                canvasContext.stroke();
            }

        }
    }
}

// make that all sides have the same length, initially, for good substitution rule figures
function tile() {
    let s = 100;
    if (tiling.maxGen === 0) {
        s /= 1 + rt2;
    }
    const x = s * (1 + rt2 - 0.5 / rt2);
    const y = s * 0.5 * (1 + 1 / rt2);
    switch (tiling.initial) {
        case 'rhombR':
            rhombR(0, -x, -y, x, y);
            break;
        case 'rhombL':
            rhombL(0, -x, -y, x, y);
            break;
        case 'triangleR':
            s *= 1 + rt2;
            triangleR(0, -s / 2, -s / 4, s / 2, -s / 4);
            break;
        case 'triangleL':
            s *= 1 + rt2;
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