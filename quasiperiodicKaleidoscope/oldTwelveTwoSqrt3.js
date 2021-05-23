/* jshint esversion: 6 */


import {
    ParamGui,
    output,
    BooleanButton
}
//from "./library/modules.js";
from "../libgui/modules.js";
import {
    tiles
}
from "./oldTiles.js";

const gui = new ParamGui({
    closed: false
});

const help = gui.addFolder('help', {
    closed: true
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
const canvasContext = output.canvasContext;

output.addCoordinateTransform();

const size = 5;

output.setInitialCoordinates(0, 0, 4 * size);

// parameters for drawing
const tiling = {};
// colors
tiling.rhombColor = '#ff0000';
tiling.squareColor = '#00ff00';
tiling.triangleColor = '#0000ff';
tiling.markerColor = '#444444';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;
tiling.border = true;
tiling.subTriangle = false;
tiling.outlineColor = '#000000';
tiling.outlineWidth = 3;
tiling.outline = true;
tiling.decoration = 'solid color';
tiling.gridWidth = 3;
tiling.gridColor = '#ff8800';
// geometry
tiling.fixedSize = true;
tiling.maxGen = 1;
tiling.initial = 'small square';

// the different substitution rules
var square, rhomb, triangle;
const squares = [];
const rhombs = [];
const triangles = [];

// choices
tiling.rhomb = 1;
tiling.triangle = 1;
tiling.square = 1;

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
            triangleColorController.show();
        } else {
            rhombColorController.hide();
            squareColorController.hide();
            triangleColorController.hide();
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

const squareColorController = gui.add(colorController, {
    property: 'squareColor',
    labelText: 'square'
});

const triangleColorController = gui.add(colorController, {
    property: 'triangleColor',
    labelText: 'triangle'
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

gui.addParagraph('<strong>choice for substitution rules</strong>');

const rhombController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'rhomb',
    options: [1, 2],
    onChange: function() {
        rhomb = rhombs[tiling.rhomb];
        draw();
    }
});

const triangleController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'triangle',
    options: [1, 2],
    onChange: function() {
        triangle = triangles[tiling.triangle];
        draw();
    }
});

const squareController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'square',
    options: [1, 2, 3, 4, 5],
    onChange: function() {
        square = squares[tiling.square];
        draw();
    }
});

gui.addParagraph('<strong>tiling</strong>');

const initialController = gui.add({
    type: 'selection',
    params: tiling,
    property: 'initial',
    options: {
        'rhomb': 'rhomb',
        'triangle': 'triangle',
        'small square': 'small square',
        'square': 'big square',
        'equilateral triangle': 'full triangle',
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

// tiles of the tiling
//--------------------
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// actually the quarter square, center of full square at (trX,trY) 
//  corner at (blX,blY) 

squares[1] = function(gen, blX, blY, trX, trY) {
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
    // 0.535898385 = 2 / (2 + rt3);
    const upX = 0.535898385 * (tlX - blX);
    const upY = 0.535898385 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.addQuarterSquare(trX, trY, blX, blY);
        } else {
            gen += 1;
            rhomb(gen, blX, blY, brX + 0.5 * upX, brY + 0.5 * upY);
            rhomb(gen, blX, blY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            rhomb(gen, blX, blY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY));
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, brX - rightX + 0.5 * upX, brY - rightY + 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            fullTriangle(gen, tlX + 0.5 * rightX - upX, tlY + 0.5 * rightY - upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
        }
    }
};

// actually the quarter square, center of full square at (trX,trY) 
//  corner at (blX,blY) 
// the maximal non mirrorsymmetric

squares[2] = function(gen, blX, blY, trX, trY) {
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
    // 0.535898385 = 2 / (2 + rt3);
    const upX = 0.535898385 * (tlX - blX);
    const upY = 0.535898385 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.addQuarterSquare(trX, trY, blX, blY);
        } else {
            gen += 1;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = tlX + 0.5 * rightX;
            const cY = tlY + 0.5 * rightY;
            rhomb(gen, cX, cY, blX, blY);
            rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
        }
    }
};


