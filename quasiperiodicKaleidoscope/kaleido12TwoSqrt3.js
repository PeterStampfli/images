/* jshint esversion: 6 */

/*
the html page calls this module
it sets up everthing, injecting code into the main object
and calls main.setup
*/

// tiling see rhombsSquare.js

import {
    map,
    output,
    BooleanButton
} from "../libgui/modules.js";

import {
    main,
    Lines,
    Areas,
    tiles
}
from "./modules.js";


const tiling = {};
tiling.maxGen = 1;
tiling.maxGen = 0;
tiling.initial = 'rhomb';
tiling.initial = 'small square';
tiling.fixedSize = true;


// the different substitution rules
var square, rhomb, triangle;
const squares = [];
const rhombs = [];
const triangles = [];

// choices
tiling.rhomb = 1;
tiling.triangle = 1;
tiling.square = 1;

const rhombAreas = new Areas({
    color: '#ff0000'
});
// actually quarter squares
const squareAreas = new Areas({
    color: '#00ff00'
});
const triangleAreas = new Areas({
    color: '#0000ff'
});


/**
 * setting up the tiling user interface
 * @method main.setupTilingUI
 */
main.setupTilingUI = function() {
    const gui = main.gui;
    const linesGui = gui.addFolder('lines and markers');
    tiles.makeUI(true, true, true, linesGui);
    const tilesGui = gui.addFolder('tiles');
    rhombAreas.makeUI('rhomb', false, tilesGui);
    squareAreas.makeUI('square', false, tilesGui);
    triangleAreas.makeUI('triangle', false, tilesGui);
    BooleanButton.whiteBackground();
    const mapsGui = gui.addFolder('mappings');
    tiling.rhombUpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'rhombUpperImage',
        labelText: 'rhomb',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });
    tiling.squareUpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'squareUpperImage',
        labelText: 'square',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });
    tiling.triangleUpperImage = true;
    mapsGui.add({
        type: 'boolean',
        params: tiling,
        property: 'triangleUpperImage',
        labelText: 'triangle',
        buttonText: ['up', 'down'],
        onChange: function() {
            main.drawMapChanged();
        }
    });

    const subsGui = gui.addFolder('choice for substitution rules');

    const rhombController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'rhomb',
        options: [1, 2],
        onChange: function() {
            rhomb = rhombs[tiling.rhomb];
            draw();
        }
    });

    const triangleController = subsGui.add({
        type: 'selection',
        params: tiling,
        property: 'triangle',
        options: [1, 2],
        onChange: function() {
            triangle = triangles[tiling.triangle];
            draw();
        }
    });

    const squareController = subsGui.add({
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
    gui.add({
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
            main.drawMapChanged();
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
            main.drawMapChanged();
        }
    });

    BooleanButton.whiteBackground();
    const fixedSizeController = gui.add({
        type: 'boolean',
        params: tiling,
        labelText: 'tile size',
        buttonText: ['fixed', 'variable'],
        property: 'fixedSize',
        onChange: function() {
            main.drawMapChanged();
        }
    });
};

main.setup();
// switching to showing the tiling
map.whatToShowController.setValueOnly("tiling");

/**
 * making the tiling
 * @method main.makeTiling
 */
main.makeTiling = function() {
    // first clear things
    rhombAreas.clear();
    squareAreas.clear();
    triangleAreas.clear();
    tiles.clear();
    tile();
};

/**
 * drawing the tiling
 * @method main.drawTiling
 */
main.drawTiling = function() {
    Lines.initDrawing();
    rhombAreas.draw();
    squareAreas.draw();
    triangleAreas.draw();
};


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
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            tiles.quarterSquare(true, tiling.squareUpperImage, brX, brY, blX, blY, tlX, tlY, trX, trY);
            squareAreas.add(blX, blY, brX, brY, trX, trY, tlX, tlY);
        } else {
            gen += 1;
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.535898385 = 2 / (2 + rt3);
            const upX = 0.535898385 * (tlX - blX);
            const upY = 0.535898385 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
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
    // 0.267949192=tan(Math.PI/12);
    const hX = -0.267949192 * (cY - bY);
    const hY = 0.267949192 * (cX - bX);
    const rX = cX - hX;
    const rY = cY - hY;
    const lX = cX + hX;
    const lY = cY + hY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            rhombAreas.add(bX, bY, rX, rY, tX, tY, lX, lY);
            tiles.rhomb30(false, tiling.rhombUpperImage, bX, bY, rX, rY, tX, tY, lX, lY);
        } else {
            gen += 1;
            // 0.267949192=1/(2+rt3)
            const rightX = 0.267949192 * (rX - bX);
            const rightY = 0.267949192 * (rY - bY);
            const upX = -rightY;
            const upY = rightX;
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

rhomb = rhombs[1];



// make the tiling for various initial patterns

const size = 2;

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
            tiles.outlines.addClosed(-s / 4, -s / 4, -s / 4, s / 4, s / 4, s / 4, s / 4, -s / 4);
            break;
        case 'rhomb':
            rhomb(0, -z, 0, z, 0);
            const h = Math.tan(Math.PI / 12) * z;
            tiles.outlines.addClosed(-z, 0, 0, h, z, 0, 0, -h);
            break;
        case 'triangle':
            triangle(0, 0, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(0, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'full triangle':
            fullTriangle(0, -rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            tiles.outlines.addClosed(-rt32 * r, -r / 2, rt32 * r, -r / 2, 0, r);
            break;
        case 'big square':
            fullSquare(0, -s / 2, -s / 2, s / 2, s / 2);
            tiles.outlines.addClosed(-s / 2, -s / 2, -s / 2, s / 2, s / 2, s / 2, s / 2, -s / 2);
            break;
        case 'dodecagon':
            for (let i = 0; i < 12; i++) {
                rhomb(0, 0, 0, secondX[i], secondY[i]);
                const mX = 0.5 * (secondX[i] + secondX[i + 1]);
                const mY = 0.5 * (secondY[i] + secondY[i + 1]);
                triangle(0, mX, mY, secondX[i], secondY[i], basicX[i + 1], basicY[i + 1]);
                triangle(0, mX, mY, secondX[i + 1], secondY[i + 1], basicX[i + 1], basicY[i + 1]);
                tiles.outlines.addOpen(secondX[i - 1], secondY[i - 1], secondX[i], secondY[i]);
            }
            break;
    }
}

main.drawMapChanged();