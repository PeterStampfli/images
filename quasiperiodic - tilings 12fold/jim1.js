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
tiling.rhombColor = '#ff0000';
tiling.squareColor = '#00ff00';
tiling.triangleRColor = '#0000ff';
tiling.triangleLColor = '#00ffff';
tiling.midColor = '#9900ff';
tiling.triangleNoneColor = '#000000';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;
tiling.border = true;
tiling.subTriangle = true;
tiling.hyperBorderColor = '#000000';
tiling.hyperBorderWidth = 3;
tiling.hyperBorder = false;
tiling.decoration = 'solid color';
tiling.gridWidth = 3;
tiling.gridColor = '#ff8800';
tiling.borderMotif = 'right';

tiling.maxGen = 1;
tiling.initial = 'quarter square';
tiling.initial = 'mid';

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
            rhombColorController.show();
            squareColorController.show();
            triangleRColorController.show();
            triangleLColorController.show();
        } else {
            rhombColorController.hide();
            squareColorController.hide();
            triangleRColorController.hide();
            triangleLColorController.hide();
        }
        draw();
    }
});

gui.add({
    type: 'selection',
    params: tiling,
    property: 'borderMotif',
    options: ['left','mid', 'right'],
    onChange: function() {
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

const rhombColorController = gui.add(colorController, {
    property: 'rhombColor',
    labelText: 'rhomb'
});

const squareColorController = gui.add(colorController, {
    property: 'squareColor',
    labelText: 'square'
});

const triangleRColorController = gui.add(colorController, {
    property: 'triangleRColor',
    labelText: 'triangleR'
});

const triangleLColorController = gui.add(colorController, {
    property: 'triangleLColor',
    labelText: 'triangleL'
});

const midColorController = gui.add(colorController, {
    property: 'midColor',
    labelText: 'mid'
});

const triangleNoneColorController = gui.add(colorController, {
    property: 'triangleNoneColor',
    labelText: 'triangleNone'
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
    property: 'subTriangle',
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
    options: ['quarter square', 'rhomb', 'triangleR', 'triangleL', 'mid', 'triangleNone', 'square', 'dodecagon'],
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
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// the quarter square


// actually the minimum square, center of full square at (blX,blY), (trX,trY) is opposite corner
function quarterSquare(gen, blX, blY, trX, trY) {
    // make center and missing corners
    let cX = 0.5 * (blX + trX);
    let cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dX;
    // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
    // 0.732050808 = 2 / (1 + rt3);
    const upX = 0.732050808 * (tlX - blX);
    const upY = 0.732050808 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX-0.5*rightX, blY-0.5*rightY, brX+0.5*rightX, brY+0.5*rightY, trX+0.5*rightX+0.8*upX, trY+0.5*rightY+0.8*upY, tlX-0.5*rightX+0.8*upY, tlY-0.5*rightY+0.8*upY)) {
        if (gen >= tiling.maxGen) {} else {
            gen += 1;
            cX = blX + rt32 * rightX + 0.5 * upX;
            cY = blY + rt32 * rightY + 0.5 * upY;
            triangleR(gen, trX, trY, cX, cY);
            rhomb(gen, blX, blY, trX, trY);
            let aX = cX + rightX;
            let aY = cY + rightY;
            rhomb(gen, blX, blY, aX, aY);
            triangleL(gen, cX, cY, aX, aY);
            triangleL(gen, aX, aY, trX, trY);
            cX = blX + 0.5 * rightX + rt32 * upX;
            cY = blY + 0.5 * rightY + rt32 * upY;
            aX = cX + upX;
            aY = cY + upY;
            rhomb(gen, blX, blY, aX, aY);
            triangleL(gen, cX, cY, trX, trY);
            triangleR(gen, trX, trY, aX, aY);
            triangleR(gen, aX, aY, cX, cY);
            let bX = aX - rightX;
            let bY = aY - rightY;
            cX = blX + upX;
            cY = blY + upY;
            triangleR(gen, bX, bY, cX, cY);
            triangleL(gen, cX, cY, aX, aY);
            borderTiles(gen, bX, bY, aX, aY);
        }
    }
}

// actually the full square (blX,blY), (trX,trY) is opposite corner
function square(gen, blX, blY, trX, trY) {
    // make center and missing corners
    let cX = 0.5 * (blX + trX);
    let cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dX;
    // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
    // 0.366025404 = 1 / (1 + rt3);
    const upX = 0.366025404 * (tlX - blX);
    const upY = 0.366025404 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (gen >= tiling.maxGen) {
        if (tiling.drawBorders) {
            if (tiling.border) {
                canvasContext.strokeStyle = tiling.borderColor;
                output.setLineWidth(tiling.borderWidth);
                output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        } else {
            switch (tiling.decoration) {
                case 'solid color':
                    canvasContext.fillStyle = tiling.squareColor;
                    output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                    canvasContext.fill();
                    break;
                case 'grid':
                    canvasContext.strokeStyle = tiling.gridColor;
                    output.setLineWidth(tiling.gridWidth);
                    output.makePath(0.5 * (blX + brX), 0.5 * (blY + brY), 0.5 * (tlX + trX), 0.5 * (tlY + trY));
                    canvasContext.stroke();
                    output.makePath(0.5 * (blX + tlX), 0.5 * (blY + tlY), 0.5 * (brX + trX), 0.5 * (brY + trY));
                    canvasContext.stroke();
                    break;
            }
        }
        if (tiling.maxGen === 0) {
            triangleNone(gen, tlX, tlY, trX, trY);
            triangleNone(gen, trX, trY, brX, brY);
            triangleNone(gen, brX, brY, blX, blY);
            triangleNone(gen, blX, blY, tlX, tlY);
        }
    } else {
        quarterSquare(gen, cX, cY, blX, blY);
        quarterSquare(gen, cX, cY, brX, brY);
        quarterSquare(gen, cX, cY, tlX, tlY);
        quarterSquare(gen, cX, cY, trX, trY);
        gen += 1;
        if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
            canvasContext.strokeStyle = tiling.hyperBorderColor;
            output.setLineWidth(tiling.hyperBorderWidth);
            output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY, blX, blY);
            canvasContext.stroke();
        }
    }
}

// the 30 degrees rhomb, coordinates of the corners with acute angles
function rhomb(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.378937382=tan(Math.PI/12)*sqrt(2);
    const upX = 0.378937382 * (cX - bX);
    const upY = 0.378937382 * (cY - bY);
    const rightX = upY;
    const rightY = -upX;
    const rX = cX + 0.7071 * rightX;
    const rY = cY + 0.7071 * rightY;
    const lX = cX - 0.7071 * rightX;
    const lY = cY - 0.7071 * rightY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.rhombColor;
                        output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        // 1.274519=(1+sqrt(3))*cos(15)-0.5*(1+sqrt(3))/cos(15)
                        const lowX = cX - 1.2247 * upX;
                        const lowY = cY - 1.2247 * upY;
                        const highX = cX + 1.2247 * upX;
                        const highY = cY + 1.2247 * upY;
                        output.makePath(0.5 * (bX + lX), 0.5 * (bY + lY), lowX, lowY, 0.5 * (bX + rX), 0.5 * (bY + rY));
                        canvasContext.stroke();
                        output.makePath(0.5 * (tX + lX), 0.5 * (tY + lY), highX, highY, 0.5 * (tX + rX), 0.5 * (tY + rY));
                        canvasContext.stroke();
                        output.makePath(lowX, lowY, highX, highY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const bcX = cX - 0.7071 * upX;
            const bcY = cY - 0.7071 * upY;
            const tcX = cX + 0.7071 * upX;
            const tcY = cY + 0.7071 * upY;
            rhomb(gen, bX, bY, bcX, bcY);
            rhomb(gen, tX, tY, tcX, tcY);
            square(gen, rX, rY, lX, lY);
            //   0.3660254=1/(1+sqrt(3))
            //   0.6339745=sqrt(3)/(1+sqrt(3))
            const brX = 0.3660254 * (rX - bX);
            const brY = 0.3660254 * (rY - bY);
            triangleR(gen, bcX, bcY, bX + brX, bY + brY);
            borderTiles(gen, bcX, bcY, bcX + brY, bcY - brX);
            triangleNone(gen, rX, rY, bcX, bcY);
            triangleL(gen, bcX - brX, bcY - brY, bcX, bcY);
            triangleNone(gen, bcX, bcY, lX, lY);
            triangleNone(gen, tcX, tcY, rX, rY);
            triangleL(gen, tcX + brX, tcY + brY, tcX, tcY);
            triangleNone(gen, lX, lY, tcX, tcY);
            triangleR(gen, tcX, tcY, tX - brX, tY - brY);
            borderTiles(gen, tcX, tcY, tcX - brY, tcY + brX);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// third of a triangle, substitution triangles at right
// base a to b
// a is corner with rhomb, b has triangles
function triangleR(gen, aX, aY, bX, bY) {
    const rightX = 0.366025404 * (bX - aX);
    const rightY = 0.366025404 * (bY - aY);
    const upX = -rightY;
    const upY = rightX;
    // 0.788675135=(1+rt3)/2/rt3
    const cX = 0.5 * (aX + bX) + 0.788675135 * upX;
    const cY = 0.5 * (aY + bY) + 0.788675135 * upY;
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        // make directions
        // 0.366025404 = 1 / (1 + rt3);
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bX, bY);
                    canvasContext.stroke();
                    if (tiling.subTriangle) {
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
                        // redo grid
                        output.makePath(0.5 * (aX + bX), 0.5 * (aY + bY), cX, cY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const cbX = bX - rt32 * rightX + 0.5 * upX;
            const cbY = bY - rt32 * rightY + 0.5 * upY;
            triangleL(gen, cbX - rightX, cbY - rightY, cbX, cbY);
            rhomb(gen, aX, aY, cbX, cbY);
            triangleR(gen, cbX, cbY, aX + rightX, aY + rightY);
            borderTiles(gen, cbX, cbY, cbX - upX, cbY - upY);
            triangleR(gen, bX, bY, cbX, cbY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// third of a triangle, substitution triangles at left
// base a to b
// a is corner with rhomb, b has triangles
function triangleL(gen, aX, aY, bX, bY) {
    const rightX = 0.366025404 * (bX - aX);
    const rightY = 0.366025404 * (bY - aY);
    const upX = -rightY;
    const upY = rightX;
    // 0.788675135=(1+rt3)/2/rt3
    const cX = 0.5 * (aX + bX) + 0.788675135 * upX;
    const cY = 0.5 * (aY + bY) + 0.788675135 * upY;
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        // make directions
        // 0.366025404 = 1 / (1 + rt3);
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bX, bY);
                    canvasContext.stroke();
                    if (tiling.subTriangle) {
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
                        // redo grid
                        output.makePath(0.5 * (aX + bX), 0.5 * (aY + bY), cX, cY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const abX = aX + rt32 * rightX + 0.5 * upX;
            const abY = aY + rt32 * rightY + 0.5 * upY;
            triangleR(gen, abX, abY, abX + rightX, abY + rightY);
            rhomb(gen, abX, abY, bX, bY);
            triangleL(gen, abX, abY, aX, aY);
            triangleL(gen, bX - rightX, bY - rightY, abX, abY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// third of a triangle, base at side of square
// base a to b
function triangleNone(gen, aX, aY, bX, bY) {
    const rightX = 0.366025404 * (bX - aX);
    const rightY = 0.366025404 * (bY - aY);
    const upX = -rightY;
    const upY = rightX;
    // 0.788675135=(1+rt3)/2/rt3
    const cX = 0.5 * (aX + bX) + 0.788675135 * upX;
    const cY = 0.5 * (aY + bY) + 0.788675135 * upY;
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        // make directions
        // 0.366025404 = 1 / (1 + rt3);
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bX, bY);
                    canvasContext.stroke();
                    if (tiling.subTriangle) {
                        output.makePath(aX, aY, cX, cY, bX, bY);
                        canvasContext.stroke();
                    }
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.triangleNoneColor;
                        output.makePath(aX, aY, bX, bY, cX, cY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        // redo grid
                        output.makePath(0.5 * (aX + bX), 0.5 * (aY + bY), cX, cY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const abX = aX + rt32 * rightX + 0.5 * upX;
            const abY = aY + rt32 * rightY + 0.5 * upY;

            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// mid element, two thirds of a rectangle
// base a to b
function mid(gen, aX, aY, bX, bY) {
    const rightX = 0.366025404 * (bX - aX);
    const rightY = 0.366025404 * (bY - aY);
    const upX = -rightY;
    const upY = rightX;
    // 0.788675135=(1+rt3)/2/rt3
    const cX = 0.5 * (aX + bX) + 0.788675135 * upX;
    const cY = 0.5 * (aY + bY) + 0.788675135 * upY;
    const dX = 0.5 * (aX + bX) - 0.788675135 * upX;
    const dY = 0.5 * (aY + bY) - 0.788675135 * upY;
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY, dX, dY)) {
        // make directions
        // 0.366025404 = 1 / (1 + rt3);
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);

                    if (tiling.subTriangle) {
                        output.makePath(aX, aY, cX, cY, bX, bY, dX, dY, aX, aY);
                        canvasContext.stroke();
                    } else {
                        output.makePath(aX, aY, bX, bY);
                        canvasContext.stroke();
                    }
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.midColor;
                        output.makePath(aX, aY, dX, dY, bX, bY, cX, cY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        // redo grid
                        output.makePath(dX, dY, cX, cY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const acX = aX + rt32 * rightX + 0.5 * upX;
            const acY = aY + rt32 * rightY + 0.5 * upY;
            const adX = aX + rt32 * rightX - 0.5 * upX;
            const adY = aY + rt32 * rightY - 0.5 * upY;
            triangleNone(gen, acX, acY, acX + rightX, acY + rightY);
            triangleL(gen, acX, acY, aX, aY);
            triangleNone(gen, adX + rightX, adY + rightY, adX, adY);
            triangleNone(gen, adX, adY, acX, acY);
            triangleR(gen, aX, aY, adX, adY);
            triangleNone(gen, acX + rightX, acY + rightY, adX + rightX, adY + rightY);
            triangleL(gen, adX + rightX, adY + rightY, bX, bY);
            triangleR(gen, bX, bY, acX + rightX, acY + rightY);
            square(gen, adX, adY, acX + rightX, acY + rightY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(aX, aY, cX, cY, bX, bY, dX, dY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// different border motifs
function borderTiles(gen, inX, inY, outX, outY) {
    switch (tiling.borderMotif) {
        case 'right':
            triangleR(gen, inX, inY, outX, outY);
            triangleL(gen, outX, outY, inX, inY);
            break;
        case 'left':
            triangleL(gen, inX, inY, outX, outY);
            triangleR(gen, outX, outY, inX, inY);
            break;
        case 'mid':
            mid(gen, inX, inY, outX, outY);
            break;
    }
}

const size = 50; //length of side

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

// make that all sides have the same length, initially, for good substitution rule figures
function tile() {
    let s = 200;
    if (tiling.maxGen === 0) {
        s /= 1 + Math.sqrt(3);
    }
    const r = s / Math.sqrt(3);
    const z = s * Math.cos(Math.PI / 12);
    switch (tiling.initial) {
        case 'quarter square':
            quarterSquare(0, -s / 4, -s / 4, s / 4, s / 4);
            break;
        case 'square':
            square(0, -s / 2, -s / 2, s / 2, s / 2);
            break;
        case 'rhomb':
            rhomb(0, -z, 0, z, 0);
            break;
        case 'triangleR':
            triangleR(0, -s / 2, 0, s / 2, 0, 0, rt32 / 3 * s);
            break;
        case 'triangleL':
            triangleL(0, -s / 2, 0, s / 2, 0, 0, rt32 / 3 * s);
            break;
        case 'mid':
            mid(0, -s / 2, 0, s / 2, 0, 0, rt32 / 3 * s);
            break;
        case 'triangleNone':
            triangleNone(0, -s / 2, 0, s / 2, 0, 0, rt32 / 3 * s);
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb(0, 0, 0, secondX[i], secondY[i]);
            }
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