// actually the quarter square, center of full square at (trX,trY) 
//  corner at (blX,blY) 
// the maximal non mirrorsymmetric

squares[3] = function(gen, blX, blY, trX, trY) {
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
    // 0.535898385 = 2 / (2 + rt3);
    const upX = 0.535898385 * (tlX - blX);
    const upY = 0.535898385 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.addQuarterSquare(trX, trY, blX, blY);
        } else {
            gen += 1;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = tlX + 0.5 * rightX;
            const cY = tlY + 0.5 * rightY;
            //   rhomb(gen, cX, cY, blX, blY);
            //   rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            //   fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX + upX, blY + upY, blX + upX + rightX, blY + upY + rightY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            fullSquare(gen, blX, blY, blX + upX + rightX, blY + upY + rightY);
        }
    }
};

squares[4] = function(gen, blX, blY, trX, trY) {
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
    // 0.535898385 = 2 / (2 + rt3);
    const upX = 0.535898385 * (tlX - blX);
    const upY = 0.535898385 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.addQuarterSquare(trX, trY, blX, blY);
        } else {
            gen += 1;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = brX - rightX + 0.5 * upX;
            const cY = brY - rightY + 0.5 * upY;
            //   rhomb(gen, cX, cY, blX, blY);
            //   rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            //  rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            //   fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            //  fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
            rhomb(gen, blX, blY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX, blY, cX, cY, blX + upX, blY + upY);
            fullSquare(gen, cX, cY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            fullTriangle(gen, cX, cY, cX + rightX, cY + rightY, trX - 0.5 * upX - 0.5 * rightX, trY - 0.5 * upY - 0.5 * rightY);
        }
    }
};

squares[5] = function(gen, blX, blY, trX, trY) {
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
    // 0.535898385 = 2 / (2 + rt3);
    const upX = 0.535898385 * (tlX - blX);
    const upY = 0.535898385 * (tlY - blY);
    const rightX = upY;
    const rightY = -upX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.addQuarterSquare(trX, trY, blX, blY);
        } else {
            gen += 1;
            square(gen, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), trX, trY);
            triangle(gen, tlX, tlY, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX + upX, blY + upY);
            triangle(gen, brX, brY, brX + 0.5 * upX, brY + 0.5 * upY, blX + rightX, blY + rightY);
            //    triangle(gen, trX - 0.5 * upX, trY - 0.5 * upY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), brX + 0.5 * upX, brY + 0.5 * upY);
            //   triangle(gen, trX - 0.5 * rightX, trY - 0.5 * rightY, trX - 0.5 * (rightX + upX), trY - 0.5 * (rightY + upY), tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            const cX = tlX + 0.5 * rightX - upX;
            const cY = tlY + 0.5 * rightY - upY;
            rhomb(gen, tlX + 0.5 * rightX, tlY + 0.5 * rightY, blX, blY);
            //  rhomb(gen, cX, cY, blX + rightX, blY + rightY);
            //  rhomb(gen, cX, cY, brX + 0.5 * upX, brY + 0.5 * upY);
            //  fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX - upX, cY - upY);
            // fullTriangle(gen, blX + rightX, blY + rightY, blX + rightX + upX, blY + rightY + upY, brX + 0.5 * upX, brY + 0.5 * upY);
            fullTriangle(gen, blX, blY, blX + rightX, blY + rightY, cX, cY);
            fullTriangle(gen, blX + rightX, blY + rightY, cX + rightX, cY + rightY, cX, cY);
            fullTriangle(gen, cX, cY, trX - 0.5 * rightX - 0.5 * upX, trY - 0.5 * rightY - 0.5 * upY, tlX + 0.5 * rightX, tlY + 0.5 * rightY);
            rhomb(gen, cX, cY, trX + 0.5 * rightX - 0.5 * upX, trY + 0.5 * rightY - 0.5 * upY);
            rhomb(gen, blX + rightX, blY + rightY, trX + 0.5 * rightX - 0.5 * upX, trY + 0.5 * rightY - 0.5 * upY);
        }
    }
};


