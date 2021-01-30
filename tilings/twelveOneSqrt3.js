/* jshint esversion: 6 */


import {
    ParamGui,
    output,
    BooleanButton
}
from "./library/modules.js";
//from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

const help = gui.addFolder('help', {
    closed: false
});
help.addParagraph('You can <strong>zoom the image,</strong> with the mouse wheel if the mouse is on the image.');
help.addParagraph('You can <strong>move the image</strong> with a mouse drag.');
help.addParagraph('You can <strong>change numbers</strong> by choosing a digit with the mouse and turning the mouse wheel.');
help.addParagraph('Alternatively, you can use the <strong>"image controls"</strong> part of the gui.');
help.addParagraph('Click on the black triangles to open/close parts of the gui.');
help.addParagraph('Send bug reports and other comments to: <strong>pestampf@gmail.com</strong>');

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
output.setInitialCoordinates(0, 0, 210);

// parameters for drawing
const tiling = {};
// colors
tiling.rhombColor = '#ff0000';
tiling.squareColor = '#00ff00';
tiling.triangleAColor = '#999999';
tiling.triangleBColor = '#ffff00';
tiling.triangleCColor = '#0000ff';
tiling.markerColor = '#444444';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;
tiling.border = true;
tiling.subTriangle = false;
tiling.subSquare = false;
tiling.outlineColor = '#000000';
tiling.outlineWidth = 3;
tiling.outline = true;
tiling.marker = false;
tiling.markerSize = 0.5;
tiling.markerColor = '#444444';
tiling.decoration = 'solid color';
tiling.gridWidth = 3;
tiling.gridColor = '#ff8800';

// tiling
// triangle A has undetermined triangles
tiling.freeTriangleA = triangleB;
// triangle B has undetermined triangles
tiling.freeTriangleB = triangleB;
tiling.fixedSize = true;
tiling.maxGen = 1;
tiling.initial = 'small square';

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

const decorationController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'decoration',
    options: {
        'none': 'none',
        'solid color': 'solid color',
        'dual grid': 'grid'
    },
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
            triangleAColorController.show();
            triangleBColorController.show();
            triangleCColorController.show();
        } else {
            rhombColorController.hide();
            squareColorController.hide();
            triangleAColorController.hide();
            triangleBColorController.hide();
            triangleCColorController.hide();
        }
        draw();
    }
});
let decorationHelp = 'Choose what to draw inside the tiles.<br>';
decorationHelp += '<strong>None:</strong> Leave tile empty. For drawing only borders of tiles.<br>';
decorationHelp += '<strong>Solid color:</strong> Fills the tiles with color. For making mosaics.<br>';
decorationHelp += '<strong>Dual grid:</strong> Draws the dual of the tiling. For creating latticework.<br>';
decorationController.addHelp(decorationHelp);

const gridColorController = gui.add(colorController, {
    property: 'gridColor',
    labelText: 'color'
});
const gridWidthController = gui.add(widthController, {
    property: 'gridWidth',
    labelText: 'width'
});
gridWidthController.hide();
gridColorController.hide();
gridColorController.addHelp('You can set the color and the width of the dual grid.');

const rhombColorController = gui.add(colorController, {
    property: 'rhombColor',
    labelText: 'rhomb'
});
rhombColorController.addHelp('Here you can choose the colors for the different tiles. Use the same color for all triangles to recover equal sided triangles.');

const squareColorController = gui.add(colorController, {
    property: 'squareColor',
    labelText: 'square'
});

const triangleAColorController = gui.add(colorController, {
    property: 'triangleAColor',
    labelText: 'triangleA'
});

const triangleBColorController = gui.add(colorController, {
    property: 'triangleBColor',
    labelText: 'triangleB'
});

const triangleCColorController = gui.add(colorController, {
    property: 'triangleCColor',
    labelText: 'triangleC'
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
borderController.addHelp('Show or hide the borders of the rhombs, squares and equal sided triangles of the tiling. Choose the color and line width.');

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
subTriangleController.add({
    type: 'boolean',
    params: tiling,
    property: 'subSquare',
    onChange: function() {
        draw();
    }
});
subTriangleController.addHelp('Show or hide the subdivisions of the equalsided triangles and squares of the tiling as used in the substitution rule.');

const outlineController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'outline',
    onChange: function() {
        draw();
    }
});
outlineController.add(widthController, {
    property: 'outlineWidth',
    labelText: 'width'
});
outlineController.addHelp('Show or hide the border of the initial tiles. Adjust width and color.');

