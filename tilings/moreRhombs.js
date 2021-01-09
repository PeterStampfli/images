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
output.setInitialCoordinates(0, 0, 210);
output.addGrid();

// parameters for drawing
const tiling = {};
// colors
tiling.rhomb30Color = '#ff0000';
tiling.rhomb60Color = '#ffff00';
tiling.squareColor = '#00ff00';
tiling.triangleRColor = '#0000ff';
tiling.triangleLColor = '#00ffff';
tiling.marker = true;
tiling.markerSize = 1;
tiling.markerColor = '#444444';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;
tiling.border = true;
tiling.hyperBorderColor = '#000000';
tiling.hyperBorderWidth = 3;
tiling.hyperBorder = false;
tiling.decoration = 'solid color';
tiling.gridWidth = 3;
tiling.gridColor = '#ff8800';

tiling.maxGen = 1;
tiling.initial = 'rhomb60';

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
            rhomb30ColorController.show();
            squareColorController.show();
            triangleRColorController.show();
            triangleLColorController.show();
        } else {
            rhomb30ColorController.hide();
            squareColorController.hide();
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

const rhomb30ColorController = gui.add(colorController, {
    property: 'rhomb30Color',
    labelText: 'rhomb30'
});

const rhomb60ColorController = gui.add(colorController, {
    property: 'rhomb60Color',
    labelText: 'rhomb60'
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

const markerColorController = gui.add(colorController, {
    property: 'markerColor',
    labelText: 'marker'
});
markerColorController.hide();

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

const markerController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'marker',
    onChange: function() {
        draw();
    }
});

markerController.add(widthController, {
    property: 'markerSize',
    labelText: 'size'
});

gui.add(colorController, {
    property: 'markerColor',
    labelText: 'color'
});

gui.addParagraph('<strong>tiling</strong>');

gui.add({
    type: 'selection',
    params: tiling,
    property: 'initial',
    options: ['square', 'rhomb30', 'rhomb60', 'triangleR', 'triangleL', 'dodecagon'],
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
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
                if (tiling.marker) {
                    canvasContext.fillStyle = tiling.markerColor;
                    const s = tiling.markerSize;
                    output.makePath(blX, blY, blX + s * rightX, blY + s * rightY, blX + s * upX, blY + s * upY);
                    canvasContext.fill();
                    output.makePath(trX, trY, trX - s * rightX, trY - s * rightY, trX - s * upX, trY - s * upY);
                    canvasContext.fill();
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
        } else {
            gen += 1;
            rhomb30(gen, cX, cY, tlX, tlY);
            rhomb30(gen, cX, cY, trX, trY);
            rhomb30(gen, cX, cY, blX, blY);
            rhomb30(gen, cX, cY, brX, brY);
            // rhomb60(gen,brX,brY,blX+rightX,blY+rightY);
            rhomb60(gen, brX, brY, trX - upX, trY - upY);
            rhomb60(gen, tlX, tlY, blX + upX, blY + upY);
            //  rhomb60(gen,tlX,tlY,trX-rightX,trY-rightY);
            let pX = brX - rt32 * rightX + 0.5 * upX;
            let pY = brY - rt32 * rightY + 0.5 * upY;
            rhomb30(gen, blX, blY, pX, pY);
            // a is corner with no rhomb60, b has one, c has two
            // abc winds right or left as seen from center of triangle
            triangleL(gen, cX, cY, pX, pY, pX - rightX, pY - rightY);
            pX = tlX + 0.5 * rightX - rt32 * upX;
            pY = tlY + 0.5 * rightY - rt32 * upY;
            rhomb30(gen, blX, blY, pX, pY);
            triangleR(gen, cX, cY, pX, pY, pX - upX, pY - upY);
            pX = brX - 0.5 * rightX + rt32 * upX;
            pY = brY - 0.5 * rightY + rt32 * upY;
            rhomb30(gen, trX, trY, pX, pY);
            triangleR(gen, cX, cY, pX, pY, pX + upX, pY + upY);
            pX = tlX + rt32 * rightX - 0.5 * upX;
            pY = tlY + rt32 * rightY - 0.5 * upY;
            rhomb30(gen, trX, trY, pX, pY);
            triangleL(gen, cX, cY, pX, pY, pX + rightX, pY + rightY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY, blX, blY);
                canvasContext.stroke();
            }
        }
    }
}