square = squares[1];


function fullSquare(gen, blX, blY, trX, trY) {
    // make center and missing corners
    let cX = 0.5 * (blX + trX);
    let cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dX;
    square(gen, blX, blY, cX, cY);
    square(gen, brX, brY, cX, cY);
    square(gen, tlX, tlY, cX, cY);
    square(gen, trX, trY, cX, cY);
}

// the rhomb, coordinates of the corners with acute angles

rhombs[1] = function(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.378937382=tan(Math.PI/12)*sqrt(2);
    let upX = 0.378937382 * (cX - bX);
    let upY = 0.378937382 * (cY - bY);
    let rightX = upY;
    let rightY = -upX;
    const rX = cX + 0.7071 * rightX;
    const rY = cY + 0.7071 * rightY;
    const lX = cX - 0.7071 * rightX;
    const lY = cY - 0.7071 * rightY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            tiles.addRhomb30(bX, bY, tX, tY);
        } else {
            gen += 1;
            // 0.267949192=1/(2+rt3)
            rightX = 0.267949192 * (rX - bX);
            rightY = 0.267949192 * (rY - bY);
            upX = -rightY;
            upY = rightX;
            rhomb(gen, lX, lY, rX, rY);
            const bbcX = bX + rightX * (1 + rt32) + 0.5 * upX;
            const bbcY = bY + rightY * (1 + rt32) + 0.5 * upY;
            const ttcX = tX - rightX * (1 + rt32) - 0.5 * upX;
            const ttcY = tY - rightY * (1 + rt32) - 0.5 * upY;
            rhomb(gen, bX, bY, bbcX, bbcY);
            rhomb(gen, tX, tY, ttcX, ttcY);
            const bcX = rX - 0.5 * rightX + rt32 * upX;
            const bcY = rY - 0.5 * rightY + rt32 * upY;
            const tcX = lX + 0.5 * rightX - rt32 * upX;
            const tcY = lY + 0.5 * rightY - rt32 * upY;
            fullSquare(gen, bbcX, bbcY, bcX, bcY);
            fullSquare(gen, ttcX, ttcY, tcX, tcY);
            let midX = 0.5 * (bX + rX);
            let midY = 0.5 * (bY + rY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rightX, bY + rightY);
            triangle(gen, midX, midY, bbcX, bbcY, rX - rightX, rY - rightY);
            fullTriangle(gen, rX, rY, rX - rightX, rY - rightY, bcX, bcY);
            midX = 0.5 * (lX + tX);
            midY = 0.5 * (lY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rightX, tY - rightY);
            triangle(gen, midX, midY, ttcX, ttcY, lX + rightX, lY + rightY);
            fullTriangle(gen, lX, lY, lX + rightX, lY + rightY, tcX, tcY);
            midX = 0.5 * (lX + bX);
            midY = 0.5 * (lY + bY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rt32 * rightX + 0.5 * upX, bY + rt32 * rightY + 0.5 * upY);
            triangle(gen, midX, midY, bbcX, bbcY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY);
            fullTriangle(gen, lX, lY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY, bcX, bcY);
            midX = 0.5 * (rX + tX);
            midY = 0.5 * (rY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rt32 * rightX - 0.5 * upX, tY - rt32 * rightY - 0.5 * upY);
            triangle(gen, midX, midY, ttcX, ttcY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            fullTriangle(gen, rX, rY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY, tcX, tcY);
        }
    }
};