gui.add(colorController, {
    property: 'outlineColor',
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
markerController.addHelp('Show or hide markers indicating the correct orientation of substitution rules inside the quater squares.');

gui.add(colorController, {
    property: 'markerColor',
    labelText: 'color'
});

gui.addParagraph('<strong>tiling</strong>');

const initialController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'initial',
    options: {
        'small square': 'small square',
        'rhomb': 'rhomb',
        'triangle A': 'triangle A',
        'triangle B': 'triangle B',
        'triangle C': 'triangle C',
        'big square': 'big square',
        'equal sided triangle': 'equal sided triangle',
        'dodecagon': 'dodecagon'
    },
    onChange: function() {
        draw();
    }
});
initialController.addHelp('Choose the initial configuration of tiles. "big square" and "dodecagon" are preferred for getting large symmetric patches of the tiling.');

const maxGenController = gui.add({
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
maxGenController.addHelp('This is the number of repetitions of the substitution rules. Beware: The program takes as much time as there are visible tiles. If the tiles become too small for large numbers the program seems to freeze. Zoom in to get larger tiles and a reasonable response time.');

BooleanButton.whiteBackground();
const fixedSizeController = gui.add({
    type: 'boolean',
    params: tiling,
    labelText: 'tile size',
    buttonText: ['fixed', 'variable'],
    property: 'fixedSize',
    onChange: function() {
        draw();
    }
});
fixedSizeController.addHelp('Choose if the basic tiles have fixed size or the total image.');
gui.addParagraph('<strong>substitution at 60 degree corner of triangles</strong>');

const freeTriangleAController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'freeTriangleA',
    labelText: 'triangle A',
    options: {
        //  undefined: triangleX,
        'triangle A': triangleA,
        'triangle B': triangleB,
        'triangle C': triangleC
    },
    onChange: function() {
        draw();
    }
});

const freeTriangleBController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'freeTriangleB',
    labelText: 'triangle B',
    options: {
        //   undefined: triangleX,
        'triangle A': triangleA,
        'triangle B': triangleB,
        'triangle C': triangleC
    },
    onChange: function() {
        draw();
    }
});

// tiles of the tiling
//--------------------
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// actually the minimum square, center of full square at (blX,blY), (trX,trY) is opposite corner
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
    // 0.732050808 = 2 / (1 + rt3);
    const upX = 0.732050808 * (tlX - blX);
    const upY = 0.732050808 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.marker) {
                    canvasContext.fillStyle = tiling.markerColor;
                    const s = tiling.markerSize;
                    output.makePath(blX, blY, blX + s * rightX, blY + s * rightY, blX + s * upX, blY + s * upY);
                    canvasContext.fill();
                    output.makePath(trX, trY, trX - s * rightX, trY - s * rightY, trX - s * upX, trY - s * upY);
                    canvasContext.fill();
                }
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(brX, brY, trX, trY, tlX, tlY);
                    canvasContext.stroke();
                    if (tiling.subSquare) {
                        output.makePath(tlX, tlY, blX, blY, brX, brY);
                        canvasContext.stroke();
                    }
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.squareColor;
                        output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                        canvasContext.fill();
                        if (!tiling.subSquare) {
                            canvasContext.strokeStyle = tiling.squareColor;
                            output.setLineWidth(1);
                            output.makePath(tlX, tlY, blX, blY, brX, brY);
                            canvasContext.stroke();
                        }
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        output.makePath(blX, blY, tlX, tlY);
                        canvasContext.stroke();
                        output.makePath(blX, blY, brX, brY);
                        canvasContext.stroke();
                        break;
                }
            }
        } else {
            gen += 1;
            cX = brX + 0.5 * (upX - rightX);
            cY = brY + 0.5 * (upY - rightY);
            square(gen, brX, brY, cX, cY);
            triangleB(gen, brX + 0.5 * upX, brY + 0.5 * upY, cX, cY, trX, trY);
            triangleB(gen, brX - 0.5 * rightX, brY - 0.5 * rightY, cX, cY, blX, blY);
            cX = tlX - 0.5 * (upX - rightX);
            cY = tlY - 0.5 * (upY - rightY);
            square(gen, tlX, tlY, cX, cY);
            triangleB(gen, tlX + 0.5 * rightX, tlY + 0.5 * rightY, cX, cY, trX, trY);
            triangleB(gen, tlX - 0.5 * upX, tlY - 0.5 * upY, cX, cY, blX, blY);
            rhomb(gen, blX, blY, trX, trY);
        }
    }
}

