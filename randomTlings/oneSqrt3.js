/* jshint esversion: 6 */

import {
    ParamGui,
    output
}
from "../libgui/modules.js";



// overprinting to avoid gaps
// center for overprinting
let overCenterX = 0;
let overCenterY = 0;
// overprinting factor is truchet.overprint



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

truchet.maxGen = 1;

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
const rt3 = Math.sqrt(3);

function line(x1, y1, x2, y2) {
    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.stroke();
}

// actually the minimum square, center of full square at (blX,blY), (trX,trY) is opposite corner
function square(gen, blX, blY, trX, trY) {
    // make center and missing corners
    const cX = 0.5 * (blX + trX);
    const cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dY;
    output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
    output.canvasContext.stroke();
    if (gen >= truchet.maxGen) {
        canvasContext.fillStyle = truchet.square;

    } else {

        // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
        const f = 2 / (1 + rt3);
        const upX = f * (tlX - blX);
    }
}

// the rhomb, coordinates of the corners with acute angles
function rhomb(gen, bX, bY, tX, tY) {

}

// halves of triangles, asymmetric!
// (mX,mY) is midpoint of base of full triaangle. Has 90 degree angle corner
// (bX,bY) is other point at base. 60 degree angle corner
// (cX,cY) is top, 30 degree angle corner
function triangleA(gen, mX, mY, bX, bY, cX, cY) {

}

function draw() {
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.correctYAxis();

    square(1, 0, 0, 100, 100);
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ccccff');

draw();