// the rhomb, coordinates of the corners with acute angles
// no square, asymmetric
rhombs[2] = function(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.378937382=tan(Math.PI/12)*sqrt(2);
    let upX = 0.378937382 * (cX - bX);
    let upY = 0.378937382 * (cY - bY);
    let rightX = upY;
    let rightY = -upX;
    let rX = cX + 0.7071 * rightX;
    let rY = cY + 0.7071 * rightY;
    let lX = cX - 0.7071 * rightX;
    let lY = cY - 0.7071 * rightY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            tiles.addRhomb30(bX, bY, tX, tY);
        } else {
            if (tiling.fullRosettes) {
                let angle = Math.floor(Math.atan2(tY - bY, tX - bX) / Math.PI * 6);
                if (angle & 1) {
                    console.log('flip');
                    let h = lX;
                    lX = rX;
                    rX = h;
                    h = lY;
                    lY = rY;
                    rY = h;
                    h = bX;
                    bX = tX;
                    tX = h;
                    h = bY;
                    bY = tY;
                    tY = h;
                    upX = -upX;
                    upY = -upY;
                    rightX = -rightX;
                    rightY = -rightY;
                }
            }
            gen += 1;
            // 0.267949192=1/(2+rt3)
            rightX = 0.267949192 * (rX - bX);
            rightY = 0.267949192 * (rY - bY);
            upX = -rightY;
            upY = rightX;
            rhomb(gen, rX, rY, lX, lY);
            const bbcX = bX + rightX * (1 + rt32) + 0.5 * upX;
            const bbcY = bY + rightY * (1 + rt32) + 0.5 * upY;
            const ttcX = tX - rightX * (1 + rt32) - 0.5 * upX;
            const ttcY = tY - rightY * (1 + rt32) - 0.5 * upY;
            rhomb(gen, bX, bY, bbcX, bbcY);
            rhomb(gen, tX, tY, ttcX, ttcY);
            const bcX = rX - 0.5 * rightX + rt32 * upX;
            const bcY = rY - 0.5 * rightY + rt32 * upY;
            const tcX = lX + 0.5 * rightX - rt32 * upX;
            const tcY = lY + 0.5 * rightY - rt32 * upY;
            let midX = 0.5 * (bX + rX);
            let midY = 0.5 * (bY + rY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rightX, bY + rightY);
            triangle(gen, midX, midY, bbcX, bbcY, rX - rightX, rY - rightY);
            midX = 0.5 * (lX + tX);
            midY = 0.5 * (lY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rightX, tY - rightY);
            triangle(gen, midX, midY, ttcX, ttcY, lX + rightX, lY + rightY);
            fullTriangle(gen, rX, rY, tcX, tcY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            midX = 0.5 * (lX + bX);
            midY = 0.5 * (lY + bY);
            triangle(gen, midX, midY, bbcX, bbcY, bX + rt32 * rightX + 0.5 * upX, bY + rt32 * rightY + 0.5 * upY);
            triangle(gen, midX, midY, bbcX, bbcY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY);
            fullTriangle(gen, lX, lY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY, bcX, bcY);
            midX = 0.5 * (rX + tX);
            midY = 0.5 * (rY + tY);
            triangle(gen, midX, midY, ttcX, ttcY, tX - rt32 * rightX - 0.5 * upX, tY - rt32 * rightY - 0.5 * upY);
            triangle(gen, midX, midY, ttcX, ttcY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            rhomb(gen, rX, rY, bbcX, bbcY);
            rhomb(gen, lX, lY, ttcX, ttcY);
            rhomb(gen, lX, lY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
            rhomb(gen, rX, rY, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY);
            fullTriangle(gen, lX - rt32 * rightX - 0.5 * upX, lY - rt32 * rightY - 0.5 * upY, bbcX, bbcY, bbcX + rightX, bbcY + rightY);
            fullTriangle(gen, ttcX, ttcY, ttcX - rightX, ttcY - rightY, rX + rt32 * rightX + 0.5 * upX, rY + rt32 * rightY + 0.5 * upY);
        }
    }
};

rhomb = rhombs[1];

// halves of triangles, asymmetric!
// (mX,mY) is midpoint of base of full triangle. Has 90 degree angle corner
// (bX,bY) is other point at base. 60 degree angle corner
// (cX,cY) is top, 30 degree angle corner

triangles[1] = function(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        // make directions
        // attention: mirror images
        // 0.535898385 = 2 / (2 + rt3);
        const rightX = 0.535898385 * (bX - mX);
        const rightY = 0.535898385 * (bY - mY);
        // 0.309401077=1/(1.5+sqrt(3))
        const upX = 0.309401077 * (cX - mX);
        const upY = 0.309401077 * (cY - mY);
     //   const cenX = mX + 0.5 * (upX + rightX);
     //   const cenY = mY + 0.5 * (upY + rightY);
     //   const bcX = 0.5 * (bX + cX);
     //   const bcY = 0.5 * (bY + cY);
      //  const mcX = cX - upX;
      //  const mcY = cY - upY;
        if (gen >= tiling.maxGen) {
            tiles.addHalfTriangle(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            rhomb(gen, bX, bY, mX + 0.5 * upX, mY + 0.5 * upY);
            const cenX = mX + 0.5 * rightX + (0.5 + rt32) * upX;
            const cenY = mY + 0.5 * rightY + (0.5 + rt32) * upY;
            rhomb(gen, bX, bY, cenX, cenY);
            rhomb(gen, cX, cY, cenX, cenY);
            fullTriangle(gen, cenX, cenY, mX + rightX + 0.5 * upX, mY + rightY + 0.5 * upY, mX + 0.5 * upX, mY + 0.5 * upY);
            triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, mX + 0.5 * upX, mY + 0.5 * upY);
            triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, cX - upX, cY - upY);
            triangle(gen, mX, mY, mX + 0.5 * upX, mY + 0.5 * upY, mX + rt32 * rightX, mY + rt32 * rightY);
            const midX = 0.5 * (cX + bX);
            const midY = 0.5 * (cY + bY);
            triangle(gen, midX, midY, cenX, cenY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, midX, midY, cenX, cenY, cX + 0.5 * rightX - rt32 * upX, cY + 0.5 * rightY - rt32 * upY);
        }
    }
};