// the rhomb, coordinates of the corners with acute angles
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
            square(gen, cX, cY, lX, lY);
            square(gen, cX, cY, rX, rY);
            square(gen, cX, cY, bcX, bcY);
            square(gen, cX, cY, tcX, tcY);
            // sqrt(0.5)-sqrt(3)/2*cos(75)=0.48296
            // sqrt(3)/2*sin(75)=0.83652
            let x = cX + 0.48296 * rightX + 0.83652 * upX;
            let y = cY + 0.48296 * rightY + 0.83652 * upY;
            // sqrt(0.5)-sqrt(3)*cos(75)=0.25881
            // sqrt(3)*sin(75)=1.67303
            triangleA(gen, x, y, tcX, tcY, rX, rY);
            triangleC(gen, x, y, tcX, tcY, cX + 0.25881 * rightX + 1.67303 * upX, cY + 0.25881 * rightY + 1.67303 * upY);
            x = cX - 0.48296 * rightX + 0.83652 * upX;
            y = cY - 0.48296 * rightY + 0.83652 * upY;
            triangleA(gen, x, y, tcX, tcY, lX, lY);
            triangleC(gen, x, y, tcX, tcY, cX - 0.25881 * rightX + 1.67303 * upX, cY - 0.25881 * rightY + 1.67303 * upY);
            x = cX + 0.48296 * rightX - 0.83652 * upX;
            y = cY + 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, rX, rY);
            triangleC(gen, x, y, bcX, bcY, cX + 0.25881 * rightX - 1.67303 * upX, cY + 0.25881 * rightY - 1.67303 * upY);
            x = cX - 0.48296 * rightX - 0.83652 * upX;
            y = cY - 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, lX, lY);
            triangleC(gen, x, y, bcX, bcY, cX - 0.25881 * rightX - 1.67303 * upX, cY - 0.25881 * rightY - 1.67303 * upY);
        }
    }
}

// halves of triangles, asymmetric!
// (mX,mY) is midpoint of base of full triangle. Has 90 degree angle corner
// (bX,bY) is other point at base. 60 degree angle corner
// (cX,cY) is top, 30 degree angle corner

// undetermined triangle, transparent
function triangleX(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    if (tiling.subTriangle) {
                        canvasContext.closePath();
                    }
                    canvasContext.stroke();
                }
            } else {}
        } else {
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            gen += 1;
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
            square(gen, mX, mY, cenX, cenY);
            const mcX = cX - upX;
            const mcY = cY - upY;
            triangleX(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            // unknown triangle
            triangleX(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            //   triangleA(gen, bX - 0.433012 * rightX + 0.75 * upX, bY - 0.433012 * rightY + 0.75 * upY, cenX, cenY, bX, bY);
        }
    }
}

function triangleA(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        // make directions
        // attention: mirror images
        // 0.732050808 = 2 / (1 + rt3);
        const rightX = 0.732050808 * (bX - mX);
        const rightY = 0.732050808 * (bY - mY);
        // 0.422649=2/(3+sqrt(3))
        const upX = 0.422649 * (cX - mX);
        const upY = 0.422649 * (cY - mY);
        const cenX = mX + 0.5 * (upX + rightX);
        const cenY = mY + 0.5 * (upY + rightY);
        const bcX = 0.5 * (bX + cX);
        const bcY = 0.5 * (bY + cY);
        const mcX = cX - upX;
        const mcY = cY - upY;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    if (tiling.subTriangle) {
                        canvasContext.closePath();
                    }
                    canvasContext.stroke();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.triangleAColor;
                        output.makePath(mX, mY, bX, bY, cX, cY);
                        canvasContext.fill();
                        if (!tiling.subTriangle) {
                            canvasContext.strokeStyle = tiling.triangleAColor;
                            output.setLineWidth(1);
                            output.makePath(mX, mY, cX, cY);
                            canvasContext.closePath();
                            canvasContext.stroke();
                        }
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        output.makePath(mX, mY, 0.3333 * (mX + mX + cX), 0.3333 * (mY + mY + cY), 0.5 * (cX + bX), 0.5 * (cY + bY));
                        canvasContext.stroke();
                        break;
                    case 'scheme':
                        canvasContext.fillStyle = tiling.markerColor;
                        output.makePath(bX, bY, mX + 0.5 * (rightX + upX), mY + 0.5 * (rightY + upY), bX - 0.433012 * rightX + 0.75 * upX, bY - 0.433012 * rightY + 0.75 * upY);
                        canvasContext.fill();
                        output.makePath(cX + 0.433012 * rightX - 0.75 * upX, cY + 0.433012 * rightY - 0.75 * upY, mcX, mcY, cX, cY);
                        canvasContext.fill();
                        break;
                }
            }
        } else {
            gen += 1;
            square(gen, mX, mY, cenX, cenY);
            triangleA(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            square(gen, bcX, bcY, cenX, cenY);
            square(gen, bcX, bcY, mcX, mcY);
            // 0.433012=sqrt(3)/4
            triangleB(gen, cX + 0.433012 * rightX - 0.75 * upX, cY + 0.433012 * rightY - 0.75 * upY, mcX, mcY, cX, cY);
            // free triangles
            tiling.freeTriangleA(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            tiling.freeTriangleA(gen, bX - 0.433012 * rightX + 0.75 * upX, bY - 0.433012 * rightY + 0.75 * upY, cenX, cenY, bX, bY);
        }
    }
}