// the 60 degrees rhomb, coordinates of the corners with acute angles
// top is where the side of the rhomb lies on the boundary
function rhomb60(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.211324865=1/(3+sqrt(3));
    const upX = 0.211324865 * (tX - bX);
    const upY = 0.211324865 * (tY - bY);
    const rightX = upY;
    const rightY = -upX;
    const rX = cX + 1.366025404 * rightX;
    const rY = cY + 1.366025404 * rightY;
    const lX = cX - 1.366025404 * rightX;
    const lY = cY - 1.366025404 * rightY;
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
                if (tiling.marker) {
                    canvasContext.fillStyle = tiling.markerColor;
                    const s = tiling.markerSize;
                    output.makePath(bX, bY, bX - s * 0.5 * rightX + s * rt32 * upX, bY - s * 0.5 * rightY + s * rt32 * upY, bX + s * 0.5 * rightX + s * rt32 * upX, bY + s * 0.5 * rightY + s * rt32 * upY);
                    canvasContext.fill();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.rhomb60Color;
                        output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                        canvasContext.fill();
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        // 1.274519=(1+sqrt(3))*cos(15)-0.5*(1+sqrt(3))/cos(15)
                        const lowX = 0.3333 * (lX + bX + rX);
                        const lowY = 0.3333 * (lY + bY + rY);
                        const highX = 0.3333 * (lX + tX + rX);
                        const highY = 0.3333 * (lY + tY + rY);
                        output.makePath(0.5 * (lX + tX), 0.5 * (lY + tY), highX, highY, 0.5 * (rX + tX), 0.5 * (rY + tY));
                        canvasContext.stroke();
                        output.makePath(0.5 * (lX + bX), 0.5 * (lY + bY), lowX, lowY, 0.5 * (rX + bX), 0.5 * (rY + bY));
                        canvasContext.stroke();
                        output.makePath(lowX, lowY, highX, highY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            rhomb60(gen, tX, tY, lX + 0.5 * rightX + rt32 * upX, lY + 0.5 * rightY + rt32 * upY);
            rhomb60(gen, lX, lY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            const ntX = tX - upX;
            const ntY = tY - upY;
            rhomb30(gen, lX, lY, ntX, ntY);
            rhomb30(gen, rX, rY, ntX, ntY);
            const nlX = lX + rt32 * rightX - 0.5 * upX;
            const nlY = lY + rt32 * rightY - 0.5 * upY;
            rhomb30(gen, bX, bY, nlX, nlY);
            rhomb30(gen, ntX, ntY, nlX, nlY);
            triangleR(gen, lX, lY, nlX, nlY, nlX + upX, nlY + upY);
            const nrX = rX - rt32 * rightX - 0.5 * upX;
            const nrY = rY - rt32 * rightY - 0.5 * upY;
            rhomb30(gen, bX, bY, nrX, nrY);
            rhomb30(gen, ntX, ntY, nrX, nrY);
            triangleL(gen, rX, rY, nrX, nrY, nrX + upX, nrY + upY);
            triangleR(gen, nrX, nrY, nlX, nlY, bX + upX, bY + upY);
            triangleL(gen, nrX, nrY, nlX, nlY, ntX - upX, ntY - upY);
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

// the 30 degrees rhomb, coordinates of the corners with acute angles
function rhomb30(gen, bX, bY, tX, tY) {
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
                        canvasContext.fillStyle = tiling.rhomb30Color;
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
            rhomb30(gen, bX, bY, bcX, bcY);
            rhomb30(gen, tX, tY, tcX, tcY);
            //   0.3660254=1/(1+sqrt(3))
            //   0.6339745=sqrt(3)/(1+sqrt(3))
            square(gen, rX, rY, lX, lY);
            rhomb60(gen, lX, lY, 0.3660254 * lX + 0.6339745 * bX, 0.3660254 * lY + 0.6339745 * bY);
            rhomb60(gen, rX, rY, 0.3660254 * rX + 0.6339745 * tX, 0.3660254 * rY + 0.6339745 * tY);
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

// equilateral triangle
// a is corner with no rhomb60, b has one, c has two
// abc winds right or left as seen from center of triangle
function triangleR(gen, aX, aY, bX, bY, cX, cY) {
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        // make directions
        // 0.366025404 = 1 / (1 + rt3);
        const rightX = 0.366025404 * (bX - aX);
        const rightY = 0.366025404 * (bY - aY);
        const upX = -rightY;
        const upY = rightX;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bX, bY, cX, cY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
                if (tiling.marker) {
                    canvasContext.fillStyle = tiling.markerColor;
                    const s = tiling.markerSize;
                    output.makePath(aX, aY, aX + s * rightX, aY + s * rightY, aX + s * 0.5 * rightX + s * rt32 * upX, aY + s * 0.5 * rightY + s * rt32 * upY);
                    canvasContext.fill();
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
                        const zX = 0.3333 * (aX + bX + cX);
                        const zY = 0.3333 * (aY + bY + cY);
                        output.makePath(0.5 * (aX + bX), 0.5 * (aY + bY), zX, zY, 0.5 * (aX + cX), 0.5 * (aY + cY));
                        canvasContext.stroke();
                        output.makePath(0.5 * (cX + bX), 0.5 * (cY + bY), zX, zY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const nbX = bX - rt32 * rightX + 0.5 * upX;
            const nbY = bY - rt32 * rightY + 0.5 * upY;
            const ncX = cX - upX;
            const ncY = cY - upY;
            rhomb30(gen, bX, bY, ncX, ncY);
            rhomb30(gen, aX, aY, ncX, ncY);
            rhomb30(gen, aX, aY, nbX, nbY);
            rhomb60(gen, cX, cY, aX + 0.5 * rightX + rt32 * upX, aY + 0.5 * rightY + rt32 * upY);
            triangleL(gen, ncX, ncY, nbX, nbY, aX + rt32 * rightX + 0.5 * upX, aY + rt32 * rightY + 0.5 * upY);
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

// equilateral triangle
// a is corner with no rhomb60, b has one, c has two
// abc winds right or left as seen from center of triangle
// mirror image of triangleR, so 'right' actually points to the left
// has different triangle at center, different rhombs at border
// else everything the same
function triangleL(gen, aX, aY, bX, bY, cX, cY) {
    if (output.isInCanvas(aX, aY, bX, bY, cX, cY)) {
        // make directions
        // 0.366025404 = 1 / (1 + rt3);
        const rightX = 0.366025404 * (bX - aX);
        const rightY = 0.366025404 * (bY - aY);
        const upX = rightY;
        const upY = -rightX;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(aX, aY, bX, bY, cX, cY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
                if (tiling.marker) {
                    canvasContext.fillStyle = tiling.markerColor;
                    const s = tiling.markerSize;
                    output.makePath(aX, aY, aX + s * rightX, aY + s * rightY, aX + s * 0.5 * rightX + s * rt32 * upX, aY + s * 0.5 * rightY + s * rt32 * upY);
                    canvasContext.fill();
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
                        const zX = 0.3333 * (aX + bX + cX);
                        const zY = 0.3333 * (aY + bY + cY);
                        output.makePath(0.5 * (aX + bX), 0.5 * (aY + bY), zX, zY, 0.5 * (aX + cX), 0.5 * (aY + cY));
                        canvasContext.stroke();
                        output.makePath(0.5 * (cX + bX), 0.5 * (cY + bY), zX, zY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            const nbX = bX - rt32 * rightX + 0.5 * upX;
            const nbY = bY - rt32 * rightY + 0.5 * upY;
            const ncX = cX - upX;
            const ncY = cY - upY;
            rhomb30(gen, bX, bY, ncX, ncY);
            rhomb30(gen, aX, aY, ncX, ncY);
            rhomb30(gen, aX, aY, nbX, nbY);
            rhomb60(gen, cX, cY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            rhomb60(gen, bX, bY, aX + rightX, aY + rightY);
            triangleR(gen, ncX, ncY, nbX, nbY, aX + rt32 * rightX + 0.5 * upX, aY + rt32 * rightY + 0.5 * upY);
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
        case 'square':
            square(0, -s/2, -s/2, s/2, s/2);
            break;
        case 'rhomb30':
            rhomb30(0, -z, 0, z,0);
            break;
        case 'rhomb60':
            rhomb60(0, 0, -rt32*s, 0, rt32*s);
            break;
        case 'triangleR':
            triangleR(0, -rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'triangleL':
            triangleL(0, -rt32 * r, -r / 2, 0, r, rt32 * r, -r / 2);
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb30(0, 0, 0, secondX[i], secondY[i]);
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
    if (tiling.hyperBorder || tiling.border || tiling.marker) {
        tiling.drawBorders = true;
        tile();
    }
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();