triangles[2] = function(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        // make directions
        // attention: mirror images
        // 0.535898385 = 2 / (2 + rt3);
        const rightX = 0.535898385 * (bX - mX);
        const rightY = 0.535898385 * (bY - mY);
        // 0.309401077=1/(1.5+sqrt(3))
        const upX = 0.309401077 * (cX - mX);
        const upY = 0.309401077 * (cY - mY);
        const cenX = mX + 0.5 * (upX + rightX);
        const cenY = mY + 0.5 * (upY + rightY);
        const bcX = 0.5 * (bX + cX);
        const bcY = 0.5 * (bY + cY);
        const mcX = cX - upX;
        const mcY = cY - upY;
        if (gen >= tiling.maxGen) {
            tiles.addHalfTriangle(mX, mY, bX, bY, cX, cY);
        } else {
            gen += 1;
            //    rhomb(gen, bX, bY, mX + 0.5 * upX, mY + 0.5 * upY);
            const cenX = mX + 0.5 * rightX + (0.5 + rt32) * upX;
            const cenY = mY + 0.5 * rightY + (0.5 + rt32) * upY;
            //    rhomb(gen, bX, bY, cenX, cenY);
            //    rhomb(gen, cX, cY, cenX, cenY);
            //    fullTriangle(gen, cenX, cenY, mX + rightX + 0.5 * upX, mY + rightY + 0.5 * upY, mX + 0.5 * upX, mY + 0.5 * upY);
            triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, mX + 0.5 * upX, mY + 0.5 * upY);
            //   triangle(gen, cenX - 0.5 * rightX, cenY - 0.5 * rightY, cenX, cenY, cX - upX, cY - upY);
            triangle(gen, mX, mY, mX + 0.5 * upX, mY + 0.5 * upY, mX + rt32 * rightX, mY + rt32 * rightY);
            const midX = 0.5 * (cX + bX);
            const midY = 0.5 * (cY + bY);
            fullTriangle(gen, bX - rightX, bY - rightY, bX, bY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, midX, midY, cenX, cenY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, midX, midY, cenX, cenY, cX + 0.5 * rightX - rt32 * upX, cY + 0.5 * rightY - rt32 * upY);
            fullSquare(gen, mX + 0.5 * upX, mY + 0.5 * upY, bX - 0.5 * rightX + rt32 * upX, bY - 0.5 * rightY + rt32 * upY);
            triangle(gen, cX - rt32 * upX, cY - rt32 * upY, cX - rt32 * upX + 0.5 * rightX, cY - rt32 * upY + 0.5 * rightY, cX, cY);
            square(gen, cenX, cenY, cX - rt32 * upX - 0.5 * upX, cY - rt32 * upY - 0.5 * upY);
            square(gen, cX - rt32 * upX + 0.5 * rightX, cY - rt32 * upY + 0.5 * rightY, cX - rt32 * upX - 0.5 * upX, cY - rt32 * upY - 0.5 * upY);
        }
    }
};
triangle = triangles[1];