function triangleB(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        // make directions
        // attention: mirror images
        // 0.732050808 = 2 / (1 + rt3);
        const rightX = 0.732050808 * (bX - mX);
        const rightY = 0.732050808 * (bY - mY);
        // 0.422649=2/(3+sqrt(3))
        const upX = 0.422649 * (cX - mX);
        const upY = 0.422649 * (cY - mY);
        const cenX = mX + 0.5 * (upX + rightX);
        const cenY = mY + 0.5 * (upY + rightY);
        const mcX = cX - upX;
        const mcY = cY - upY;
        const bcX = bX - 0.433012 * rightX + 0.75 * upX;
        const bcY = bY - 0.433012 * rightY + 0.75 * upY;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    if (tiling.subTriangle) {
                        canvasContext.closePath();
                    }
                    canvasContext.stroke();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.triangleBColor;
                        output.makePath(mX, mY, bX, bY, cX, cY);
                        canvasContext.fill();
                        if (!tiling.subTriangle) {
                            canvasContext.strokeStyle = tiling.triangleBColor;
                            output.setLineWidth(1);
                            output.makePath(mX, mY, cX, cY);
                            canvasContext.closePath();
                            canvasContext.stroke();
                        }
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        output.makePath(mX, mY, 0.3333 * (mX + mX + cX), 0.3333 * (mY + mY + cY), 0.5 * (cX + bX), 0.5 * (cY + bY));
                        canvasContext.stroke();
                        break;
                    case 'scheme':
                        canvasContext.fillStyle = tiling.markerColor;
                        output.makePath(bX, bY, mX + 0.5 * (rightX + upX), mY + 0.5 * (rightY + upY), mX + 0.5 * rightX + 1.5 * upX, mY + 0.5 * rightY + 1.5 * upY);
                        canvasContext.fill();
                        break;
                }
            }
        } else {
            gen += 1;
            square(gen, mX, mY, cenX, cenY);
            rhomb(gen, cX, cY, cenX, cenY);
            triangleC(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            triangleC(gen, bcX, bcY, cenX, cenY, cenX + upX, cenY + upY);
            // free triangles
            tiling.freeTriangleB(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            tiling.freeTriangleB(gen, bcX, bcY, cenX, cenY, bX, bY);
        }
    }
}

function triangleC(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        // make directions
        // attention: mirror images
        // 0.732050808 = 2 / (1 + rt3);
        const rightX = 0.732050808 * (bX - mX);
        const rightY = 0.732050808 * (bY - mY);
        // 0.422649=2/(3+sqrt(3))
        const upX = 0.422649 * (cX - mX);
        const upY = 0.422649 * (cY - mY);
        const cenX = mX + 0.5 * (upX + rightX);
        const cenY = mY + 0.5 * (upY + rightY);
        const mcX = cX - upX;
        const mcY = cY - upY;
        // 0.433012=sqrt(3)/4
        const bcX = cX + 0.433012 * rightX - 0.75 * upX;
        const bcY = cY + 0.433012 * rightY - 0.75 * upY;
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    if (tiling.subTriangle) {
                        canvasContext.closePath();
                    }
                    canvasContext.stroke();
                }
            } else {
                switch (tiling.decoration) {
                    case 'solid color':
                        canvasContext.fillStyle = tiling.triangleCColor;
                        output.makePath(mX, mY, bX, bY, cX, cY);
                        canvasContext.fill();
                        if (!tiling.subTriangle) {
                            canvasContext.strokeStyle = tiling.triangleCColor;
                            output.setLineWidth(1);
                            output.makePath(mX, mY, cX, cY);
                            canvasContext.closePath();
                            canvasContext.stroke();
                        }
                        break;
                    case 'grid':
                        canvasContext.strokeStyle = tiling.gridColor;
                        output.setLineWidth(tiling.gridWidth);
                        output.makePath(mX, mY, 0.3333 * (mX + mX + cX), 0.3333 * (mY + mY + cY), 0.5 * (cX + bX), 0.5 * (cY + bY));
                        canvasContext.stroke();
                        break;
                    case 'scheme':
                        canvasContext.fillStyle = tiling.markerColor;
                        output.makePath(cX + rt32 * rightX - 1.5 * upX, cY + rt32 * rightY - 1.5 * upY, mcX, mcY, cX, cY);
                        canvasContext.fill();
                        break;
                }
            }
        } else {
            gen += 1;
            square(gen, mX, mY, cenX, cenY);
            rhomb(gen, bX, bY, mcX, mcY);
            triangleB(gen, bcX, bcY, mcX, mcY, cX, cY);
            triangleC(gen, bcX, bcY, mcX, mcY, cX + rt32 * rightX - 1.5 * upX, cY + rt32 * rightY - 1.5 * upY);
            triangleB(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            triangleB(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
        }
    }
}
// the dodecagon initial pattern


const basicX = [];
basicX.length = 15;

const basicY = [];
basicY.length = 15;

const secondX = [];
const secondY = [];
secondX.length = 14;
secondY.length = 14;


function tile() {
    let s = 200;
    if (tiling.fixedSize) {
        s *= Math.pow(1 + Math.sqrt(3), tiling.maxGen - 2);
    }

    const size = s / 4;

    for (let i = 0; i < 15; i++) {
        basicX[i] = Math.cos(Math.PI * i / 6) * size;
        basicY[i] = Math.sin(Math.PI * i / 6) * size;
    }

    for (let i = 0; i < 14; i++) {
        secondX[i] = basicX[i] + basicX[i + 1];
        secondY[i] = basicY[i] + basicY[i + 1];
    }
    const r = s / Math.sqrt(3);
    const z = s * Math.cos(Math.PI / 12);
    const w = s * Math.sin(Math.PI / 12);
    switch (tiling.initial) {
        case 'small square':
            square(0, -s / 4, -s / 4, s / 4, s / 4);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(-s / 4, -s / 4, -s / 4, s / 4, s / 4, s / 4, s / 4, -s / 4);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'rhomb':
            rhomb(0, -z, 0, z, 0);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(z, 0, 0, w, -z, 0, 0, -w);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'triangle A':
            triangleA(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(0, -r / 2, rt32 * r, -r / 2, 0, r);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'equal sided triangle':
            triangleA(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            triangleA(0, 0, -r / 2, -rt32 * r, -r / 2, 0, r);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(-rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'triangle B':
            triangleB(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(0, -r / 2, rt32 * r, -r / 2, 0, r);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'triangle C':
            triangleC(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(0, -r / 2, rt32 * r, -r / 2, 0, r);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'big square':
            square(0, 0, 0, s / 2, s / 2);
            square(0, 0, 0, s / 2, -s / 2);
            square(0, 0, 0, -s / 2, s / 2);
            square(0, 0, 0, -s / 2, -s / 2);
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2, s / 2, -s / 2);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb(0, 0, 0, secondX[i], secondY[i]);
                const mX = 0.5 * (secondX[i] + secondX[i + 1]);
                const mY = 0.5 * (secondY[i] + secondY[i + 1]);
                triangleC(0, mX, mY, secondX[i], secondY[i], basicX[i + 1], basicY[i + 1]);
                triangleC(0, mX, mY, secondX[i + 1], secondY[i + 1], basicX[i + 1], basicY[i + 1]);
            }
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                canvasContext.beginPath();
                canvasContext.moveTo(secondX[0], secondY[0]);
                for (let i = 1; i < 12; i++) {
                    canvasContext.lineTo(secondX[i], secondY[i]);
                }
                canvasContext.closePath();
                canvasContext.stroke();
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
    if (tiling.border) {
        tiling.drawBorders = true;
        tile();
    }
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();