function fullTriangle(gen, aX, aY, bX, bY, cX, cY) {
    const mX = 0.5 * (aX + bX);
    const mY = 0.5 * (aY + bY);
    triangle(gen, mX, mY, aX, aY, cX, cY);
    triangle(gen, mX, mY, bX, bY, cX, cY);
}

function drawing() {
    switch (tiling.decoration) {
        case 'solid color':
            canvasContext.fillStyle = tiling.triangleColor;
            tiles.fillHalfTriangles();
            canvasContext.fillStyle = tiling.rhombColor;
            tiles.fillRhombs30();
            canvasContext.fillStyle = tiling.squareColor;
            tiles.fillQuarterSquares();
            break;
        case 'grid':
            canvasContext.strokeStyle = tiling.gridColor;
            output.setLineWidth(tiling.gridWidth);
            tiles.grid();
            break;
    }
    if (tiling.border) {
        canvasContext.strokeStyle = tiling.borderColor;
        output.setLineWidth(tiling.borderWidth);
        tiles.border();
        if (tiling.subTriangle) {
            tiles.subBorderHalfTriangles();
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
    let s = 4 * size;
    if (tiling.fixedSize) {
        s *= Math.pow(2 + Math.sqrt(3), tiling.maxGen - 2);
    }
    for (let i = 0; i < 15; i++) {
        basicX[i] = Math.cos(Math.PI * i / 6) * s;
        basicY[i] = Math.sin(Math.PI * i / 6) * s;
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
            drawing();
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
            drawing();
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(z, 0, 0, w, -z, 0, 0, -w);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'triangle':
            triangle(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            drawing();
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(0, -r / 2, rt32 * r, -r / 2, 0, r);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'full triangle':
            fullTriangle(0, -rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            drawing();
            if (tiling.outline) {
                canvasContext.strokeStyle = tiling.outlineColor;
                output.setLineWidth(tiling.outlineWidth);
                output.makePath(-rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
                canvasContext.closePath();
                canvasContext.stroke();
            }
            break;
        case 'big square':
            fullSquare(0, -s / 2, -s / 2, s / 2, s / 2);
            drawing();
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
                triangle(0, mX, mY, secondX[i], secondY[i], basicX[i + 1], basicY[i + 1]);
                triangle(0, mX, mY, secondX[i + 1], secondY[i + 1], basicX[i + 1], basicY[i + 1]);
            }
            drawing();
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
    tiles.delete();
    tile();

}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();